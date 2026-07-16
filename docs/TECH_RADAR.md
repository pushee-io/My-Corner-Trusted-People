# Tech Radar

Date verified: 2026-07-16

| Tool or dependency | Selected version | Channel | Official source | Purpose | Reason | Risks | Upgrade policy |
|---|---:|---|---|---|---|---|---|
| Expo SDK | 57.x, pin target `57.0.6` after registry access | Stable | Expo SDK 57 changelog and upgrade docs | React Native app foundation | Latest current Expo SDK; brings React Native 0.86 | npm registry blocked here, exact install not verified | Run `npx expo install --fix` after install access |
| React Native | 0.86.x | Stable/active | React Native versions and Expo SDK 57 | Native runtime | SDK 57 target | Native dependency compatibility must be checked by Expo Doctor | Follow Expo SDK cadence |
| React | 19.2.x | Stable | Expo SDK 57 changelog | UI runtime | SDK 57 uses React 19.2 | Exact patch not installed here | Let Expo resolve compatible patch |
| Expo Router | SDK-compatible stable | Stable | Expo Router docs | File-based routing | Required for compact app flow | Exact package resolution blocked | Resolve with Expo install |
| TypeScript | 6.0.x | Stable | TypeScript docs | Strict typing | Latest stable docs indicate 6.0 | Some ecosystem types may lag | Pin after install verification |
| Supabase JS | 2.x | Stable | Supabase docs/changelog | Backend client | Stable since 2023; MVP backend | No Supabase project credentials here | Pin exact package after npm access |
| Supabase Postgres/RLS | Current managed stable | Stable | Supabase docs | Data, auth, RLS, storage | Fits MVP speed and security | Policies need real auth-user verification | Test locally before staging |
| OpenAI Responses API | Current stable | Stable | OpenAI docs route | Request structuring | Server-side only | API key unavailable here | Keep behind feature flag |
| OpenAI moderation | `omni-moderation-latest` via env | Stable alias | OpenAI docs route | Text/image safety screening | Current moderation alias requested | Alias can change behavior | Log model and timestamp |
| Sentry React Native | SDK-compatible stable | Stable | Sentry docs | Crash/performance monitoring | Standard RN monitoring | Package not installed due registry block | Add SDK when npm access works |

## Verification Notes
- Official Expo docs confirmed SDK 57 on 2026-07-16.
- Official Expo changelog states SDK 57 includes React Native 0.86 and React 19.2.
- npm registry access from this workspace failed with HTTP 403, so lockfile creation and package install verification are blocked.
