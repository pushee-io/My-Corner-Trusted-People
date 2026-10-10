# MY CORNER — COMPLETE 2026 UI/UX MODERNIZATION CONTINUATION
## CORRECT THE HOME EXPERIENCE • COMPLETE ASK MY CORNER AI • FINISH ALL REMAINING MODERNIZATION WORK
### CLEANER • FASTER • TRUSTWORTHY • RETENTION-FOCUSED • MOBILE-NATIVE

You are working on **My Corner**.

Repository:

`pushee-io/My-Corner-Trusted-People`

My Corner is the **neighborhood operating system for Africa**.

This directive CONTINUES the existing 2026 UI/UX modernization program. It does not replace the original program. Preserve all valid work already completed in earlier phases, correct the parts that do not meet the approved design, and finish the remaining modernization work in controlled, reviewable stages.

The current repository state is the source of truth.

---

# 0. NON-NEGOTIABLE OPERATING RULES

1. Fetch current `main`.
2. Record the current main SHA.
3. Inspect all currently open UI/UX modernization PRs, including the Home/Feed work in progress.
4. Inspect the actual current React Native / Expo implementation before editing.
5. Do not restart the modernization from scratch.
6. Do not discard working Phase A / Phase B / Phase C work merely because visual polish is incomplete.
7. Do not duplicate existing design-system components if they can be safely refined.
8. Do not rewrite backend/data logic unless a UI requirement truly demands it.
9. Do not weaken Supabase RLS.
10. Do not expose private identity, exact location, private messages, verification evidence, internal IDs, or other restricted data.
11. Do not manufacture data, badges, counts, ratings, reviews, provider performance, Agency Broadcasts, notifications, or users.
12. Do not deploy Production.
13. Do not merge major modernization PRs without founder approval.
14. Do not generate unnecessary paid Preview APKs.
15. Exhaust code tests, Android bundle/export, emulator QA, screenshot review, and available Preview/backend verification before requesting a new paid APK.
16. Do not allow screenshot capture or emulator tooling to hang the session indefinitely. One reasonable recovery attempt is enough; then mark the visual check `NOT YET TESTED` and continue.
17. Do not claim completion based only on passing code tests.
18. Preserve smooth navigation and avoid new blank frames, route flashes, tab disappearance, duplicate routes, remounts, or layout jumps.
19. Preserve current working product logic.
20. Treat founder-approved visual references and repository specifications as product requirements, not loose inspiration.

---

# 1. DURABLE DESIGN REFERENCES

The authoritative Home specification is:

`docs/ui-reference/home/HOME_UI_SPEC.md`

The Home visual references are:

`docs/ui-reference/home/current-home.jpg`

`docs/ui-reference/home/approved-home-reference.png`

The written Home specification is authoritative.

If repository image rendering is available, compare the current and approved Home screenshots directly.

If image rendering is unavailable, DO NOT stop. Continue from the written specification.

Do not repeatedly retry inaccessible images.

Approved My Corner AI character assets are stored under:

`mobile/assets/my-corner-ai/characters/`

Current approved full-character files include:

- `character-woman-kente.png`
- `character-older-man.png`
- `character-young-man.png`
- `character-woman-purple.png`

These are branded My Corner AI assets.

Do not redraw, recolor, restyle, replace, or generate substitute characters.

---

# 2. CURRENT FOUNDER REVIEW — HOME IS NOT YET ACCEPTED

The current Home implementation is materially closer to the approved design than the earlier build, but it is NOT accepted yet.

The following defects must be corrected before treating Home as visually complete.

## A. HIRE TRUSTED LOCAL HELP IS EFFECTIVELY INVISIBLE

The current physical-device Home shows the `Hire Trusted Local Help` area with extremely low contrast / faded white treatment.

This is a release-blocking visual defect.

Required correction:

- restore a clearly visible full-width primary CTA
- use the approved Home color treatment
- strong readable label contrast
- correct icon contrast
- no opacity regression
- no transparent overlay
- no disabled-looking appearance unless actually disabled
- no clipping
- no overlap
- preserve existing Hire route and permissions
- preserve pressed/disabled/accessibility states

The approved reference uses a clear green action bar.

The physical device must show this CTA immediately and unmistakably.

---

