# Decision Log

## 2026-07-16 — Build Module 1 as a local vertical slice first
Decision: Use fictional in-memory app data plus Supabase migrations/seed SQL rather than waiting for a live Supabase project.
Reason: No Supabase credentials are available in this environment, and the directive says not to block the first build on unavailable access.

## 2026-07-16 — Use Expo SDK 57 target
Decision: Target Expo SDK 57, React Native 0.86, and React 19.2 based on official Expo release notes.
Reason: Latest stable Expo docs identify SDK 57 as current.
Risk: npm registry access is blocked here, so exact dependency install and lockfile generation remain unverified.

## 2026-07-16 — Keep AI features feature-flagged and server-side
Decision: Mobile app contains only feature-flagged fallbacks and no OpenAI key.
Reason: OpenAI secrets must stay server-side. No OpenAI key is available here.

## 2026-07-16 — Approve logo direction A
Decision: Founder approved Figma "Logo direction A - Corner meeting point".
Reason: It communicates local connection and service matching without a generic handshake or unconditional trust claim.
Impact: Proceed to final clean vector redraw and full export set. Do not claim legal availability until trademark, app-store-name, domain, and social-handle review is complete.

## 2026-07-16 — Keep exact address private
Decision: Provider-facing UI and schema use general area labels and keep exact addresses out of public browsing.
Reason: This is required for requester safety and GhanaPost GPS privacy.

## 2026-07-16 — Use founder-provided Figma source file
Decision: Use `https://www.figma.com/design/eHvnZ6NPomoA4t965Vbuqs/1.-My-Corner---Module-1-Trusted-Hire-Prototype?node-id=0-1&m=dev` as the design source of truth.
Reason: Founder provided this file after the initial temporary Figma scaffold.
Impact: Repository docs now point to this file, and approval notes were written into the file.
