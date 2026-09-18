# My Corner — implementation plan

## Active: approved VC media activation

- [x] Inspect live main and Preview media/storage contracts.
- [ ] A: Shared foundation and tests published in draft PR #102 after explicit chat approval. Cleanup, full integration and CI remain pending.
- [ ] B: Profile pictures, replacement/removal and consistent avatars.
- [ ] C: Neighborhood Feed images and video.
- [ ] D: Hire request media restricted to participants.
- [ ] E: Group avatar/cover and member post media.
- [ ] F: Event cover/gallery/video under existing audience rules.
- [ ] G: Marketplace video preserving existing images and pickup privacy.
- [ ] H: Cross-surface security/performance and Android device verification.

The founder explicitly adopted the directive and approved publishing the foundation in PR #102 on 2026-09-18. The initial implementation is published at `f17ad80`; verify the latest PR checks and keep the PR draft until technical gates pass. See `docs/VC_MEDIA_CHECKPOINT_A_REVIEW.md`.

Each checkpoint requires targeted tests, formatting, lint, typecheck, privacy review, pushed PR and successful CI before merge. Maintain continuity before long operations. No paid EAS build or production deployment is authorized for this milestone.

## Completed verification

PR #101 offline session/profile restoration is merged. Founder device observations confirm reconnect recovery, network banner, explicit sign-out persistence and cross-account isolation. Native compact/tablet/accessibility gate is complete.

## Deferred

Unified notifications, organization/agency publishing, production verification adapters and release hardening remain outside this media milestone.