# 3. HOME COLOR SYSTEM — MATCH THE APPROVED REFERENCE DIRECTION

The Home page must use the same visual language as the approved Home reference.

Do not invent a different Home palette.

Use:

- clean white / off-white page surface
- My Corner brand green for primary active/action states
- deeper green for the Ask My Corner AI feature surface where appropriate
- charcoal/deep slate for primary text
- restrained gray for secondary metadata and neutral controls
- subtle borders
- restrained gold only where the broader design system calls for it
- no large unnecessary saturated-green blocks outside deliberate primary surfaces

The approved reference establishes the hierarchy:

- My Corner brand identity: green
- Ask My Corner AI feature card: prominent deep/brand green treatment
- Hire Trusted Local Help: visible primary green CTA
- content cards: light/neutral
- section labels: clear neutral/charcoal
- navigation: neutral by default, brand green for active destination

Do not allow active controls to look faded, disabled, or accidental.

---

# 4. BOTTOM NAVIGATION ACTIVE-STATE COLOR RULE

The bottom navigation must clearly show the user's CURRENT destination.

Use the My Corner brand green for the active destination.

Examples:

- on Home → Home icon/treatment is green
- on Marketplace → Marketplace icon/treatment is green
- on Settings → Settings icon/treatment is green
- on Search → Search icon/treatment is green
- on the neighborhood/community destination → that destination is green
- on the Hire/provider destination → that destination is green where that navigation destination exists

Inactive destinations should remain neutral / charcoal / gray according to the design system.

Do NOT make every icon green simultaneously.

Do NOT use inconsistent selected-state colors screen by screen.

Create or refine a single reusable active-route rule in BottomNavigation rather than duplicating route-specific color logic.

The active state must remain accessible through more than color alone where practical, for example a subtle selected surface, shape, weight, or semantic state.

---

# 5. ASK MY CORNER AI HOME CARD — CURRENT CHARACTER IS TOO SMALL

The current Home implementation shrinks the approved woman-in-kente character so much that her face and identity are visually lost.

This must be corrected.

## Required Home character treatment

The Home AI card should use a compact PORTRAIT presentation rather than displaying a tiny full-body figure.

The portrait must:

- make the face immediately recognizable
- be visibly larger than the current implementation
- use a clean circular or softly rounded portrait frame
- include a visible but tasteful border/ring that highlights the face
- use a border treatment consistent with My Corner's green/gold design language
- preserve the approved character's colors and identity
- avoid clipping forehead/headwrap, chin, or key identifying details
- remain proportionate on compact Android screens

Do not create a new character.

Do not use an emoji.

Do not substitute a stock avatar.

## Portrait asset strategy

If dedicated portrait assets do not yet exist, create DERIVED portrait assets only from the approved full-character PNGs through deterministic non-generative image cropping/export.

Allowed:

- crop
- resize
- transparent-background preservation
- non-destructive framing
- optimization/compression

Not allowed:

- AI redraw
- recoloring
- facial changes
- wardrobe changes
- identity changes
- replacing the approved art

Store derived portrait assets in a clear durable location such as:

`mobile/assets/my-corner-ai/characters/portraits/`

Use consistent naming.

Example:

- `character-woman-kente-portrait.png`
- `character-older-man-portrait.png`
- `character-young-man-portrait.png`
- `character-woman-purple-portrait.png`

Visually verify every crop before use.

---

# 6. ASK MY CORNER AI — USER MUST BE ABLE TO SELECT A CHARACTER

The current experience does not provide the approved character-selection capability.

Implement a clear, restrained character selector on the dedicated Ask My Corner AI experience.

Requirements:

- show all four approved characters
- use portrait assets for compact selection
- selected character receives a visible active ring / selected treatment
- selection is accessible
- selection does not consume excessive vertical space
- selection persists at least locally for the signed-in user/device unless the existing architecture already provides a better safe persistence mechanism
- changing the character must not reset the current conversation unexpectedly
- selected character identity must be used consistently in the AI header and animation area
- do not mix one character's portrait with another character's full asset
- create a single character configuration/source of truth

Suggested mapping structure:

character id
→ full-body source
→ portrait source
→ accessibility label
→ selected state
→ animation/motion state

Do not require a new backend migration merely to store a cosmetic preference unless there is a strong product reason.

---

