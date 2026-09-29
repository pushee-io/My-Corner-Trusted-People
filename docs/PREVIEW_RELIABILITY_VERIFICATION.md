# Preview reliability acceptance — remaining checks

Target only `opeojxwkwwnnncnsuaag`. Use a normal signed-in, founder-authorized requester. Keep passwords and session tokens out of chat, reports and shell history. Do not discover private profile identifiers, impersonate users, increase/reset quotas, change identity or send communications. Do not run the destructive local database smoke/reset script against Preview.

Approved #161 is deployed as v14 on Preview, JWT verification true; all eight live files match main `0ee724aeec452fb8213d7af8cbc96ebb6b0cea94`. Fixed evidence-failure reason codes are deployed. Runtime reason capture still needs a normal signed-in account and a reproducible failure. No schema migration was needed.

## Evidence and retrieval

Record query, UTC time, installed/source version, status, source kind/count and action correctness; omit personal source prose and credentials. A positive source check needs an existing permitted matching record. Zero matches alone cannot establish positive retrieval acceptance.

| Check | Acceptance |
| --- | --- |
| Festival / festivals / What festivals are happening? / racing / pig / pig racing / music / music festival / food / food drive | Relevant permitted upcoming Events are found without requiring exact titles; dates and routes correct; unrelated evidence excluded. Record any explanation warning and correlate its fixed reason with the UTC trace after approved diagnostics deployment. |
| Provider/Hire | Both eligible East Legon plumbers agree with canonical Hire/Search; most-reviewed and highest-rated use verified metrics rather than legacy counters. |
| Feed | Relevant service recommendations may appear even without a provider; unrelated hair posts do not answer plumbing questions. |
| Groups | An existing matching post in a joined group is found; the same private group content is absent for an authorized test account that is not a member. |
| Marketplace | Matching visible listing appears with its correct action; inaccessible/removed listings do not. |
| Agency | Relevant active notice appears with official authority and dates; expired/inaccessible content does not. |
| Neighborhood | A legitimate test account without the required membership is denied; no source title, snippet or action leaks. No fabricated membership or elevated session. |
| Private messages | Explicit refusal with no private sources. Founder phone observation passed; retain as a narrow refusal check, not proof of every authorization boundary. |
| Final authorization | Existing automated revocation tests pass; do not modify another person's content to manufacture a live test. |

## Quota and reset

1. Read the current account's quota status before and after Basic Search: usage must not increase. Compare a successful Ask against the expected increment. Never consume the entire daily allowance just to demonstrate exhaustion.
2. With an already-near-limit authorized test account, check 80% warning, remaining allowance and displayed UTC reset. These client features require current source/new APK; APK50 cannot accept them.
3. An already-exhausted account must receive the specific quota response, with Basic Search still available. Distinguish account-minute and account-day limits from service unavailability.
4. Observe status before and after the actual UTC day reset using the same normal account. No manual reset, clock override or quota adjustment. If the boundary has not been observed, mark live reset pending. Isolated PostgreSQL tests cover 32/40, 40/40, minute six and rollover but are not live observation.
5. Limit repeated AI calls and stop on 429; do not spin retries or degrade the pitch account's remaining allowance.

## Build and device gate

Only after the outstanding backend checks pass, request approval for one Preview build with current main SHA, CI and backend results. The new client includes explicit Search pill/Basic Search, 80% warning/reset display and keyboard/comment fixes newer than APK50. Do not call the app VC-ready from backend tests.

Install the approved artifact separately on the physical phone and emulator/tablet using their explicit `adb -s SERIAL` targets, then inspect installed version on each. Validate Search entry/navigation, keyboard submit/dismiss and scrolling, comment composer visibility, quota UX, all source actions, persistent Event RSVP and public names as another member. Record each device's result independently. A successful installation on one device does not update the other.
