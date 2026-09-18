import type { SupabaseClient } from "@supabase/supabase-js";

export async function runMediaCleanup(admin: SupabaseClient) {
  const { data: jobs, error } = await admin.rpc("claim_media_cleanup", {
    batch_size: 20,
  });
  if (error) throw new Error("Could not claim cleanup work");
  let removed = 0;
  let deferred = 0;
  for (const job of jobs ?? []) {
    // Defense in depth: even a corrupt queue cannot delete another bucket/path.
    const allowed =
      ["media-originals", "shared-media"].includes(job.bucket_id) &&
      /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/(media\.(jpg|mp4)|poster\.jpg)$/.test(
        job.object_path,
      );
    let succeeded = false;
    if (allowed) {
      try {
        const result = await admin.storage.from(job.bucket_id).remove([
          job.object_path,
        ]);
        succeeded = !result.error;
      } catch {
        /* Lost connections are retried; missing objects are idempotent. */
      }
    }
    const receipt = await admin.rpc("finish_media_cleanup", {
      job_id: job.id,
      claim_token: job.lease_token,
      succeeded,
    });
    if (receipt.error || !receipt.data || !succeeded) deferred++;
    else removed++;
  }
  return { claimed: jobs?.length ?? 0, removed, deferred };
}
