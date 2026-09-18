# MY CORNER — VC DEMO MEDIA ACTIVATION DIRECTIVE
## PROFILE PHOTOS + IMAGE/VIDEO UPLOAD ACROSS CORE APP

PROJECT:
My Corner

POSITIONING:
My Corner — The Neighborhood Operating System for Africa

THESIS:
“We believe the neighborhood is the missing organizing layer of Africa’s digital economy.”

SUPPORTING DESCRIPTION:
One trusted, location-aware network connecting people, communities, local services, businesses and commerce.

PRODUCT VERBS:
Connect. Discover. Hire. Buy. Sell. Participate.

REPOSITORY:
pushee-io/My-Corner-Trusted-People

LOCAL REPOSITORY:
 /Users/pushpakhemchand/My-Corner-Trusted-People

MOBILE APP:
 /Users/pushpakhemchand/My-Corner-Trusted-People/mobile

==================================================
PRIMARY OBJECTIVE
==================================================

The current verification checkpoint is complete.

We are actively pitching My Corner to venture capital investors.

The next priority is to make the current application visually rich, interactive, and demonstrable.

ACTIVATE AND COMPLETE MEDIA SUPPORT ACROSS THE CORE MY CORNER EXPERIENCE.

The VC demo should visibly demonstrate that My Corner is not a static prototype.

Users should be able to:

- create profiles with profile pictures
- post neighborhood updates with images
- post neighborhood updates with video
- request help and attach images of work that needs to be done
- request help and attach short videos showing the work/problem
- create and participate in Groups with image/video posts
- create Events with strong visual media
- upload Event images and videos
- create Marketplace listings with existing images
- add VIDEO to Marketplace listings

The implementation must use a SHARED media architecture.

DO NOT create a separate uploader/storage system for every feature.

==================================================
IMPORTANT DEVELOPMENT RULE
==================================================

This is now a PRODUCT IMPLEMENTATION checkpoint.

Do not return another long planning-only response.

Inspect the live repository.

Determine what already exists.

Then implement the media activation systematically.

The repository is the source of truth.

Do not assume the older documentation reflects current code.

Do not rebuild:

- Trusted Hire
- Job Safety Session
- Marketplace
- Neighborhood Feed
- Groups
- Events
- Profile system

Extend them.

==================================================
VC DEMO GOAL
==================================================

When an investor sees My Corner, the application should immediately feel like a modern neighborhood network rather than a wireframe.

The following should be visually obvious:

PROFILE
→ real profile photos

NEIGHBORHOOD FEED
→ photo posts
→ video posts

HIRE
→ requester can visually show the problem

GROUPS
→ rich photo/video community posts

EVENTS
→ visual event discovery

MARKETPLACE
→ image + video product/listing presentation

Media should feel native to the product rather than bolted on.

==================================================
PHASE 1 — INSPECT EXISTING MEDIA ARCHITECTURE
==================================================

BEFORE CREATING ANY NEW MEDIA CODE:

Search the repository for:

- media
- media_assets
- attachments
- images
- image upload
- video
- storage
- Supabase Storage
- signed URLs
- marketplace images
- post images
- Expo Image Picker
- Expo Camera
- document/image picker
- video picker
- thumbnails
- compression
- media moderation
- attachment repositories
- feature flags

Inspect:

- database migrations
- Storage buckets
- Storage policies
- RLS
- media contracts/types
- repositories
- hooks
- upload helpers
- Marketplace image code
- existing Feed media code
- existing profile/avatar code

Return a concise architecture finding:

EXISTING AND REUSABLE
PARTIAL
MISSING
DUPLICATE/SHOULD CONSOLIDATE

Then implement.

Do not create duplicate infrastructure if equivalent functionality already exists.

==================================================
PHASE 2 — SHARED MEDIA PLATFORM
==================================================

Create or complete ONE reusable media system that supports:

IMAGE
VIDEO

The shared architecture must support multiple parent surfaces.

At minimum:

PROFILE
NEIGHBORHOOD_POST
HIRE_REQUEST
GROUP_POST
EVENT
MARKETPLACE_LISTING

