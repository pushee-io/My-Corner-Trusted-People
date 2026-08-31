# My Corner Delivery Roadmap

Last updated: 2026-08-12
Status authority: implementation and executed test evidence, not planned work

## Delivery principles

- Build and verify one complete vertical slice at a time.
- Keep exact addresses, identity evidence, private media, and credentials protected by default.
- Use fictional or consented test data until production services are approved.
- Keep production deployments, paid services, identity verification, legal-language changes, and app-store publication behind founder approval.
- Treat images and videos as product capabilities with storage, privacy, accessibility, moderation, connectivity, and deletion requirements.

## Current baseline

- Module 1 requester and provider request flow exists.
- Secure local session persistence, explicit sign-out, requester restoration, and provider restoration passed Android device checks.
- Events has a substantial implementation but remains feature-flagged pending final verification and activation approval.
- Image policy foundations exist for service requests, reports, neighborhood posts, group posts, Marketplace listings, and Events.
- Real device image selection, upload, persistence, display, moderation, retry, and deletion are not complete.
- Video selection and upload are not implemented. The current image-only policy rejects video MIME types.

## Roadmap sequence

### Phase 1 - Account recovery

Outcome: a pilot user can recover account access safely.

- Password reset request and confirmation
- Non-enumerating responses
- Expiring recovery links or codes
- Rate limiting and audit events
- Accessible success, error, expired-link, and retry states
- Force-close and session regression tests

Exit gate: recovery works on a preview build without exposing whether an unrelated account exists.

### Phase 2 - Groups and membership

Outcome: verified residents can discover appropriate groups and request controlled access.

- Discover eligible groups
- Request to join
- Approve, reject, remove, leave, block, and report
- Membership states: not joined, pending, accepted, rejected, removed
- Moderator queue and audit history
- Group types: neighborhood clubs, HOAs, school communities, faith groups, and sports groups
- Private posts and membership-scoped access
- Loading, empty, offline, error, and permission states

Exit gate: membership authorization passes database policy tests and Android requester/moderator device flows.

### Phase 3 - Events completion

Outcome: eligible residents can discover, create, manage, join, and safely attend events.

- Verify the live Events repository and route-level feature gate
- Creation, RSVP, capacity, waitlist, reminders, invitations, reporting, and cancellation
- Audited private-location release
- Compact-phone and tablet verification
- Keep Events disabled until staging data, RLS, accessibility, and device gates pass

Exit gate: founder approval is required before enabling Events outside controlled development testing.

### Phase 4 - Images vertical slice

Outcome: users can add useful photographs across supported surfaces without exposing private data.

Surfaces:

- Service request photos
- Safety and abuse report evidence
- Neighborhood and group post images
- Marketplace listing images
- Event cover and gallery images
- Provider profile and credential images where approved
- Job Safety Session evidence where explicitly permitted

Capabilities:

- Camera and gallery selection
- Preview, remove, reorder, crop where useful, and accessible descriptions
- Compression and orientation correction
- Metadata stripping, including location metadata
- Private Supabase Storage buckets with deny-by-default RLS
- Signed delivery URLs where access is authorized
- Upload progress, cancellation, retry, duplicate prevention, and offline recovery
- Text and image moderation with human escalation
- Thumbnail generation, caching, lazy loading, and failed-image states
- Retention, user deletion, moderator preservation rules, and audit events
- Data-saver behavior and upload-size limits

Exit gate: one end-to-end image upload must pass first on service requests, then the proven pipeline may expand to Marketplace, Groups, Events, reports, and profiles.

### Phase 5 - Bounded video vertical slice

Outcome: users can attach short, purposeful clips after the image pipeline is proven safe and reliable.

Surfaces:

- Service request clarification
- Safety report evidence
- Neighborhood and group posts
- Marketplace listings
- Events

Capabilities:

- Record or select short video
- Explicit duration, file-size, resolution, and supported-format limits
- Compression or transcoding through a trusted backend
- Poster-frame and thumbnail generation
- Resumable upload, progress, retry, and cancellation
- Captions and accessible playback controls
- No autoplay on mobile data
- Reduced-motion and data-saver behavior
- Private signed playback URLs and authorization checks
- Text, thumbnail, and video safety screening with human review
- Reporting, retention, deletion, and audit trails

