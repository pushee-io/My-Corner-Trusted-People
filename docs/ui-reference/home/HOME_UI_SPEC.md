# MY CORNER — HOME PAGE REDESIGN CORRECTION
## TEXT SPECIFICATION IS AUTHORITATIVE • REPOSITORY REFERENCES ARE DURABLE

You are working on **My Corner**.

Repository:

`pushee-io/My-Corner-Trusted-People`

Use the **current GitHub repository state as the source of truth**.

---

# IMPORTANT: DO NOT DEPEND ON CHAT ATTACHMENTS

Do **not** depend on screenshots or images attached only to the chat session.

The durable Home-page design references should live in the repository at:

```text
docs/ui-reference/home/HOME_UI_SPEC.md
docs/ui-reference/home/current-home.jpg
docs/ui-reference/home/approved-home-reference.png
```

The written specification:

```text
docs/ui-reference/home/HOME_UI_SPEC.md
```

is **authoritative**.

The screenshots are **supplemental visual references**.

If image rendering is unavailable in the agent session, **continue using the written specification**.

Do not stop or claim the task cannot continue because a screenshot cannot be viewed.

If the screenshots exist in the repository and can be rendered, compare:

- `current-home.jpg`
- `approved-home-reference.png`

before changing code.

---

# CURRENT PROBLEM

The current Home page is too close to a feature directory / navigation menu.

It currently emphasizes items such as:

- Ask My Corner AI as a simple green pill
- Neighborhood Feed as a link
- very large Active Requests section
- very large Past Requests section
- Marketplace / Groups / Events / Agency Broadcasts as menu icons
- My Activity / Settings as another menu section

This is **not** the desired Home experience.

The desired Home page must be a **compact, content-driven neighborhood dashboard**.

The previous modernization work appears to have:

- changed some icons
- reduced some header controls
- retained much of the old Home information architecture
- retained oversized Active/Past Requests
- converted features into menu links

but it did **not** build the requested Home dashboard.

This must now be corrected.

---

# DO NOT REDESIGN FROM MEMORY

Use the written specification below as the primary source of truth.

If available, use:

```text
docs/ui-reference/home/approved-home-reference.png
```

as the visual direction.

Do not invent a different Home layout.

The goal is not pixel-for-pixel copying.

The goal **is** to preserve the intended:

- information hierarchy
- relative component prominence
- compactness
- visual rhythm
- content previews
- card-based structure
- primary actions
- glanceability
- conversion focus
- clean modern 2026 mobile feel

---

# TARGET HOME PAGE STRUCTURE

Use this information hierarchy:

1. **Brand / Location Header**
2. **Messages + Notifications**
3. **Featured Ask My Corner AI Card**
4. **Hire Trusted Local Help**
5. **Latest Feed Updates**
6. **Marketplace Showcase**
7. **Groups Preview**
8. **Events Preview**
9. **Agency Broadcast Preview**
10. **Compact Request Status**
11. **Bottom Navigation**

The page should feel like a **neighborhood dashboard**.

It should **not** feel like:

- a settings screen
- a sitemap
- a directory of app features
- a collection of large menu links

---

# 1. BRAND / LOCATION HEADER

Use a compact Home-specific header.

Show:

- My Corner brand/logo
- current verified neighborhood / city
- Messages
- Notifications

Example location:

```text
East Legon · Accra
```

Messages and Notifications should be compact icon actions.

Use:

- message icon
- bell icon
- unread badge/count where applicable

Do **not** use large text pills for these.

Do not allow the header to consume excessive vertical space.

The brand/header should feel compact, premium, and modern.

---

# 2. FEATURED ASK MY CORNER AI CARD

This is one of the most important parts of the Home page.

Do **not** render only:

```text
Ask My Corner AI
```

followed by:

```text
Ask anything about your neighborhood.
```

That is not the approved experience.

Create one compact **featured AI card** containing:

- My Corner AI character/avatar area
- title:
  `Ask My Corner AI`
- short contextual greeting
- neighborhood-aware wording where appropriate
- inline AI question field
- send icon inside the input

Example:

```text
Ask My Corner AI
How can I help you today in East Legon?

[ Ask anything about your neighborhood...   ➤ ]
```

The card should feel:

- inviting
- intelligent
- premium
- warm
- neighborhood-specific
- compact

Do not make it enormous.

Do not add multiple AI buttons.

The send action must be **inside** the input field.

---

# MY CORNER AI CHARACTER ASSETS