Design it so later it can also support:

BUSINESS_PROFILE
AGENCY_BROADCAST
LOCAL_DEAL

without another architecture rewrite.

==================================================
SHARED MEDIA RECORD
==================================================

Use current repository naming if an equivalent already exists.

The conceptual media record should support:

- id
- ownerId
- parentType
- parentId
- mediaType
- storagePath
- mimeType
- byteSize
- width
- height
- duration
- thumbnail/posterPath
- sortOrder
- altText/caption
- moderationStatus
- processingStatus
- visibility
- createdAt
- updatedAt

Do NOT blindly create a new table if current tables can safely support this.

==================================================
MEDIA TYPES
==================================================

Support:

IMAGE
VIDEO

Image examples:

- jpg
- jpeg
- png
- webp
- supported mobile image formats

Video:

Use mobile-compatible formats supported by the current Expo/React Native environment.

Prefer a safe, practical VC-demo implementation rather than an unnecessarily complicated production transcoding platform.

==================================================
MEDIA PICKER UX
==================================================

Create a reusable:

Add media

interaction.

When tapped, users should have appropriate choices such as:

Take photo
Choose photo
Record video
Choose video

Use only capabilities supported by the current application environment.

Handle Android permissions correctly.

Do not crash when permission is denied.

==================================================
UPLOAD UX
==================================================

The experience should show:

- selected preview
- upload progress
- processing state
- successful upload
- failure
- retry
- remove
- replace
- reorder where multiple media items are allowed

The user must not lose their entire post/request because one upload fails.

==================================================
MEDIA SECURITY
==================================================

This is mandatory.

Validate:

- authenticated user
- permission to modify the parent entity
- file type
- MIME type
- file signature where practical
- file size
- image dimensions
- video duration
- media count
- ownership
- storage path
- visibility

Never trust only a filename extension.

==================================================
METADATA PRIVACY
==================================================

Strip or prevent exposure of:

- GPS EXIF
- camera/device metadata
- hidden location metadata

especially before media becomes visible in:

- Neighborhood Feed
- Groups
- Events
- Marketplace
- Profile

A user posting a photo must not inadvertently reveal their home coordinates.

==================================================
STORAGE VISIBILITY
==================================================

Do not make all uploaded files globally public.

Use visibility appropriate to the parent.

Examples:

PUBLIC/PROFILE-SAFE

Profile images where product privacy permits.

NEIGHBORHOOD

Neighborhood Feed media.

GROUP

Private/group-scoped media.

EVENT

Audience-controlled event media.

REQUEST PARTICIPANTS

Hire request attachments.

MARKETPLACE PUBLIC

Public listing media.

PRIVATE

Job Safety/report/moderation evidence.

Never make Job Safety evidence public through the new shared media system.

==================================================
PHASE 3 — PROFILE PICTURES
==================================================

ACTIVATE PROFILE PHOTOS.

Settings/Profile should allow:

- Add profile picture
- Change profile picture
- Remove profile picture
- Preview
- Crop appropriately
- Save
- fallback initials/avatar

Display profile pictures consistently in appropriate surfaces such as:

- Neighborhood Feed
- comments
- Groups
- Events
- profile/settings
- requester/provider interaction where appropriate

Do not expose legal identity data simply because a profile picture exists.

==================================================
PROFILE PHOTO DESIGN
==================================================

Use:

- circular avatar in compact interfaces
- appropriate larger profile display
- loading placeholder
- fallback initials

Images should render efficiently.

Do not repeatedly download original full-resolution files for small avatars.

Use thumbnails/variants if current infrastructure supports them.

==================================================
PHASE 4 — NEIGHBORHOOD FEED IMAGE + VIDEO
==================================================

The Neighborhood Feed is a major VC-demo surface.

Users must be able to create:

TEXT POST

TEXT + IMAGE

TEXT + MULTIPLE IMAGES

TEXT + VIDEO

where supported by the shared media limits.

==================================================
POST COMPOSER
==================================================

