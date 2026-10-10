# Phase C — Home, feed, and comments

Status: implementation checkpoint; automated validation pending. Native and signed-in Preview visual acceptance remain open. No new APK, merge, or deployment authorized by this implementation task.

## Baseline

- Main: `e2edcbe2df8d1c7d2be351a3efe665a6abca33f7`, merged Phase B / PR #179.
- [Post-merge Mobile CI](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38019894446): passed.
- [Post-merge dependency Database CI](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38019836711): passed.
- APK55 matches this baseline's source. It does not contain Phase C.
- Branch: `codex/home-feed-comments-2026`. PR/head and final validation are recorded in the draft PR.

## Changes

### Home

Keep the verified neighborhood and single Ask My Corner entry. Use wrapping icon/text destinations for Hire help, authorized Provider inbox and Neighborhood feed. Bring all Active / Past Requests before the secondary Explore, Your corner, and Moderation sections. Preserve every request, canonical ordering/status, expanded state, provider labels and exact request IDs/routes.

Retain community membership and Events gates. Moderator links now use the existing session-aware capabilities resource instead of an extra one-time profile read; they disappear when capabilities clear. No invented activity previews, alerts, counts or suggested AI questions.

### Feed

Start with a compact Share a local update entry. Expand the existing composer on demand; Close composer retains text and selected media in the same screen-owned controller. Busy or partially submitted media cannot be dismissed. Successful post completion clears the finished draft and restores browsing; failed submissions retain the existing retry path and stable post/media identity.

Combine the authorized public author/avatar and stored timestamp in one row. Long bodies have Read more / Show less; full text is retained, and short text is never line-clamped. MediaGallery retains its existing parent authorization. Likes have a labeled icon, selected state and 48dp target. Report retains an explicit text action. Existing community utility destinations move below the feed.

### Comments

Keep the native modal and its keyboard-first Back, busy dismissal guard, account-scoped drafts and one-thread behavior. Put count/title and Hide comments together above the scrollable content. Modernize reply author rows, shared Report/Reply controls, and a multiline composer that can grow without squeezing its action beside long text. Failed replies retain the draft; successful replies update the thread/count and clear only that draft.

The shared modal header also updates existing non-feed consumers; their data and inner content are unchanged. Existing modal lifecycle tests remain mandatory.

## Feed sharing / privacy decision

Do not add a feed Share action or export neighborhood text/media. The repository has no reviewed external visibility contract for this action. Do not infer provider badges from a display name or create unverified urgency/activity metadata. Existing group sharing is unchanged and its previously recorded privacy concern remains outside Phase C.

No repository, database, RLS, auth, upload, trust acknowledgement, provider CTA, Marketplace or Job Safety implementation changes.

## Changed files

- `mobile/app/home.tsx`
- `mobile/app/community/index.tsx`
- `mobile/src/components/HomeDestination.tsx`
- `mobile/src/components/FeedPostBody.tsx`
- `mobile/src/components/CollapsibleComments.tsx`
- `mobile/src/__tests__/home-request-sections.test.ts`
- `mobile/src/__tests__/media-product-screens.test.ts`
- `mobile/src/__tests__/feed-post-body.test.ts`
- `mobile/src/__tests__/phase-c-feed.test.ts`
- `docs/UI_HOME_FEED_PHASE_C.md`

No global tokens, package versions, native build settings or navigation routes are changed.

## Acceptance and evidence

- Automated gates: pending CI on this implementation. Full Jest, TypeScript, lint, formatting, Expo/Preview contract, Android and web exports required.
- Regression focus: request counts/toggles/routes, capability changes, text/media draft close/resume, partial upload retry, post identity, reactions/reports, comment failure/success, empty/error state and long text expansion.
- Local terminal: execution did not respond to a bounded basic command/recovery attempt; validation uses GitHub Actions. No local test result is claimed.
- Phase C screenshots actually verified: none yet. Existing A/B screenshots are not Phase C evidence.
- Emulator/native capture: not attempted; no capture retry loop.
- Signed-in Preview screens and physical device: not yet tested.
- Accessibility: semantic labels/state, wrapping controls, 48dp migrated targets, native text scaling retained. TalkBack, system font scaling, actual keyboard insets and focus traversal require device verification.
- Performance: no new data subscriptions, fonts, image assets, animation loops or persistence. No native frame-rate/memory claim.

## Physical-device checklist for the next approved Preview APK

1. Home: actual neighborhood, only authorized destinations, all active requests, collapse/reopen Active and Past, correct request destination.
2. Feed: empty and long content, public names/avatar/date, photos/video, Read more/Show less, Like/Unlike and reporting.
3. Composer: open, type, attach media, close/resume without losing draft, successful post, failed/partial upload retry without duplicates.
4. Comments: open/close, long names/replies, multiline reply, keyboard scrolling, first Back dismisses keyboard, second Back closes, failed reply retained, successful reply clears once.
5. Shared comments on other existing screens: title/control wrapping and scroll remain usable.
6. Normal Android text/display settings first; then large text and tablet checks, with no settings changes made merely for screenshots.

Ready for founder code review after CI passes. Phase C visual/device acceptance remains open until actual evidence. Request founder approval for exactly one new Preview APK only after the automated gates pass; no automatic paid build.
