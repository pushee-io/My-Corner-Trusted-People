# Install the Events completion package

Run from the repository root on the `events-development` branch.

```bash
git status --short
unzip -o ~/Downloads/events-phases-complete.zip -d .
cd mobile
npx prettier --write app/events app/home.tsx src/components/BottomNavigation.tsx src/types/events.ts src/types/events-runtime.ts src/lib/events-repository.ts src/lib/events-supabase-adapter.ts src/lib/events-supabase-repository.ts src/__tests__/events-contracts.test.ts src/__tests__/events-repository.test.ts src/__tests__/events-supabase-adapter.test.ts
npm run format
npm run lint
npm run typecheck
npm test -- --runInBand
```

For local Supabase verification, return to the repository root and use the project's normal local migration workflow. The `events` feature flag is inserted as disabled. Do not apply the migration to production as part of this installation.

The archive overwrites `mobile/app/home.tsx` and `mobile/src/components/BottomNavigation.tsx` using the versions from commit `6d2dc97` plus the Events route. Review `git diff` before committing if either file has changed locally since that commit.