Add visible media controls to the existing post composer.

Suggested interaction:

What's happening in your neighborhood?

[ Photo ] [ Video ] [ Location where appropriate ]

Media preview appears before publishing.

Users can:

- remove media
- retry upload
- reorder images where supported

==================================================
FEED RENDERING
==================================================

Feed posts should render media elegantly.

IMAGE:

- responsive
- appropriate aspect ratio
- rounded container consistent with design system
- multi-image presentation where needed
- tap to view larger

VIDEO:

- poster/thumbnail
- play control
- inline playback
- pause
- mute/unmute
- full-screen where supported

DO NOT autoplay every Feed video with sound.

Prefer:

muted or user-initiated playback.

Respect reduced-motion/data-saving principles where practical.

==================================================
PHASE 5 — HIRE HELP IMAGE + VIDEO
==================================================

This is a high-value My Corner differentiation.

The REQUESTER must be able to visually show a service provider what needs to be done.

Example:

“My sink is leaking.”

Requester can attach:

- sink photo
- short video of leaking pipe

==================================================
HIRE REQUEST FORM
==================================================

Add a clear section such as:

Photos or video of the work

Supporting text:

Help the provider understand what needs to be done.

Allow:

- images
- short video
- preview
- remove
- upload
- retry

==================================================
HIRE PRIVACY
==================================================

Hire request media is NOT equivalent to a public Neighborhood Feed post.

Access should be limited according to the current Hire/request authorization model.

At minimum:

REQUESTER
ASSIGNED/AUTHORIZED PROVIDER

and authorized moderation/safety personnel only when required by policy.

Do not expose request attachments publicly.

==================================================
HIRE SECURITY
==================================================

Do not change the protected Job Safety Session architecture.

Request media is informational evidence of the work.

It must not:

- reveal exact address publicly
- bypass Job Safety
- reveal unreleased service location
- alter provider authorization
- allow unrelated providers to access attachments

==================================================
PHASE 6 — GROUPS IMAGE + VIDEO
==================================================

Make Groups visibly social and interactive.

Support:

GROUP AVATAR

GROUP COVER IMAGE

GROUP POSTS WITH:

- images
- multiple images
- video

where allowed by current group policies.

==================================================
GROUP PRIVACY
==================================================

Media visibility must inherit Group visibility.

PRIVATE GROUP:

Media must not become accessible to non-members.

PUBLIC/DISCOVERABLE GROUP:

Follow the actual group access policy.

Pay special attention to:

- faith communities
- HOA/resident groups
- adult school communities
- sports groups

Membership privacy remains enforced.

==================================================
PHASE 7 — EVENTS IMAGE + VIDEO
==================================================

Make Events visually compelling for the VC demo.

EVENT CREATION must support:

- cover image
- additional images
- short promotional/event video

EVENT DETAIL should prominently display:

- cover media
- event information
- organizer
- date/time
- location according to privacy rules
- RSVP
- additional media

==================================================
EVENT FEED/DISCOVERY
==================================================

Event cards should use the cover image when available.

Avoid a text-only Event discovery experience.

Use fallback visual treatment where no media exists.

==================================================
EVENT PRIVACY
==================================================

Private event media follows event visibility.

Do not expose private residential addresses through:

- media metadata
- captions
- public event cards
- push notifications
- file URLs

==================================================
PHASE 8 — MARKETPLACE VIDEO
==================================================

Marketplace images already exist.

DO NOT replace the working image implementation unnecessarily.

EXTEND IT.

Add VIDEO support to Marketplace listings.

==================================================
MARKETPLACE LISTING CREATION
==================================================

Seller can add:

- existing images
- at least one short product/item video where allowed

The listing editor should clearly differentiate:

Photos
Video

==================================================
MARKETPLACE DETAIL
==================================================

Marketplace detail should support a media gallery containing:

IMAGE
VIDEO

Video should have:

- poster
- play/pause
- mute control
- full-screen where practical

Do not interfere with the existing private pickup security model.

