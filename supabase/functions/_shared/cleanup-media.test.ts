import { test } from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runMediaCleanup } from "./cleanup-media.ts";

test("Storage API deletion retries failures, rejects foreign buckets and acknowledges only a matching claim", async () => {
  const removed: string[] = [];
  const receipts: unknown[] = [];
  const path =
    "81000000-0000-4000-8000-000000000001/82000000-0000-4000-8000-000000000001/media.jpg";
  const jobs = [
    {
      id: "one",
      bucket_id: "shared-media",
      object_path: path,
      lease_token: "a",
    },
    {
      id: "two",
      bucket_id: "media-originals",
      object_path: path,
      lease_token: "b",
    },
    {
      id: "three",
      bucket_id: "listing-images",
      object_path: path,
      lease_token: "c",
    },
  ];
  const client = {
    rpc: async (name: string, args: unknown) => {
      if (name === "claim_media_cleanup") return { data: jobs };
      receipts.push(args);
      return { data: true };
    },
    storage: {
      from: (bucket: string) => ({
        remove: async (paths: string[]) => {
          removed.push(bucket + ":" + paths[0]);
          if (bucket === "media-originals") {
            throw new Error(
              "network interrupted",
            );
          }
          return { error: null };
        },
      }),
    },
  } as unknown as SupabaseClient;
  assert.deepEqual(await runMediaCleanup(client), {
    claimed: 3,
    removed: 1,
    deferred: 2,
  });
  assert.equal(removed.length, 2);
  assert.deepEqual(
    receipts,
    jobs.map((j, i) => ({
      job_id: j.id,
      claim_token: j.lease_token,
      succeeded: i === 0,
    })),
  );
});
