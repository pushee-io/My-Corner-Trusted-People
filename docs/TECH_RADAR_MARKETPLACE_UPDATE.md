# Marketplace Tech Radar Update

Verified: 24 August 2026

| Tool or dependency | Selected version | Channel | Official source | Purpose | Reason | Known risks | Upgrade policy |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Expo ImagePicker | 17.0.11 | Stable, Expo SDK 54 | https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/ | Select up to eight listing photos | Expo-supported picker included in Expo Go | Android can recreate the activity after selection; the form remains recoverable by retrying | Upgrade with the next compatible stable Expo SDK |
| Expo FileSystem | 19.0.24 | Stable, Expo SDK 54 | https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/ | Read selected files as `ArrayBuffer` for Supabase Storage | Avoids unsupported React Native `Blob`/`FormData` upload behavior | Whole-file buffers use memory; the existing 6 MB per-image limit bounds exposure | Upgrade with the next compatible stable Expo SDK |
| Supabase JavaScript | 2.75.0 | Stable | https://supabase.com/docs/reference/javascript/storage-from-upload | Private image storage, signed URLs, Postgres/RLS access | Already selected by the project | Signed URLs expire; screens refresh them on focus | Review monthly and upgrade through tested lockfile changes |

Implementation note: merge these rows into the repository's authoritative `docs/TECH_RADAR.md` if that file exists outside the supplied Marketplace package.