==================================================
PHASE 9 — MEDIA LIMITS FOR VC DEMO
==================================================

Choose sensible configurable limits.

Do not hard-code arbitrary huge uploads.

Create central configuration for limits such as:

PROFILE:
1 image

FEED:
multiple images OR short video according to chosen UX

HIRE:
multiple photos + short video

GROUP:
multiple images/video

EVENT:
cover + gallery/video

MARKETPLACE:
multiple images + short video

Set practical limits based on the existing architecture and mobile performance.

Document the values.

==================================================
PHASE 10 — VIDEO PERFORMANCE
==================================================

The investor demo must feel fast.

Implement appropriate:

- thumbnail/poster loading
- lazy loading
- video controls
- caching where supported
- image resizing
- upload compression where feasible
- feed virtualization compatibility

Do not make every Feed item preload a full video.

==================================================
PHASE 11 — DEMO MEDIA
==================================================

After functionality works, make the Preview environment visually demonstrable.

Use FICTIONAL, NON-SENSITIVE demo content.

Populate or enable easy creation of examples showing:

PROFILE:
resident profile picture

FEED:
neighborhood photo update
neighborhood video post

HIRE:
plumbing/electrical/repair request with image/video

GROUP:
community post with images/video

EVENT:
event with strong cover media and optional video

MARKETPLACE:
listing with multiple images + product video

Do not use copyrighted or real resident-sensitive material without authorization.

Do not hard-code demo content into production behavior.

If seed/demo data is used:

- Preview/development only
- clearly fictional
- idempotent
- production disabled

==================================================
PHASE 12 — FEATURE FLAGS
==================================================

Inspect the existing feature-flag architecture.

Enable or add appropriate Preview flags such as equivalents of:

profile_images
feed_images
feed_video
hire_media
hire_video
group_media
group_video
event_media
event_video
marketplace_video
shared_media_uploads

Do not blindly use these names if existing flags already cover the functionality.

For the VC Preview environment:

THESE FEATURES SHOULD BE ENABLED.

Production should remain explicitly controlled by server/environment configuration.

==================================================
PHASE 13 — TESTING
==================================================

Add meaningful automated coverage.

At minimum test:

PROFILE
- upload
- replace
- remove
- authorization

FEED
- image attachment
- video attachment
- unauthorized modification
- neighborhood privacy

HIRE
- image attachment
- video attachment
- correct participants can access
- unrelated provider cannot access
- exact-location protections unchanged

GROUPS
- member can upload
- non-member cannot access private group media

EVENTS
- organizer upload
- visibility restrictions

MARKETPLACE
- existing images still work
- new video works
- pickup privacy unaffected

STORAGE
- unauthorized paths denied
- private media not public
- ownership rules

TYPECHECK/LINT
must pass.

RLS/Storage policies
must be tested.

==================================================
PHASE 14 — DEVICE VERIFICATION
==================================================

Test current implementation on:

- Samsung Android phone
- Pixel Tablet Android emulator

Use current source / appropriate Preview development path.

Verify:

PROFILE
✓ add/change photo

FEED
✓ image post
✓ video post
✓ playback

HIRE
✓ requester adds photos
✓ requester adds video
✓ provider sees authorized attachments

GROUP
✓ image post
✓ video post

EVENT
✓ cover image
✓ image/video rendering

MARKETPLACE
✓ current images
✓ new video
✓ video playback

Also inspect:

- portrait
- landscape
- compact phone
- tablet
- permissions
- upload progress
- failure/retry
- network interruption

==================================================
PHASE 15 — VC DEMO QUALITY BAR
==================================================

This is not complete merely because an upload API exists.

The visual result must be presentation-ready.

A VC should be able to watch a 2-3 minute demo and immediately understand:

1. My Corner is a neighborhood network.
2. People have identities/profile images.
3. Neighborhood activity is visual.
4. Residents can show service providers what needs fixing.
5. Groups feel alive.
6. Events feel discoverable.
7. Marketplace is rich and visual.
8. All of these experiences are connected by one platform.

No screen should feel like a developer test harness.