Exclusions for the first video slice:

- Live streaming
- Automatic public playback
- Unlimited-length uploads
- Background recording
- Continuous location-video monitoring

Exit gate: image security and moderation gates must pass first; then one short-video surface must pass Android device, slow-network, storage-policy, moderation, and deletion tests before expansion.

### Phase 6 - Marketplace coordination

Outcome: neighbors can coordinate a listing exchange safely.

- Listing images using the verified media pipeline
- Pickup coordination using general-area information first
- Precise meetup details released only through an approved workflow
- Marketplace messaging and reporting
- Listing reservation, completion, cancellation, and dispute states
- Optional short listing video only after Phase 5 passes

Exit gate: no exact home address is publicly exposed and pickup access is auditable.

### Phase 7 - Production verification services

Outcome: test verification paths are replaced with production-grade services.

- Real SMS verification
- Ghana phone normalization
- Address and GhanaPost GPS validation
- Residence-assurance provider abstraction
- Provider identity and credential workflows where approved
- Consent, retention, deletion, appeals, and human review
- Vendor failure and fallback behavior

Approval gate: paid vendors, biometric or face processing, background checks, and legal/privacy changes require founder approval and qualified review.

### Phase 8 - Push notifications

Outcome: users receive useful, consented updates without leaking private content.

- Request and provider status updates
- Replies and group membership changes
- Marketplace messages and pickup updates
- Event reminders and changes
- Verification updates
- Nearby and agency alerts from authorized sources only
- Permission education, preferences, quiet hours, token lifecycle, retries, and delivery monitoring
- Privacy-safe notification previews

Exit gate: authenticated membership, preferences, production verification dependencies, and notification-token security must be ready.

### Phase 9 - Agency broadcasts

Outcome: authorized agencies can publish attributable local notices.

- Police, fire, city, and utility notices
- Emergency alerts
- Verified publisher roles and approval workflow
- Geographic targeting without exposing resident locations
- Corrections, expiry, audit history, and abuse prevention
- Push delivery only after Phase 8 gates pass

Exit gate: agency identity and authority must be operationally verified; community users cannot impersonate official publishers.

### Phase 10 - Job Safety Session

Outcome: Requester and Provider can record an agreed arrival and job session without implying guaranteed safety.

- Accepted request and agreed appointment
- Requester-controlled precise location pin
- Time-bounded location release with explicit consent and audit logging
- Provider identity evidence appropriate to the approved verification level
- Short-lived, one-use arrival PIN
- Job-in-progress state on both devices after valid PIN entry
- Start time, participants, consent events, status changes, and authorized location-access record
- End-job confirmation by both parties
- Exception flow when one party cannot or will not confirm completion
- Safety report, emergency guidance, retention, and access controls

Required language:

- The PIN records mutual arrival confirmation; it does not guarantee identity or conduct.
- The record may support investigation; it is not an automatic finding of liability.
- My Corner does not guarantee provider conduct.

Approval gate: Google Maps or another paid geocoding service, precise-location processing, face matching, identity verification, continuous tracking, and legal-language changes require separate founder approval.

## Cross-cutting verification

Every phase must include:

- Formatting, linting, strict type checking, unit tests, integration tests, and build verification
- RLS and authorization tests for private data
- Compact-phone and tablet layouts
- TalkBack, text scaling, touch targets, labels, errors, and focus states
- Slow-network, offline, retry, duplicate-action, and interrupted-upload behavior
- Moderation, reporting, blocking, appeals, and human escalation where relevant
- No secrets in the mobile app or repository
- Evidence recorded before a feature is described as complete

## Next implementation recommendation

1. Password reset.
2. Groups membership.
3. Events verification.
4. Service-request image upload as the first real media slice.
5. Expand images to Marketplace, Groups, Events, and reports.
6. Implement one bounded short-video slice only after image gates pass.
