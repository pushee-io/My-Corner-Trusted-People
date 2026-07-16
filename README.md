# My Corner — Trusted People

No Wahala — Hire without headache.

This repository contains the Day-One Module 1 vertical slice for **My Corner**, a Ghana-first neighborhood services app. The slice lets a requester browse fictional Accra-area providers, review trust evidence, submit a service request, and see a provider accept, decline, or update the status.

## What Is Included
- Expo Router mobile app scaffold in `mobile/`
- Requester and provider Module 1 screens
- Design token source in `design/tokens.json` and TypeScript tokens in `mobile/src/theme/tokens.ts`
- Supabase migration and seed SQL in `supabase/`
- Fictional provider/category data in `seed/`
- Product, design, AI, trust, test, and release docs in `docs/`
- Figma design file: https://www.figma.com/design/eHvnZ6NPomoA4t965Vbuqs/1.-My-Corner---Module-1-Trusted-Hire-Prototype?node-id=0-1&m=dev

## Run Locally
The current environment blocks npm registry access with a 403, so dependency installation could not be executed here. With normal npm access:

```bash
cd mobile
npm install
npx expo install --fix
npm run lint
npm run typecheck
npm test
npm run web
```

## Test Accounts
- Requester: Akosua Mensah
- Provider: Kwame PipeCare

These are fictional seeded identities for prototype testing only.

## Environment
Copy `.env.example` into the mobile or backend runtime as appropriate. Do not put service-role Supabase keys or OpenAI keys in the mobile app.