# 7. ASK MY CORNER AI — CORRECT HOME-TO-AI FLOW

The current flow still behaves too much like the old sequence:

Home input
→ new page
→ user must interact with a separate Send button / old composer pattern

This is not accepted.

## Correct behavior

### Case A — user enters a question on Home

1. User types into the Home AI input.
2. User taps the INLINE send/arrow icon inside that input.
3. Keyboard dismisses cleanly.
4. Navigate to the dedicated Ask My Corner AI screen.
5. Carry the exact query into the AI experience.
6. Automatically submit that query ONCE after navigation.
7. Do not require a second Send tap.
8. Show the selected My Corner AI character prominently.
9. Enter the THINKING animation/state while the answer is being processed.
10. Render the grounded answer/results.
11. Transition the character to an appropriate success/answer state.
12. Keep the conversation composer available for follow-up questions.

Prevent duplicate submission during route transition/re-render.

### Case B — user taps the AI card without a typed question

Open the dedicated Ask My Corner AI screen without auto-submitting a blank question.

Display:

- selected character
- character selector
- concise AI introduction
- empty conversation composer
- inline send icon

---

# 8. ASK MY CORNER AI DEDICATED SCREEN — COMPLETE MODERNIZATION

The dedicated Ask My Corner AI screen must now become the updated AI experience described in the original modernization program.

Do not leave the old page intact after improving only the Home card.

Required structure:

1. compact page-specific header/back behavior
2. My Corner AI identity
3. selected approved character
4. character selector
5. animation/motion presentation
6. conversation area
7. grounded source/result cards/actions where existing AI architecture supports them
8. quota/status UI where appropriate
9. modern inline composer
10. send icon inside composer
11. clear loading/thinking behavior
12. useful error/retry behavior
13. Basic Search alternative when AI quota is exhausted/unavailable where already required by product logic

Do not use an oversized detached Send button.

Do not regress existing Ask My Corner retrieval, authorization, quota, or fallback behavior.

Basic Search must remain independent of AI quota.

---

# 9. ASK MY CORNER AI MOTION / ANIMATION

The original modernization program requires My Corner AI to feel like a neighborhood concierge rather than a generic chatbot.

Implement polished, lightweight motion using the approved static assets without distorting them.

Do not fake facial animation by warping the artwork.

Use safe React Native / Expo-compatible motion, preferably through existing supported animation tooling.

Minimum motion states:

## WELCOME / IDLE

Examples:

- subtle float/breathing movement
- gentle scale shift
- restrained small wave/tilt if visually natural
- calm attentive presence

Meaning:

`I'm here and listening.`

## THINKING / PROCESSING

Examples:

- subtle vertical motion
- slight head/body tilt through whole-asset transform
- restrained focus indicator
- small processing pulse/ring

Use animation to make wait time feel intentional.

## SUCCESSFUL ANSWER / MATCH

Examples:

- small positive bounce
- subtle nod-like rotation
- brief positive highlight

## IMPORTANT / HIGH-TRUST ALERT

Examples:

- restrained seriousness
- subtle alert ring/indicator
- no cartoonish alarm behavior

Respect Reduce Motion.

If Reduce Motion is enabled, use static state transitions/fades rather than looping transforms.

Do not run unnecessary infinite animation loops offscreen.

Do not introduce expensive memory-heavy animation.

If true expression-specific animation would require new artwork/rigging, implement the motion/state architecture now and document the exact missing asset requirement rather than inventing new character art.

---

# 10. ASK MY CORNER AI HOME CARD — POLISH

After correcting the portrait size and character handling, polish the Home AI card against the approved reference.

Required:

- character portrait large enough to read
- border/ring around portrait
- concise title
- neighborhood-aware greeting
- clean hierarchy
- inline input
- inline arrow/send
- correct padding
- no clipping
- no overflow
- no giant blank area
- no overly tiny copy
- no unnecessary secondary controls
- no suggestion-question clutter on Home

The Home card should invite engagement without taking over the entire viewport.

---

# 11. HOME DASHBOARD — PRESERVE WHAT IS NOW WORKING

Do not regress the improved Home structure already introduced.

Preserve and refine:

- My Corner header/location
- Messages / notification status
- Ask My Corner AI feature card
- Hire Trusted Local Help
- Latest Feed Updates
- Marketplace Showcase
- Agency Broadcast preview
- compact request status where implemented
- bottom navigation