==================================================
IMPLEMENTATION SEQUENCE
==================================================

Use controlled checkpoints.

CHECKPOINT A
Audit + consolidate shared media infrastructure.

CHECKPOINT B
Profile pictures.

CHECKPOINT C
Neighborhood Feed images + video.

CHECKPOINT D
Hire Help images + video.

CHECKPOINT E
Groups images + video.

CHECKPOINT F
Events images + video.

CHECKPOINT G
Marketplace video extension.

CHECKPOINT H
Cross-surface performance/privacy/device verification.

Each checkpoint:

branch
→ implementation
→ targeted tests
→ typecheck
→ lint
→ security/privacy tests
→ diff review
→ commit
→ push
→ PR
→ CI
→ merge
→ update continuity docs

You may continue automatically from one GREEN checkpoint to the next.

Do not require founder confirmation between safe, reversible, non-production checkpoints.

==================================================
DO NOT
==================================================

Do not:

- rebuild working modules
- rewrite entire screens unnecessarily
- create separate upload infrastructure six times
- weaken RLS
- expose private Hire media publicly
- expose private Group media
- expose exact resident locations
- expose Job Safety evidence
- put service-role keys in the mobile app
- hard-code production secrets
- turn on uncontrolled production flags
- perform unrelated dependency upgrades
- run `npm audit fix --force`
- trigger a paid EAS build without founder approval
- deploy to production
- upload real sensitive resident data

==================================================
SESSION CONTINUITY
==================================================

The Founder CoPilot has previously lost temporary execution state.

NO IMPORTANT WORK MAY EXIST ONLY IN THE SESSION.

Before every long operation:

COMMIT AND PUSH.

After each checkpoint update:

docs/CURRENT_STATE.md
docs/SESSION_CHECKPOINT.md
docs/MY_CORNER_MASTER_HANDOFF.md when milestone state changes
PLANS.md
CHANGELOG.md

If the session disappears, another session must be able to continue entirely from GitHub.

==================================================
FOUNDER APPROVAL
==================================================

You are authorized to:

- inspect repository
- create branches
- modify app code
- create non-destructive media migrations
- create/update Storage policies
- create tests
- open PRs
- run CI
- merge safe non-production PRs after required checks pass
- enable these media features in Preview/staging
- add fictional Preview demo media/fixtures where safe

You are NOT authorized without additional founder approval to:

- perform a paid EAS build
- deploy production
- modify production secrets
- perform destructive migration
- enable real commercial billing
- send real SMS
- send real marketing push
- process real identity/biometric data

==================================================
INITIAL RESPONSE
==================================================

Begin with a concise execution report:

1. Current live main SHA
2. Media infrastructure already present
3. Existing Storage buckets/policies
4. Existing Marketplace image architecture
5. Existing Profile image capability
6. Existing Feed media capability
7. Existing Hire attachment capability
8. Existing Group media capability
9. Existing Event media capability
10. Current video capability
11. Exact first implementation checkpoint

Then execute.

Do not stop after producing a plan.

==================================================
DEFINITION OF DONE
==================================================

This VC MEDIA ACTIVATION milestone is complete only when:

✓ profile pictures work
✓ Feed image upload works
✓ Feed video upload works
✓ Feed video playback works
✓ Hire requester image attachment works
✓ Hire requester video attachment works
✓ assigned provider can see authorized Hire media
✓ unrelated users/providers cannot see private Hire media
✓ Groups support images
✓ Groups support video
✓ Events support cover/images
✓ Events support video
✓ Marketplace existing image capability remains intact
✓ Marketplace supports video
✓ shared media architecture is reused
✓ GPS/EXIF privacy is addressed
✓ private/public Storage policy is correct
✓ upload progress/error/retry works
✓ Android phone verified
✓ Android tablet verified
✓ automated tests pass
✓ typecheck passes
✓ lint has zero errors
✓ media privacy/security tests pass
✓ Preview media flags are enabled
✓ all code is committed/pushed
✓ current-state docs are updated

BEGIN NOW.