Approved My Corner AI character assets should live at:

```text
mobile/assets/my-corner-ai/characters/
```

Expected files may include:

```text
character-woman-kente.png
character-older-man.png
character-young-man.png
character-woman-purple.png
```

Before using character artwork:

1. Inspect the repository.
2. Confirm the approved assets exist.
3. Use only the approved assets.
4. Preserve character identity and visual consistency.

Do **not**:

- generate replacement characters
- substitute stock avatars
- create generic African characters
- use emojis as replacements
- redesign the characters without founder approval

If approved character files are not yet available:

- preserve a properly sized character/avatar slot
- continue the Home redesign
- report the asset dependency separately

Do not block the entire Home redesign because character art is incomplete.

---

# 3. HIRE TRUSTED LOCAL HELP

Immediately below the AI card, show one prominent full-width primary CTA:

```text
Hire Trusted Local Help
```

This must:

- be clearly visible
- have strong contrast
- use My Corner primary-action styling
- preserve existing Hire navigation
- have no overlap
- have no faded text
- have no transparency issue
- have no clipping
- have no duplicate CTA

Use an appropriate service/tool icon if already supported by the design system.

The user should understand immediately that this is the main path to hire local help.

---

# 4. LATEST FEED UPDATES

Home must show **real neighborhood content**, not merely a link called:

```text
Neighborhood feed
```

Add a compact section:

```text
LATEST FEED UPDATES
```

Show one recent/relevant authorized Feed preview.

Include where available:

- public avatar
- approved public name
- verified badge where valid
- timestamp
- short post preview
- media thumbnail if appropriate
- compact engagement indicators/actions

Possible actions:

- like/reaction
- comments
- share

If post text is too long:

- truncate it cleanly
- show:
  `More`

Do not allow long Feed posts to dominate the Home screen.

Tapping the card should open the relevant Feed/post.

Use current authorized Feed data.

Do not hard-code production content.

---

# 5. MARKETPLACE SHOWCASE

Add:

```text
MARKETPLACE SHOWCASE
```

Show a compact horizontal row / carousel of recent authorized Marketplace listings.

Each preview should prioritize:

- image
- concise title
- price

Keep cards compact.

Avoid overcrowding with unnecessary metadata.

Tapping:

- item → opens listing detail
- section title / appropriate action → opens full Marketplace

Use real authorized Marketplace data.

Do not add fake production products.

If no listings exist:

- show a polished empty state
- do not inject fixtures into production

---

# 6. AGENCY BROADCAST PREVIEW

Add:

```text
AGENCY BROADCAST
```

When a relevant authorized broadcast exists, show one compact preview.

Example structure:

```text
[megaphone icon]

Sector 4 Power Notice

Planned outage on Tuesday...
```

Use:

- real authorized data
- correct agency identity
- appropriate urgency treatment
- concise preview text

Do not reduce Agency Broadcasts to only a static navigation item.

Do not make normal informational broadcasts look like emergencies.

Tap should open the relevant broadcast/details.

---

# 7. ACTIVE / PAST REQUESTS

The current Home page gives Active Requests and Past Requests too much vertical prominence.

Do **not** keep them as giant accordion headings that dominate Home.

Replace them with a compact request-status treatment.

Example:

```text
My Requests

Active 28      Past 15
```

or an equivalent modern compact pattern.

Users must still be able to open:

- Active Requests
- Past Requests

Do not remove access.

Do not hide important active-request state.

The goal is to **reduce vertical footprint**, not functionality.

---

# 8. REMOVE FEATURE-DIRECTORY CLUTTER

The current Home page includes menu-like sections such as:

```text
Explore your neighborhood
Marketplace
Groups
Events
Agency broadcasts

Your corner
My Activity
Settings
```

This makes Home look like a feature directory.

Do not repeat every destination as a large Home menu item when those destinations already exist in:

- bottom navigation
- contextual navigation
- dedicated tabs/screens
- content previews

Home should prioritize:

- content
- status
- alerts
- local activity
- primary actions

not duplicate navigation.

---

# 9. GROUPS / EVENTS

Founder correction, 2026-10-10: Groups and Events are required full Home dashboard preview sections, in the same content hierarchy as Feed, Marketplace and Agency Broadcast.

Required order:

1. LATEST FEED UPDATES
2. MARKETPLACE SHOWCASE
3. GROUPS
4. EVENTS
5. AGENCY BROADCAST

Each section must include:

- a bold section heading and chevron / View All affordance
- real authorized content previews in premium compact cards
- tap-through to the exact group or event detail
- a section action opening the existing Groups or Events route
- a polished empty state when no data exists

Groups show a group image/icon, name and authorized aggregate member or activity context. Never expose private membership identities or group posts merely to fill Home.

Events show a title, date/time, safe coarse location and icon/image, plus the current viewer's attendance state where supplied. Preserve the existing Events feature gate; an unavailable state must not bypass it. Never show private addresses in Home previews.

Do not replace these sections with simple navigation icons, static menu rows, feature-directory buttons or shortcut pills. Do not insert fake production content. Keep Agency Broadcast's premium treatment below both sections and keep request status compact.

---

# 10. BOTTOM NAVIGATION

Preserve the modernized bottom navigation.

Keep it:

- icon-driven
- compact
- accessible
- consistently positioned
- visually lightweight

Do not duplicate every bottom-navigation destination inside the Home body.

---

# 11. VISUAL STYLE

The Home page must feel:

- clean
- compact
- premium
- modern
- trustworthy
- useful
- lively
- easy to scan
- mobile-native
- polished enough for a serious consumer product

Use:

- mostly white / neutral surfaces
- My Corner green strategically
- restrained gold where appropriate
- subtle borders
- soft card radii
- minimal shadows
- consistent spacing
- modern icons
- restrained typography
- strong hierarchy

Do **not**:

- make every card green
- use heavy drop shadows
- create giant gaps
- use oversized headings
- use excessive text
- make the page look like a settings screen
- cram content edge-to-edge
- use hard black dividers unnecessarily

The visual direction is:

```text
CLEAN + MODERN + TRUSTWORTHY + GLANCEABLE
```

---

# 12. FIRST-VIEW SCREEN REAL ESTATE

On a normal Android phone, the first viewport should ideally show:

- brand/location
- Messages/Notifications
- Ask My Corner AI card
- Hire Trusted Local Help
- at least the beginning of Latest Feed Updates

Do not waste the top half of the screen on navigation menus.

Improve density without making controls cramped.

---

# 13. HOME DATA SOURCES

Use existing repositories/hooks/data sources for:

- verified neighborhood
- message count
- notification count
- Ask My Corner AI
- Feed
- Hire
- Marketplace
- Agency Broadcasts
- Active Requests
- Past Requests
- Groups
- Events

Do **not** hard-code production content.

Fixtures are permitted only in tests.

---

# 14. PUBLIC IDENTITY CONSISTENCY

Where Home surfaces people, use the same approved canonical public identity used elsewhere in My Corner.

Examples:

- Feed author
- Marketplace seller
- provider
- event/group organizer where appropriate

Use:

- approved public name
- approved public avatar
- verified badge where valid

Do not expose:

- legal/private name
- email
- phone number
- UUID
- private verification evidence

---

# 15. PRESERVE CURRENT FUNCTIONALITY

Do not break:

- authentication
- session persistence
- verified neighborhood
- profile pictures
- public identity
- Feed
- Hire
- provider profiles
- Create Request
- Search
- Ask My Corner AI
- AI quota
- Marketplace
- Marketplace interested parties
- Groups
- Events
- Messages
- Notifications
- Agency Broadcasts
- Requests
- Job Safety
- verified reviews
- Supabase RLS
- privacy
- navigation

This is a Home UI/UX correction.

Do not rewrite backend logic unnecessarily.

---

# 16. NO FAKE PRODUCTION DATA

The approved Home reference may contain illustrative content.

Do **not** hard-code:

- fake Feed posts
- fake Marketplace items
- fake prices
- fake Agency Broadcasts
- fake message counts
- fake notification counts
- fake user names
- fake request counts
- fake verified badges

Use real authorized data.

Fixtures may be used only in tests.

---

# 17. RESPONSIVE REQUIREMENTS

The Home page must work on:

- compact Android phone
- standard Android phone
- emulator
- tablet / wider layout where supported

Verify:

- no overlapping text
- no faded CTA
- no invisible controls
- no clipped titles
- no awkward wrapping
- no content hidden beneath bottom navigation
- no excessive blank space
- no horizontal overflow
- no card width bugs
- no broken typography at larger text sizes

---

# 18. BEFORE WRITING CODE — REPORT

Before implementation, report:

## A. CURRENT HOME STRUCTURE

List the current Home components in order.

## B. GAP AGAINST THIS SPEC

For every target section, mark:

- already exists correctly
- exists but needs redesign
- missing