Home must remain a content-driven neighborhood dashboard, not revert to a feature directory.

---

# 12. LATEST FEED UPDATES — POLISH

The Home Feed preview now resembles the intended structure, but ensure:

- public avatar displays correctly
- approved public name displays
- verified badge only when actually valid
- timestamp is compact and human-readable
- long content truncates cleanly
- `More` works
- like/comments/share use clear icons
- tap opens the full content where appropriate
- no private/restricted content leaks into Home
- line breaks and card height remain compact

Do not let a single Feed post dominate the first viewport.

---

# 13. MARKETPLACE SHOWCASE — POLISH

The Home Marketplace showcase now exists.

Continue refining it:

- image-first cards
- title
- price
- clean aspect ratio
- proper missing-image state
- horizontal scrolling
- stable card width
- no clipped titles
- authorized seller/public identity only where shown
- tap opens listing
- no fake content
- no layout jank while images load

The full Marketplace modernization must still be completed later in this program.

---

# 14. AGENCY BROADCAST HOME PREVIEW

Ensure the Agency Broadcast preview appears when relevant authorized data exists.

Use a clear hierarchy:

- informational
- important
- urgent

Do not style all broadcasts like emergencies.

Do not hide the section permanently merely because one account currently has no data.

Use a polished empty/no-current-broadcast state where appropriate.

---

# 15. ACTIVE / PAST REQUESTS

Keep Active and Past Requests accessible but compact.

Do not let them return to giant Home accordions that dominate the page.

Request status should remain useful without pushing Feed/Marketplace/Agency content off the first useful scroll region.

---

# 16. COMPLETE THE ORIGINAL MODERNIZATION PROGRAM — AUDIT WHAT REMAINS

After correcting the current Home + Ask My Corner AI issues, perform a repository-driven completion audit against the original modernization program.

Do not assume a phase is complete because a file or PR exists.

For every phase below, classify:

- COMPLETE AND VISUALLY ACCEPTED
- IMPLEMENTED BUT NEEDS POLISH
- PARTIALLY IMPLEMENTED
- NOT IMPLEMENTED
- BLOCKED / REQUIRES FOUNDER DECISION

Then continue remaining work in safe reviewable stages.

---

# 17. PHASE A — DESIGN SYSTEM / FOUNDATIONS

Verify and refine:

- color tokens
- typography
- spacing
- card/surface system
- border radii
- restrained shadows
- icon standards
- accessibility hit areas
- logo consistency
- active/disabled states
- visual hierarchy

Do not rebuild if already correct.

Correct inconsistencies found on newer screens.

---

# 18. PHASE B — NAVIGATION / HEADERS / BOTTOM NAVIGATION

Verify:

- compact deep-screen headers
- Back behavior
- page-specific titles
- no oversized persistent global controls on deep pages
- stable bottom navigation
- correct active-route green treatment
- bottom navigation hidden in focused creation flows where appropriate
- no dead ends
- no tab disappearance
- no duplicate routes
- no harsh transitions

Finish any remaining inconsistencies.

---

# 19. PHASE C — HOME + FEED

Home must satisfy the corrected requirements in this directive.

Feed modernization must include:

- avatar
- approved public identity
- valid trust/verification badge
- timestamp
- concise body
- media
- clean action icons
- Like
- Comments
- Share where privacy allows
- overflow menu
- truncation/More
- collapsible comments
- composer clears after successful submission
- keyboard dismisses
- tap outside dismisses where appropriate
- Android Back dismisses keyboard before collapsing comments / routing back
- no stale comment state

Do not add public sharing to restricted/private content.

---

# 20. PHASE D — SEARCH + ASK MY CORNER AI

Search:

- inline search icon
- compact modern input
- canonical retrieval preserved
- keyboard dismissal
- Basic Search independent of AI quota
- categorized results
- no generic detached Search button when inline icon is suitable

Ask My Corner AI:

- all corrections in this directive
- updated dedicated screen
- character selector
- approved character motion states
- inline composer/send
- Home query auto-submission
- grounded results
- quota UX
- deterministic fallback when model synthesis fails after valid retrieval
- no private DMs in neighborhood-wide retrieval
- no weakening of authorization

