import { test } from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";

test("real PostgreSQL enforces media parent, ownership, storage, processing and count boundaries", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      readFileSync(resolve("test-support/media-schema.sql"), "utf8"),
    );
    const migrations = resolve("../migrations");
    const names = [
      "current_profile_id",
      "is_admin_or_moderator",
      "has_verified_neighborhood_membership",
      "has_verified_cluster_membership",
      "can_view_social_group",
      "is_accepted_social_group_member",
      "is_events_feature_enabled",
      "can_manage_event",
      "can_view_event",
      "prepare_event_insert",
      "prepare_event_invitation",
      "validate_event_lifecycle_transition",
    ];
    for (const name of names) {
      let definition: string | undefined;
      for (const path of readdirSync(migrations)
        .filter((x) => x.endsWith(".sql"))
        .sort()) {
        const source = readFileSync(resolve(migrations, path), "utf8");
        const match = source.match(
          new RegExp(
            `create or replace function public\\.${name}\\([\\s\\S]*?\\$\\$;`,
            "i",
          ),
        );
        if (match) definition = match[0];
      }
      if (!definition) throw new Error(`Missing existing helper: ${name}`);
      await db.exec(definition);
    }
    // Preserve the existing Event fixture constraints that full Database CI uses.
    await db.exec(`
      create trigger events_prepare_insert before insert on public.events
        for each row execute function public.prepare_event_insert();
      create trigger event_invitations_prepare before insert on public.event_invitations
        for each row execute function public.prepare_event_invitation();
      create trigger events_validate_lifecycle before update on public.events
        for each row execute function public.validate_event_lifecycle_transition();
    `);
    await db.exec(
      readFileSync(
        resolve(migrations, "20260918035400_shared_media_foundation.sql"),
        "utf8",
      ),
    );
    await db.exec(
      readFileSync(resolve("../tests/shared_media_security.sql"), "utf8"),
    );
  } finally {
    await db.close();
  }
});