## C. DATA AVAILABILITY

Identify current source of data for:

- Feed preview
- Marketplace preview
- Agency Broadcast
- message count
- notification count
- Active Requests
- Past Requests
- Groups
- Events
- My Corner AI

## D. CURRENT HOME COMPONENT TREE

Identify the files/components responsible for the current Home.

## E. IMPLEMENTATION PLAN

List exact files/components expected to change.

## F. RISKS

Identify risks to:

- navigation
- public identity
- request counts
- AI
- Marketplace
- Feed
- RLS
- performance
- loading states

Then implement.

---

# 19. VISUAL ACCEPTANCE IS MANDATORY

Do **not** declare Home complete based only on tests.

After implementation, verify:

```text
Ask My Corner AI featured card:        YES / NO
Inline AI input:                       YES / NO
Inline AI send icon:                   YES / NO
Hire Trusted Local Help CTA:           YES / NO
Latest Feed Update card:               YES / NO
Marketplace Showcase:                  YES / NO
Agency Broadcast preview:              YES / NO
Compact Active/Past Request status:    YES / NO
Feature-directory clutter reduced:     YES / NO
Bottom navigation preserved:           YES / NO
No overlapping content:                YES / NO
No faded/invisible controls:           YES / NO
No duplicate navigation clutter:       YES / NO
```

Visual QA must be performed at a realistic Android phone size.

---

# 20. SCREENSHOT / REFERENCE HANDLING

If repository images exist at:

```text
docs/ui-reference/home/current-home.jpg
docs/ui-reference/home/approved-home-reference.png
```

use them as visual references.

If the agent cannot render those images:

- do not stop
- do not repeatedly retry image access
- do not claim the task is blocked

Continue from:

```text
docs/ui-reference/home/HOME_UI_SPEC.md
```

The written specification is sufficient and authoritative.

---

# 21. DO NOT CONTINUE TO LATER MODERNIZATION PHASES

Do **not** proceed with additional broad UI modernization phases until this Home correction has been visually reviewed.

The Home page establishes the visual hierarchy for the application.

Get Home right first.

Founder visual approval is required before continuing the broad modernization program.

---

# 22. QUALITY GATE

Run relevant:

- mobile unit tests
- integration tests
- navigation tests
- typecheck
- lint/format checks
- Android bundle/export

If Home components depend on repository/RLS behavior, run the relevant backend/database tests too.

Do not weaken existing tests simply to make the redesign pass.

---

# 23. PERFORMANCE

Do not trade visual polish for poor performance.

Watch for:

- excessive rerenders
- repeated API requests
- duplicate data fetching
- oversized Marketplace images
- slow Feed rendering
- expensive AI-card animation
- layout jank
- scroll lag
- navigation lag

Reuse cached/query data where appropriate.

---

# 24. DO NOT CREATE AN APK FIRST

Before requesting another paid Preview APK:

1. complete the Home redesign
2. run tests
3. run typecheck/lint
4. run Android bundle/export
5. perform emulator QA
6. capture Home visual evidence if possible
7. obtain founder visual review

Only request an APK if physical-device confirmation genuinely requires a new binary.

---

# DEFINITION OF DONE

Home is complete only when:

- it is a content-driven neighborhood dashboard
- Ask My Corner AI is a featured card
- AI input is integrated into that card
- send icon is inside the AI input
- Hire Trusted Local Help is prominent and visually correct
- Feed content appears on Home
- Marketplace content appears on Home
- Agency Broadcast content appears on Home
- Active/Past Requests are compact
- duplicate menu clutter is reduced
- bottom navigation remains intact
- current functionality still works
- no fake production data is introduced
- public identity remains correct
- Android phone layout has no overlaps or clipping
- automated tests pass
- visual QA is completed
- founder has reviewed the updated Home result

Do **not** move to the next modernization phase until founder approval of Home.

---

# FINAL REPORT

Report:

1. Current main SHA
2. Branch name
3. PR number
4. PR head SHA
5. Exact Home files changed
6. Components added/refactored
7. Before/after information hierarchy
8. Data source used for each Home preview section
9. Tests run
10. Test results
11. Typecheck/lint/build status
12. Android emulator results
13. Physical-device results if performed
14. Screenshot/reference evidence reviewed
15. Any remaining differences from the approved Home direction
16. Any unresolved issue
17. Any performance concerns
18. Any privacy/security concerns
19. Whether a new Preview APK is actually necessary
20. Whether Home is ready for founder visual approval
