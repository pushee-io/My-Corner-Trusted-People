# Home media and expressive characters — founder review

Base: `a93606447c810a40825bc023b761434c9cd165cc` (verified Preview 59, merged PR #181).
Branch: `codex/home-media-expressive-characters-2026`. This continues the approved implementation; PR #181 is already merged, so a new review PR is required.

Status: implementation and automated checks passed; visual/motion review in progress. No merge, Production deployment, database changes or EAS/APK build is authorized or performed for this correction.

## Corrections

- Home order remains Feed → Marketplace → Groups → Events → Agency. Header, AI handoff, Hire CTA, request status and green selected tabs are preserved.
- Groups use the existing authorized group-cover media, then group-avatar fallback. Image-led cards retain description, aggregate member count, current viewer membership and exact detail routing. Missing imagery uses a deliberate graphic tile, never a fabricated group photo.
- Events use the first authorized event photo (or authorized video poster fallback). Preview exposes only title, date/time, coarse area and viewer attendance; no private address or organizer identity is added.
- Shared lifecycle rule retains approved scheduled events until their explicit end time. Without an end time, a started event leaves Upcoming; no duration is guessed. End boundaries, cancellation, blocked content and malformed dates are excluded. Home reclassifies locally at time boundaries; Events separates active/upcoming from a collapsed past/other list. Pending moderation remains separate.
- Home refreshes these signed-media resources every 45 seconds while focused/active; session clearing and existing authorization remain in force. Media-service failures retain metadata with an image fallback.
- Feed preview has a stronger identity row, compact relative time, bounded text, optional wide photo, engagement indicators, More and a link-only Share action. The full Feed retains “What’s happening, neighbor?”, overflow moderation and existing comments/draft behavior.
- The device's missing Share action was consistent with the existing `clean` moderation prerequisite. That prerequisite is preserved. Share is now visibly disabled with an accessibility explanation when unavailable; it does not export unreviewed or restricted content.
- Existing provider badges/trust modules are retained. Feed's current authorized post contract does not include provider-verification evidence, so no new Feed badge is invented.

## Character assets and motion

Approved full-body and portrait PNGs are unchanged. Ebony, Mr. Owusu, Mama G. and Ekow retain their stable IDs and preferences.

The built-in image-generation tool derived four head-only expression cells per character from the corresponding original: happy, blink, speaking and restrained surprise. Prompt constraints: exact original identity, skin tone, hair/headwrap, earrings/beard, age, proportions, render style and lighting; identical head position/scale in a 2×2 transparent atlas; no text, body, props or alternate characters. Each atlas is deterministically split, trimmed and resized by `mobile/scripts/prepare-character-expressions.cjs`; input names/digests and frame dimensions are recorded in the asset manifest. Exported frames live in `mobile/assets/my-corner-ai/characters/expressions/`. These newly derived expressions require founder fidelity review; they are not represented as untouched original facial pixels.

The shared production renderer composites original-art body regions with expression assets. Ebony's hand rotates about the wrist; Mr. Owusu's forearm moves independently. The body remains still. Welcome is a brief gesture, thinking/listening uses a restrained head response, answering uses a bounded 2.4-second mouth sequence then a happy pose, and attention uses a brief surprised expression. All characters blink. This is visual response animation, not synthesized voice or audio lip synchronization.

Focus/background/Reduce Motion changes stop animated values and facial timers. Character switching reuses the current conversation and restarts the selected character's presentation. No new native runtime dependency is introduced. Esbuild and Playwright Core are development-only dependencies for exercising the actual animation component in CI's browser.

## Validation so far

- Full mobile suite: **121 suites / 733 tests passed**.
- TypeScript: passed.
- Lint: zero errors, 69 pre-existing warnings.
- Formatting / Android export: final results recorded after verification.
- Targeted coverage includes authorized media parents/fallback/expiry; ongoing/end-time/date boundaries; canonical identities and detail links; existing Share gate; one-shot AI handoff; independent limb/expression state; background and Reduce Motion cleanup.
- Native emulator unavailable in this workspace. Browser installation failed once plus one recovery attempt. CI's existing Chrome environment is used for evidence instead of buying a binary.

## Visual evidence and remaining acceptance

Pending CI capture. Dashboard evidence uses clearly test-only data and media; it does not claim authenticated device content. The motion harness mounts the actual production React Native Web component, with a runnable HTML preview and timed screenshots. Native animation performance, TalkBack, real-device media and native gesture/keyboard checks remain unverified for this correction.

A new Preview APK should wait for review of the imagery, Feed and character fidelity/motion evidence. No new build is requested yet.


## Founder Feed action-bar correction — 2026-10-11 UTC

The follow-up replaces Feed's mixed Like/Share and separate Comments row with a single icon-first bar, tighter production card spacing, and preserved modal/keyboard/share behavior. See the [Feed review and committed screenshot gallery](UI_FEED_VISUAL_POLISH_2026.md) for the exact tested revision, acceptance checklist and native limits. This supersedes the Feed action layout described above; character behavior is unchanged by this correction.
