# Preview Release Checklist

## Source And Build

- [ ] Working tree is clean and the preview commit is pushed.
- [ ] EAS CLI is pinned to `21.4.0`.
- [ ] EAS project is owned by `mycorner`.
- [ ] Preview uses internal Android APK distribution.
- [ ] Preview environment contains only required public client configuration.
- [ ] No service-role key, database password, Expo token, or test-account password is embedded.
- [ ] Formatting, lint, type checking, Jest, Expo Doctor, and web export pass.
- [ ] EAS preview build completes and its ID and URL are recorded.

## Device Verification

- [ ] Compact Android phone flow passes.
- [ ] Medium or expanded Android tablet flow passes.
- [ ] Portrait and landscape tablet layouts pass.
- [ ] TalkBack, 200 percent text, focus, and touch targets pass.
- [ ] Offline, reconnect, duplicate-submit, and failed-request states pass.
- [ ] Exact requester and event addresses remain protected.
- [ ] Events remains disabled unless explicitly approved for a development-only test.

## Approval Gates

- [ ] Founder approves any paid build usage before charges occur.
- [ ] No app-store submission is performed.
- [ ] No production deployment or customer communication is performed.
- [ ] No production feature flag is enabled.
