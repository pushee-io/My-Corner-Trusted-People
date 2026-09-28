# Reliability acceptance matrix

Status: baseline only. No new Preview deployment/native acceptance.

| Dimension | Baseline evidence | Required acceptance |
|---|---|---|
| Basic Search plumber/plumbing | Literal substring mismatch confirmed in source | Same authorized provider IDs across Search/AI/Hire |
| Highest rated / most reviews / most rated | SQL metrics exist; most rated alias missing | Verified metrics, ties, zero reviews, rank before cap |
| Electrician/electrical/power off/lights off | Existing concepts separate service vs outage | Relevant cross-source matches without lighting false positives |
| Festival/music/food drive | Existing keyword SQL and concepts | Applicable Events plus authorized supporting sources |
| 503 | Three live failures after retrieval/model on Sep28 | Model timeout/invalid output preserve deterministic matches |
| Quota | 40 UTC calendar-day; three failures not exhaustion | 80%, 100%, reset, minute/global scope and multi-device refresh |
| Privacy | Existing RLS tests; not rerun for integration | Anonymous/unverified/blocked/removed/private negatives |
| Comments | Focused backdrop currently prevents dismissal | Success blur/clear; outside close; inside preserve; Back ordering; draft retention |
| Native | APK50 predates new work | Phone + Pixel Tablet after approved new APK |

Query matrix: plumber; plumbing; highest rated plumber near me; what plumber has the most reviews; electrician; electrical; power off; lights off; festival; music; food drive. Capture plan/source counts/HTTP/failure stage without private prose or identity. Authenticated HTTP acceptance remains pending new approved deployment and a secure test session; SQL role tests are not phone acceptance.
