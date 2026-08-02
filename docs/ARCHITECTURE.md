# Architecture

## Events Runtime

```mermaid
flowchart LR
  A[Home, navigation, or deep link] --> B{Build flag enabled?}
  B -- No --> C[Redirect to Home]
  B -- Yes --> D{Supabase events flag enabled?}
  D -- No or error --> C
  D -- Yes --> E[Events screens]
  E --> F[Runtime repository]
  F --> G[Supabase Events repository]
  G --> H[Postgres and security-definer RPCs]
  H --> I[RLS and immutable event audit]
  F --> J[Session event cache]
  F --> K[Idempotent mutation retry queue]
  J --> E
  K --> G
```

The public repository interface remains storage-agnostic. Screens depend only on the runtime repository. The seeded implementation is a test factory and is not reachable from production screens. Supabase remains authoritative; cached data is a read fallback and queued writes reconcile by replacing optimistic records with server records after a successful retry.
