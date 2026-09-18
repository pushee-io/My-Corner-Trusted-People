import { createClient } from "@supabase/supabase-js";
import { runMediaCleanup } from "../_shared/cleanup-media.ts";

// Scheduled server-to-server endpoint. JWT gateway verification is disabled
// ONLY because this body atomically consumes a short-lived worker ticket.
// A user JWT, a public key or a replayed ticket never authorizes a cleanup run.
Deno.serve(async (request) => {
  const reply = (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  if (request.method !== "POST") {
    return reply({ error: "Method not allowed" }, 405);
  }
  const token = request.headers.get("x-media-cleanup-token");
  if (!token || token.length !== 72) {
    return reply({ error: "Unauthorized" }, 401);
  }
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(15_000) }),
      },
    },
  );
  try {
    const { data: allowed, error } = await admin.rpc(
      "authorize_media_cleanup",
      { worker_token: token },
    );
    if (error || allowed !== true) return reply({ error: "Unauthorized" }, 401);
    return reply(await runMediaCleanup(admin));
  } catch {
    // No paths, signed URLs, credentials, or provider errors enter logs/responses.
    return reply({ error: "Cleanup temporarily unavailable" }, 503);
  }
});
