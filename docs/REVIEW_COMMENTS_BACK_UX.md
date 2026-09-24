# Review, comments and Back UX — 2026-09-24

## Implementation

Completed requester Job Safety sessions mount existing server-authorized ReviewPrompt after Session complete. The provider name is dynamic. Providers/incomplete sessions do not mount the prompt. Existing reviews show View or View/Edit according to current server policy. The same review form has confirmation, View provider reviews and Done; Done returns through history or to the Safety session if opened directly. Returning to the session refreshes eligibility. No changes to RLS or duplicate-review constraints.

Feed, Groups and Events are the only existing comment-enabled screens. CollapsibleComments uses a native modal with a sibling backdrop, explicit Hide, accessible count/state and keyboard-aware scrolling. Screen's CommentsProvider allows one active thread. Outside touches do not dismiss a focused composer; no dismissal while submitting. System Back/Hide dismiss the dialog, preserving drafts in authorized screen state. Drafts clear on account/scope change. No comment-media or reply architecture was added. Existing realtime/count updates remain; there is no new realtime backend. Failed Event comment submissions preserve drafts.

AppHeader extends Screen and applies to every current application screen. Back is fixed above scrolling content, uses the existing Ionicons arrow, has a 48 dp target and preserves safe areas, responsive width, branding and header actions. It is absent on Home and the welcome root. It follows real history or replaces with Home when directly opened. Android hardware Back shares this behavior; at Home/root it exits. Native modal Back closes the overlay first. Existing nested request form/confirmation pages remain part of actual history; Back does not invent a shortened history.

## Automated evidence

504 tests across 91 suites pass, including completed requester/provider/incomplete/already-reviewed states, review routing and confirmation/Done; collapsed/expanded/outside/inside/composer/busy/draft/count/single-thread behavior; global header history/fallback/hardware/root/accessibility/width behavior. Typecheck and lint pass (zero errors/15 baseline warnings). Existing privacy, authorization, media and review validation regression suites pass. No database changes were needed; existing server SQL duplicate-review and completion checks remain unchanged.

## Merge evidence

All three checkpoints are merged: #119 (`bc2ab3b`), #120 (`0e9eea3`), #121 (`f9ed12e`). Final navigation Mobile CI `35958012669` and `35957998462` passed, including repository release gates/web export. Previous review/Safety and comments CI passed. No paid EAS build was submitted.

## Native acceptance — pending

A separately approved new Preview APK is needed; installed version 40 predates these UX changes. Do not mark this checkpoint device-accepted based on unit tests or web export.

On Samsung phone and Pixel Tablet:

1. Requester completes a job with the provider (both acknowledgements), opens Safety, sees Review with the actual provider name, submits stars/title/body/recommendation, then Done. Return to Safety: View or View/Edit replaces the new-review CTA. Provider sees no self-review CTA.
2. On Feed, Group and Event: verify initial comment count/collapsed state; expand; interact inside; type draft; outside tap while typing stays open; Hide closes; reopen preserves draft; blur then outside closes. Submit updates count. Failed submission preserves draft. Opening another post does not leave overlapping dialogs. Hardware Back closes comments before navigation.
3. Follow Home → Hire → Provider → Request → Safety. Back follows actual visited screens until Home, where the arrow disappears. Repeat Community/Group/Event/Market/Search/Settings/Messages/Notifications. Direct-open a nested route with no history and verify Home fallback. Test hardware Back, keyboard, media viewer close, compact/landscape/tablet layout and enlarged text.

The founder authorized implementation, CI and green non-production merges; no additional paid EAS build or production deployment was authorized.
