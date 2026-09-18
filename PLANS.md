# My Corner — implementation plan

## Active: VC media activation

- [x] Inspect live main and Preview media/storage contracts.
- [ ] A: Shared media foundation, private storage, validation, reusable picker/gallery and tests.
- [ ] B: Profile pictures, replacement/removal and consistent avatars.
- [ ] C: Neighborhood Feed images and video.
- [ ] D: Hire request media restricted to participants.
- [ ] E: Group avatar/cover and member post media.
- [ ] F: Event cover/gallery/video under existing audience rules.
- [ ] G: Marketplace video preserving existing images and pickup privacy.
- [ ] H: Cross-surface security/performance and Android device verification.

Each checkpoint requires targeted tests, formatting, lint, typecheck, privacy review, pushed PR and successful CI before merge. Maintain continuity before long operations. No paid EAS build or production deployment is authorized for this milestone.

## Completed verification

PR #101 offline session/profile restoration is merged. Founder device observations confirm reconnect recovery, network banner, explicit sign-out persistence and cross-account isolation. Native compact/tablet/accessibility gate is complete.

## Deferred

Unified notifications, organization/agency publishing, production verification adapters and release hardening remain outside this media milestone.