This phase is a major strategic product priority.

---

# 21. PHASE E — HIRE + PROVIDER PROFILE + CREATE REQUEST

Verify and finish:

## Provider profile CTA hierarchy

1. provider identity/header
2. Start Request
3. Provider Reputation
4. supporting profile information

Start Request must remain visible before Provider Reputation.

Do not duplicate the CTA.

## Trust

Use glanceable trust signals/micro-cards from REAL backend state.

Do not invent:

- hidden AI trust scores
- verification
- ratings
- completed-job claims
- purchasable Top Rated status

## Create Request

Preserve the simple acknowledgement:

`I understand My Corner shows trust evidence but does not guarantee provider conduct`

Requirements:

- checkbox
- light bordered container
- large enough touch target
- accessible state
- required before continuation/submission
- no separate Review and Accept button
- no modal duplication
- direct-navigation submission guard

Modernize remaining form styling, spacing, keyboard, error states, and focused navigation.

Do not break Job Safety.

---

# 22. PHASE F — MARKETPLACE

Finish the full Marketplace modernization.

Listing cards should prioritize:

- image
- item title
- price
- seller approved public identity
- coarse neighborhood context where appropriate
- key metadata
- clean action/interest affordance

Fix any remaining seller/interested-party public identity inconsistencies.

Authorized seller/interested person may show:

- approved public name
- approved public avatar

Never expose:

- legal identity
- email
- phone
- exact residential address
- internal UUID

Modernize:

- browse
- listing detail
- create/edit listing
- image states
- empty/loading/error states
- focused create flow
- navigation
- keyboard

---

# 23. PHASE G — GROUPS + EVENTS + AGENCY BROADCASTS

Groups:

- modern cards
- title
- image/icon
- member/attendance state
- privacy-aware identity
- clean detail pages
- truncation/More
- media
- comments/interactions where allowed

Events:

- modern cards
- date/time hierarchy
- location at safe/coarse precision
- attendance state
- clear action
- event detail polish

Agency Broadcasts:

- authority
- informational / important / urgent hierarchy
- restrained accent colors
- clean detail page
- high-priority banner/toast only where warranted
- no emergency styling for routine civic information

---

# 24. PHASE H — MESSAGES + NOTIFICATIONS + PROFILE + SETTINGS

Messages:

- modern inbox
- approved public identities
- avatar consistency
- unread state
- compact timestamp
- thread readability
- no generic `Neighbor` when an approved public identity is authorized
- no privacy leaks

Notifications:

- modern list
- iconography
- source/context
- read/unread state
- priority hierarchy
- badge counts
- tap-through

Profile:

- avatar/profile-photo reliability
- approved public identity
- clean information hierarchy
- no accidental legal/private identity exposure

Settings:

- compact categories
- modern rows/icons
- active navigation state
- Invite Friend where already required
- no duplicated controls

---

# 25. PHASE I — LOADING / ERROR / EMPTY STATES / MICRO-INTERACTIONS

Implement/refine:

- black + gold branded loader where branded loader is appropriate
- lightweight operation-specific loading
- useful empty states
- useful network errors
- retry
- permission states
- AI quota exhausted state
- subtle press feedback
- checkbox feedback
- tab transitions
- card press
- save confirmation
- reaction state
- expand/collapse transitions
- successful form submission

Desired motion:

FAST
SMOOTH
SUBTLE
NATIVE

Do not overanimate.

Respect Reduce Motion.

---

# 26. PHASE J — FINAL CONSISTENCY / ACCESSIBILITY / PERFORMANCE AUDIT

Audit all major screens for:

- text contrast
- touch target size
- scalable text
- screen reader labels
- semantic roles
- icon-only actions
- checkbox accessibility
- form errors
- focus order
- Reduce Motion
- disabled-state contrast
- long names
- long posts
- safe areas
- keyboard behavior
- loading
- scrolling
- image-heavy content
- tablet/wider layouts
- compact phones
- route transitions
- bottom navigation
- card consistency
- spacing consistency
- typography consistency
- active-state consistency

Performance audit:

- excessive rerenders
- duplicated API queries
- oversized images
- repeated image decoding
- unnecessary animation loops
- slow list scrolling
- layout jank
- navigation lag
- memory-heavy animation
- unnecessary remounts

Fix real issues found.

