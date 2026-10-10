# Phase A — shared UI foundations review checkpoint

Date: 2026-10-10. **Draft for founder review; native acceptance incomplete.** This is the first bounded implementation phase of the modernization program, not completion of phases B–J.

| Required report item | Result |
| --- | --- |
| 1. Current main SHA | `20611de2e9f92e5e82ac5991fab1fff9f0f1e93d` |
| 2. Branch | `codex/ui-foundations-2026` |
| 3. PR | [#178](https://github.com/pushee-io/My-Corner-Trusted-People/pull/178), draft, stacked on #177 to retain APK54 fixes |
| 4. Validated application commit | `82578c312f23bfadac1019d9ae0eabdf2976b3f8`; subsequent evidence-only commit is identified by the PR head |
| 5. Screens changed | No route files edited. Shared ActionPill/state-card consumers receive the visual changes, including Search, AI entry/actions, Home empty/error states, Feed, Groups, Marketplace and request Review status copy. |
| 6. Components | New Surface and typography exports; migrated ActionPill and StateBlocks. Existing checkbox, provider CTA, logo and navigation implementations unchanged. |
| 7. Tokens | Added semantic surfaces/borders/disabled colors, card/control/spacious radii, layout roles and named font-size/line-height/weight styles. Existing token values preserved. Ink/gold reserved for the later loader phase. |
| 8. Before / after | 8px status cards → 16px surfaces with consistent insets; implicit body leading → 16/24 body type; green secondary labels → slate; 2px pill outline → 1px; opacity-disabled primary → explicit readable neutral disabled state; full-width error retry → compact shared action. No labels or retry destinations changed. |
| 9. Screenshots | Six before/after PNGs captured and visually reviewed; no clipping observed in these fixtures. Renderer is React Native Web + headless Chrome, at 320/390/840 widths. These are actual shared components with test-only state fixtures, not emulator or full-app captures. |
| 10. Tests run | Full mobile Jest suite, including existing integration/repository/request/safety/media/session/navigation tests; 12 new foundation cases. |
| 11. Test results | Local and CI: **617 tests in 106 suites passed**. No existing tests removed; shared retry source check updated for component delegation and reinforced by runtime name/role/48px/callback assertions. |
| 12. Static / bundle gates | Local TypeScript and Prettier pass; ESLint 0 errors, 15 pre-existing warnings. CI web and Android exports, Expo Doctor and Preview contract checks pass. |
| 13. Emulator QA | Not performed: no adb/emulator/KVM in this environment. Before/after native full-screen, large-text, keyboard and safe-area checks remain mandatory. |
| 14. Physical device QA | Not performed. User's phone has not been updated by this work. Validate wrapped labels, TalkBack/focus, retry actions and affected screens on device before completion. |
| 15. Accessibility | Button text 6.49:1 primary, 8.21:1 pressed; disabled label 5.33:1; secondary body text ≥5.90:1 on migrated state surfaces; control boundary 3.79:1 against white. 48px minimum targets, no fixed text height or font-scaling override, checked/unchecked acknowledgement unaffected. Native TalkBack/scaling still unverified. |
| 16. Performance | No new network calls, fonts, assets, animation loops, persisted state or list behavior. Surface adds only presentation; stylesheet typography is module-scoped. No native frame/memory benchmark claimed. |
| 17. Unresolved visual work | Large headers, mixed legacy cards/forms, Home density, inline Search/AI icons, Feed actions, commerce detail hierarchy, branded loader and character integration remain in B–J. All eight approved character PNGs are absent. |
| 18. Functionality regressions | None detected in the automated suite. Prior emulator profile-photo save report remains unresolved; this styling change does not claim to fix it. Native interactions remain unverified. |
| 19. Privacy/security | No repository/auth/RLS/upload/safety diff or live-data fixture. Existing private-group external share exports text after a warning; audit records this pre-existing concern for resolution before sharing expansion. No Production action. |
| 20. Review readiness | Component images reviewed; ready for founder code/design discussion, remains draft and **not ready to declare Phase A complete or merge** until required native QA and founder approval. No paid APK requested or started. |

## Exact files

Application:

- `mobile/src/theme/tokens.ts`
- `mobile/src/theme/typography.ts` (new)
- `mobile/src/components/Surface.tsx` (new)
- `mobile/src/components/ActionPill.tsx`
- `mobile/src/components/StateBlocks.tsx`

Tests, evidence and documentation:

- `mobile/src/__tests__/ui-foundations.test.ts` (new: callbacks, enabled/disabled transitions, label/boundary contrast, wrapping allowances, focus/press states, retry accessibility, offline gating, state copy and progress semantics)
- `mobile/src/__tests__/preview-device-repairs.test.ts` (retry component wiring; original 48dp/button intent retained)
- `mobile/scripts/capture-ui-foundations.cjs` (new: baseline/current real-component fixture renderer)
- `.github/workflows/mobile-ci.yml` (capture/upload component evidence and verify Android export; full history enables pinned baseline rendering)
- `docs/UI_MODERNIZATION_2026.md` (source audit, A–J plan, missing assets, regression/privacy risks)
- `docs/UI_FOUNDATIONS_PHASE_A.md` (this checkpoint)

## Reproduce

From `mobile/`, with dependencies installed:

```bash
npm test -- --runInBand
npm run typecheck
npm run lint
npm run format
node scripts/capture-ui-foundations.cjs /tmp/ui-foundations
npx expo export --platform android --output-dir /tmp/my-corner-android-export
```

Screenshot generation needs Google Chrome (`CHROME_BIN` may specify another executable) and the pinned baseline commit in local Git history. `--html-only` produces the same markup without a browser. Neither command builds an installable APK or connects to Preview/Production data.

## Native acceptance checklist still open

- Capture before/after affected states on small Android phone and tablet emulator; verify no overflow at large system font settings.
- Exercise enabled/disabled and wrapped ActionPill controls; verify TalkBack name/role/state and focus order.
- Exercise offline/retry/reconnected states and confirm retry remains reachable while scrolling/with keyboard open.
- Confirm the unchanged acknowledgement begins unchecked, blocks direct/stale Review submission and requires acceptance again after unchecking; preserve one Start Request above reputation.
- Reproduce the prior profile-photo failure on the emulator independently of this phase.
- Follow the full-screen screenshot matrix in the audit as later phases change each screen.

## Verified CI and visual evidence

- [Mobile CI run 38010332884](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38010332884), job 114088608019: all checks passed. Android export bundled 1320 modules; web export bundled 1062 modules.
- CI tested PR merge checkout `bcec91abfb0252ff44731f223d574d3c6449cd79`; its tree equals application head `82578c312f23bfadac1019d9ae0eabdf2976b3f8`.
- Artifact `ui-foundations-component-states`, ID `11653053288`. Preserved PNGs below and machine-readable `docs/evidence/ui-foundations/evidence.json` identify baseline, application head, checkout, renderer, widths and SHA-256 hashes.
- Before baseline: APK54 source/evidence head `5071729d51dd00e6fe438c3d34b8a3be2f2f40fc`.
- Visual inspection: all fixture labels and state copy fit at 320/390/840px, including wrapped actions and both checkbox states. Surfaces have restrained borders; disabled text is substantially clearer. This does not verify dynamic type, native keyboard/safe areas, TalkBack or full-screen layouts.

| Width | Before | After |
| --- | --- | --- |
| 320 | [Before](evidence/ui-foundations/foundations-before-320.png) | [After](evidence/ui-foundations/foundations-after-320.png) |
| 390 | [Before](evidence/ui-foundations/foundations-before-390.png) | [After](evidence/ui-foundations/foundations-after-390.png) |
| 840 | [Before](evidence/ui-foundations/foundations-before-840.png) | [After](evidence/ui-foundations/foundations-after-840.png) |

Additional exact evidence files committed:

- `docs/evidence/ui-foundations/evidence.json`
- `docs/evidence/ui-foundations/foundations-before-320.png`
- `docs/evidence/ui-foundations/foundations-after-320.png`
- `docs/evidence/ui-foundations/foundations-before-390.png`
- `docs/evidence/ui-foundations/foundations-after-390.png`
- `docs/evidence/ui-foundations/foundations-before-840.png`
- `docs/evidence/ui-foundations/foundations-after-840.png`
