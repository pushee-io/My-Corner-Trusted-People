// Run only against an explicitly authorized Preview project. Credentials and
// fixture IDs live outside git; this script never prints tokens or signed URLs.
// MEDIA_QA_CONFIG supplies url, anonKey, two fictional accounts, post, fixtureDir.
import { createClient } from "@supabase/supabase-js";
import jpeg from "jpeg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

const configPath = process.env.MEDIA_QA_CONFIG;
if (!configPath) {
  throw new Error(
    "Set MEDIA_QA_CONFIG to the private Preview fixture configuration",
  );
}
const config = JSON.parse(readFileSync(configPath, "utf8"));
if (!config.accounts.every((a) => a.email.endsWith("@example.invalid"))) {
  throw new Error("Only fictional test accounts are allowed");
}
const clients = config.accounts.map(() =>
  createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
);
const [owner, outsider] = clients;
const results = [];
const report = (name, passed, detail) => {
  results.push({ name, passed, ...(detail ? { detail } : {}) });
  writeFileSync(
    join(config.fixtureDir, "results.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(
    `${passed ? "PASS" : "FAIL"} ${name}${detail ? ": " + detail : ""}`,
  );
  if (!passed) throw new Error(name);
};
const ok = (r, label) => {
  if (r.error) throw new Error(`${label}: ${r.error.message}`);
  return r.data;
};
async function reserve(surface, kind) {
  const id = randomUUID();
  config.fixtureIds.push(id);
  writeFileSync(configPath, JSON.stringify(config));
  return ok(
    await owner.rpc("begin_media_upload", { surface, kind, upload_id: id }),
    "reserve",
  );
}
async function upload(path, bytes, mime) {
  const ticket = ok(
    await owner.storage.from("media-originals").createSignedUploadUrl(path),
    "signed upload",
  );
  ok(
    await owner.storage.from("media-originals").uploadToSignedUrl(
      path,
      ticket.token,
      bytes,
      { contentType: mime },
    ),
    "upload",
  );
}
async function processAsset(asset) {
  const started = performance.now();
  const r = await owner.functions.invoke("process-media", {
    body: { assetId: asset.id },
  });
  if (r.error) {
    let message = r.error.message;
    if (r.error.context?.json) {
      message = (await r.error.context.json()).error ?? message;
    }
    throw new Error(`processor: ${message}`);
  }
  report(
    `${asset.media_type} processed`,
    r.data.status === "ready",
    `${Math.round(performance.now() - started)} ms`,
  );
}
async function download(asset) {
  const signed = ok(
    await owner.storage.from("shared-media").createSignedUrl(
      asset.storage_path,
      60,
    ),
    "signed read",
  );
  const response = await fetch(signed.signedUrl);
  report(`${asset.media_type} signed read`, response.ok);
  return Buffer.from(await response.arrayBuffer());
}
try {
  for (const [i, client] of clients.entries()) {
    ok(
      await client.auth.signInWithPassword(config.accounts[i]),
      "fixture sign-in",
    );
  }
  const raw = Buffer.alloc(640 * 360 * 4, 255);
  const image = Buffer.from(
    jpeg.encode({ data: raw, width: 640, height: 360 }, 75).data,
  );
  const marker = Buffer.from("Exif\0\0FICTIONAL_GPS_DEVICE_TAG");
  const app1 = Buffer.alloc(marker.length + 4);
  app1[0] = 255;
  app1[1] = 225;
  app1.writeUInt16BE(marker.length + 2, 2);
  marker.copy(app1, 4);
  const tagged = Buffer.concat([image.subarray(0, 2), app1, image.subarray(2)]);
  writeFileSync(join(config.fixtureDir, "photo-original.jpg"), tagged);

  const photo = await reserve("profile", "image");
  const before = await owner.functions.invoke("process-media", {
    body: { assetId: photo.id },
  });
  report(
    "unfinished upload stays retryable",
    !!before.error && before.error.context?.status === 409,
  );
  await upload(photo.storage_path, tagged, "image/jpeg");
  const rawRead = await owner.storage.from("media-originals").download(
    photo.storage_path,
  );
  report("raw original unreadable even by owner", !!rawRead.error);
  const otherProcess = await outsider.functions.invoke("process-media", {
    body: { assetId: photo.id },
  });
  report(
    "other account cannot process upload",
    !!otherProcess.error && otherProcess.error.context?.status === 403,
  );
  await processAsset(photo);
  const repeat = await owner.functions.invoke("process-media", {
    body: { assetId: photo.id },
  });
  report(
    "processing retry is idempotent",
    !repeat.error && repeat.data.status === "ready",
  );
  const cleanPhoto = await download(photo);
  writeFileSync(join(config.fixtureDir, "photo-clean.jpg"), cleanPhoto);
  const decoded = jpeg.decode(cleanPhoto);
  report(
    "JPEG metadata stripped and pixels decodable",
    !cleanPhoto.includes(marker) && decoded.width === 640 &&
      decoded.height === 360,
  );
  report(
    "JPEG server output differs from original",
    createHash("sha256").update(cleanPhoto).digest("hex") !==
      createHash("sha256").update(tagged).digest("hex"),
  );
  const foreignRead = await outsider.storage.from("shared-media")
    .createSignedUrl(photo.storage_path, 60);
  report("other account cannot mint read URL", !!foreignRead.error);
  const foreignRows = ok(
    await outsider.from("media_assets").select("id").eq("id", photo.id),
    "outsider metadata",
  );
  report("other account cannot read metadata", foreignRows.length === 0);
  const forgedPath = `${config.accounts[1].id}/${randomUUID()}/media.jpg`;
  report(
    "forged original path denied",
    !!(await owner.storage.from("media-originals").createSignedUploadUrl(
      forgedPath,
    )).error,
  );
  report(
    "client cannot write processed bucket",
    !!(await owner.storage.from("shared-media").upload(forgedPath, image, {
      contentType: "image/jpeg",
    })).error,
  );
  ok(
    await owner.rpc("attach_media", {
      surface: "profile",
      target: config.accounts[0].id,
      asset_ids: [photo.id],
      replace_existing: false,
    }),
    "attach photo",
  );
  report("ready photo attaches to owning profile", true);

  const video = await reserve("neighborhood_post", "video");
  await upload(
    video.storage_path,
    readFileSync(join(config.fixtureDir, "video.mp4")),
    "video/mp4",
  );
  await upload(
    `${config.accounts[0].id}/${video.id}/poster.jpg`,
    tagged,
    "image/jpeg",
  );
  await processAsset(video);
  const cleanVideo = await download(video);
  writeFileSync(join(config.fixtureDir, "video-clean.mp4"), cleanVideo);
  report(
    "MP4 location and device tags removed",
    !cleanVideo.includes(Buffer.from("FICTIONAL_DEVICE_TAG")) &&
      !cleanVideo.includes(Buffer.from("+01.2345")),
  );
  ok(
    await owner.rpc("attach_media", {
      surface: "neighborhood_post",
      target: config.post,
      asset_ids: [video.id],
      replace_existing: false,
    }),
    "attach video",
  );
  report("video attaches to authorized Feed parent", true);
  report(
    "outsider denied attached Feed media",
    !!(await outsider.storage.from("shared-media").createSignedUrl(
      video.storage_path,
      60,
    )).error,
  );

  const invalid = await reserve("profile", "image");
  await upload(invalid.storage_path, Buffer.from("not a JPEG"), "image/jpeg");
  const bad = await owner.functions.invoke("process-media", {
    body: { assetId: invalid.id },
  });
  report(
    "spoofed JPEG rejected without publishing",
    !!bad.error && bad.error.context?.status === 422,
  );
  const invalidRead = await owner.storage.from("shared-media").createSignedUrl(
    invalid.storage_path,
    60,
  );
  report("invalid media has no readable output", !!invalidRead.error);
  ok(
    await owner.rpc("remove_media", { asset_id: invalid.id }),
    "remove failed upload",
  );
  ok(await owner.rpc("remove_media", { asset_id: photo.id }), "remove photo");
  report(
    "removed media immediately denies new signed reads",
    !!(await owner.storage.from("shared-media").createSignedUrl(
      photo.storage_path,
      60,
    )).error,
  );
  const cleanup = await fetch(`${config.url}/functions/v1/cleanup-media`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      "x-media-cleanup-token": "x".repeat(72),
    },
  });
  report(
    "cleanup rejects public key and forged worker credential",
    cleanup.status === 401,
  );
} finally {
  await Promise.allSettled(clients.map((client) => client.auth.signOut()));
}