---

# 27. PUBLIC IDENTITY MUST REMAIN CANONICAL

Use the existing canonical public identity architecture.

The same authorized public identity should appear consistently across:

- Feed
- Marketplace
- Messages
- profiles
- provider/review surfaces
- interested-party surfaces
- Groups/Events where authorized

Do not build screen-specific name logic.

Never expose private/legal identity simply to make a UI look complete.

---

# 28. ACCESSIBILITY

My Corner serves a broad age range.

Do not design only for young users with perfect eyesight.

Every redesigned component must consider:

- contrast
- readable body copy
- large enough interactive targets
- Dynamic Type/scalable text where practical
- screen-reader labels
- focus order
- semantic roles
- icon labels
- disabled-state distinction
- Reduce Motion

---

# 29. BEFORE / AFTER VISUAL EVIDENCE

For major changed screens capture before/after emulator evidence where available.

At minimum review:

- Home
- Feed
- Ask My Corner AI
- Search
- Provider Profile
- Create Request
- Marketplace
- Groups
- Events
- Messages
- Notifications

Verify:

- hierarchy
- spacing
- reduced clutter
- visual consistency
- correct color use
- content density
- icons
- accessibility
- clipping
- active navigation state

Do not allow screenshot tooling to consume hours.

One reasonable recovery attempt, then document `NOT YET TESTED`.

---

# 30. QUALITY GATE

For each implementation phase run the relevant subset of:

- mobile unit tests
- integration tests
- navigation tests
- relevant repository tests
- typecheck
- lint / formatting
- Android bundle/export
- database tests where UI changes interact with repository/RLS behavior

Do not weaken tests to make redesign work pass.

Do not suppress legitimate warnings without understanding them.

---

# 31. FINANCIAL RESOURCE DISCIPLINE

Founder instruction:

**Do not waste financial resources.**

Therefore:

- do not create repeated EAS/paid Preview APKs merely to inspect cosmetic changes
- do not repeatedly rebuild the same binary while code/emulator QA is still incomplete
- use local/emulator/CI validation first
- bundle/export before paid build
- batch multiple founder-approved visual corrections into one physical-device verification build where safe
- only request a new APK when there is a specific device-only question or a founder-approved release candidate
- do not start a paid build without founder approval

If an APK is not necessary, explicitly say so.

---

# 32. SOURCE CONTROL / PR DISCIPLINE

Do not create one uncontrolled mega-commit.

Use logical reviewable commits.

Do not create duplicate PRs for the same work unless required.

If an existing modernization PR is the correct active workstream, continue it.

If a phase needs a separate PR for safe review, document why first.

Do not merge without founder approval.

Do not deploy Production.

At each checkpoint record:

- base SHA
- branch
- PR
- head SHA
- files changed
- tests
- visual status
- remaining items

---

# 33. FIRST ACTION IN THIS SESSION

Before editing anything:

1. Fetch current `main`.
2. Inspect the active modernization PR(s).
3. Read:
   - `docs/ui-reference/home/HOME_UI_SPEC.md`
   - current Home implementation
   - current Ask My Corner AI implementation
   - `BottomNavigation`
   - design-system/tokens
4. Inspect approved character assets.
5. Produce a concise completion matrix:
   - what Phase A already completed
   - what Phase B already completed
   - what Phase C already completed
   - exact Home defects from this founder review
   - what remains Phase D through J
6. Identify exact files to change for the immediate Home + AI correction.
7. Implement the immediate correction.
8. Run the quality gate.
9. Capture visual evidence if tooling works.
10. Report whether Home + AI correction is ready for founder visual review.
11. Continue remaining modernization work in controlled stages according to this directive, without unnecessary paid builds or Production changes.

Do not redo completed work merely for activity.

---

# 34. IMMEDIATE ACCEPTANCE MATRIX — HOME + ASK MY CORNER AI

Do not call the current Home/AI correction ready until the following are explicitly evaluated:

## HOME

- approved Home visual hierarchy retained: YES / NO
- color direction matches approved reference: YES / NO
- Hire Trusted Local Help clearly visible: YES / NO
- Hire CTA correct contrast: YES / NO
- Latest Feed preview remains functional: YES / NO
- Marketplace Showcase remains functional: YES / NO
- Agency Broadcast preview remains functional: YES / NO
- request status remains compact: YES / NO
- no feature-directory regression: YES / NO

