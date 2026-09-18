import { createClient } from "@supabase/supabase-js";
import { sanitizeJpeg, sanitizeMp4 } from "../_shared/sanitize-media.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const response = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { ...cors, "Cache-Control": "no-store" },
  });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response(null, { headers: cors });
  if (request.method !== "POST")
    return response({ error: "Method not allowed" }, 405);
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer "))
    return response({ error: "Sign in to upload media." }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const client = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  // Verify the caller with Auth, never decode and trust a token locally.
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user)
    return response({ error: "Sign in to upload media." }, 401);
  let assetId: string;
  try {
    if (Number(request.headers.get("Content-Length") ?? 0) > 1024)
      return response({ error: "Invalid request." }, 400);
    const body = await request.text();
    if (body.length > 1024) return response({ error: "Invalid request." }, 400);
    assetId = JSON.parse(body).assetId;
    if (!uuid.test(assetId))
      return response({ error: "Invalid media selection." }, 400);
  } catch {
    return response({ error: "Invalid media selection." }, 400);
  }
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (profileError || !profile)
    return response({ error: "Your profile is unavailable." }, 403);
  const { data: asset, error: assetError } = await client
    .from("media_assets")
    .select("*")
    .eq("id", assetId)
    .eq("owner_profile_id", profile.id)
    .single();
  if (assetError || !asset || asset.parent_id)
    return response({ error: "This upload is unavailable." }, 403);
  if (asset.processing_status === "ready")
    return response({ id: asset.id, status: "ready" });
  if (asset.processing_status !== "uploading")
    return response({ error: "Choose this media again." }, 409);
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const posterPath = `${profile.id}/${asset.id}/poster.jpg`;
  try {
    const { data: source, error: downloadError } = await admin.storage
      .from("media-originals")
      .download(asset.storage_path);
    if (downloadError || !source)
      return response({ error: "Upload has not finished. Please retry." }, 409);
    const bytes = new Uint8Array(await source.arrayBuffer());
    const clean =
      asset.media_type === "image" ? sanitizeJpeg(bytes) : sanitizeMp4(bytes);
    let poster;
    if (asset.media_type === "video") {
      const { data: rawPoster, error: posterError } = await admin.storage
        .from("media-originals")
        .download(posterPath);
      if (posterError || !rawPoster)
        return response(
          {
            error:
              "The video preview has not finished uploading. Please retry.",
          },
          409,
        );
      poster = sanitizeJpeg(new Uint8Array(await rawPoster.arrayBuffer()));
    }
    // Paths are assigned by the database; clients cannot override them. No upsert
    // means a concurrent retry cannot replace an already-processed object.
    const save = async (path: string, data: Uint8Array, mime: string) => {
      const { error } = await admin.storage
        .from("shared-media")
        .upload(path, data, {
          contentType: mime,
          cacheControl: "60",
          upsert: false,
        });
      if (
        error &&
        !["409", "400"].includes(
          String("statusCode" in error ? error.statusCode : ""),
        )
      )
        throw error;
      // Storage reports existing immutable objects as 400/Duplicate or 409.
      if (error && !/already exists|duplicate/i.test(error.message))
        throw error;
    };
    await save(asset.storage_path, clean.bytes, asset.mime_type);
    if (poster) await save(posterPath, poster.bytes, "image/jpeg");
    const { data: updated, error: updateError } = await admin
      .from("media_assets")
      .update({
        byte_size: clean.bytes.length,
        width: clean.width,
        height: clean.height,
        duration_seconds: clean.seconds ?? null,
        poster_path: poster ? posterPath : null,
        processing_status: "ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", asset.id)
      .eq("processing_status", "uploading")
      .is("parent_id", null)
      .select("id")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updated)
      return response(
        { error: "This upload changed while processing. Please retry." },
        409,
      );
    // Immediate best effort; the durable database queue repeats this after all
    // signed PUT tokens expire, including a late upload after this removal.
    await admin.storage
      .from("media-originals")
      .remove([asset.storage_path, ...(poster ? [posterPath] : [])]);
    return response({ id: asset.id, status: "ready" });
  } catch (caught) {
    // Failed processing never publishes raw bytes or guesses success. Validation
    // text is safe; unexpected infrastructure messages are not exposed/logged.
    const message =
      caught instanceof Error &&
      /^(Choose|Use|This|The video|Unsupported|Invalid video)/.test(
        caught.message,
      )
        ? caught.message
        : "Media could not be processed. Please retry.";
    return response({ error: message }, 422);
  }
});