## AI HOME CARD

- character face is clearly visible: YES / NO
- portrait larger than current rejected version: YES / NO
- visible portrait border/ring: YES / NO
- approved asset preserved: YES / NO
- inline input: YES / NO
- inline send/arrow: YES / NO
- neighborhood-aware greeting: YES / NO
- no suggestion clutter: YES / NO

## HOME → AI FLOW

- query passed from Home: YES / NO
- query automatically submitted once: YES / NO
- no second Send tap required: YES / NO
- no duplicate submission: YES / NO
- keyboard dismisses cleanly: YES / NO
- Back behavior correct: YES / NO

## DEDICATED AI EXPERIENCE

- selected character displayed: YES / NO
- four-character selector available: YES / NO
- selected-state treatment visible: YES / NO
- selection persists appropriately: YES / NO
- idle/welcome motion: YES / NO
- thinking motion/state: YES / NO
- success/answer motion/state: YES / NO
- Reduce Motion fallback: YES / NO
- modern inline composer: YES / NO
- no detached oversized Send button: YES / NO
- grounded results preserved: YES / NO
- quota behavior preserved: YES / NO
- deterministic fallback preserved: YES / NO

## BOTTOM NAVIGATION

- Home active state green on Home: YES / NO
- Marketplace active state green on Marketplace: YES / NO
- Settings active state green on Settings: YES / NO
- other active destinations follow same rule: YES / NO
- inactive destinations neutral: YES / NO
- selected state accessible beyond color where practical: YES / NO

---

# 35. FINAL PRODUCT PRINCIPLES

Every change should pass these questions:

1. Is it easier to understand?
2. Is it faster to use?
3. Is important information easier to scan?
4. Does it strengthen trust?
5. Does it reduce cognitive load?
6. Does it feel native to a modern mobile application?
7. Does it preserve My Corner's personality?
8. Is it accessible?
9. Does it preserve privacy and authorization?
10. Does it help users complete a meaningful neighborhood action?
11. Does it preserve or improve performance?
12. Does it avoid unnecessary infrastructure/build cost?

If not, reconsider the change.

---

# 36. DEFINITION OF DONE FOR THE COMPLETE PROGRAM

The modernization program is successful only when My Corner feels like one coherent premium product rather than a collection of functional screens.

The final experience must demonstrate:

- clean 2026 mobile design
- modern typography
- consistent spacing
- subtle cards
- restrained color
- minimal heavy shadows
- modern icons
- compact headers
- better screen real-estate usage
- consistent active bottom navigation
- inline Search action
- inline Ask My Corner AI send action
- fully modernized Ask My Corner AI experience
- selectable approved AI characters
- polished AI motion states
- clean Feed actions
- Share on appropriate posts
- valid provider verification badges
- strong but restrained trust signals
- clean forms
- minimal Create Request acknowledgement
- premium Marketplace
- improved Groups/Events
- clear Agency Broadcast hierarchy
- polished Messages/Notifications
- modern loading states
- consistent My Corner logo
- smooth micro-interactions
- reliable navigation
- responsive Android layouts
- accessibility
- no functionality regressions
- no privacy regressions
- no fake data
- no unnecessary paid build waste

Do not mark a phase complete merely because code was written.

A phase is complete only after the actual UI has been visually reviewed and core functionality still passes.

---

# 37. FINAL REPORT FORMAT

At the end of each implementation phase report:

1. Current main SHA
2. Branch name
3. PR number
4. PR head SHA
5. Phase addressed
6. Screens changed
7. Components created/refactored
8. Design tokens changed
9. Before/after summary
10. Screenshots captured
11. Tests run
12. Test results
13. Typecheck/lint/build status
14. Emulator QA
15. Physical-device QA still required
16. Accessibility findings
17. Performance findings
18. Unresolved visual inconsistencies
19. Functionality regressions discovered
20. Privacy/security concerns
21. Remaining original-modernization requirements
22. Whether another APK is actually necessary
23. Whether the phase is ready for founder visual review

Do not say `COMPLETE` when founder visual approval is still outstanding.

Use:

`READY FOR FOUNDER VISUAL REVIEW`

when implementation and available validation are finished but founder review remains.
