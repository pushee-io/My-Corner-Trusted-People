# Canonical neighborhood intelligence

Status: implementation in progress, not deployed or release accepted.

Basic Search and Ask share normalization, concepts, source registry, source projection and authorized Postgres retrieval. AI adds optional evidence selection and explanation; model failure must preserve independently authorized deterministic matches. Basic Search never invokes OpenAI or AI metering. Hire uses the same provider coverage/account/block/category eligibility.

Authorized sources: providers with verified review aggregates and bounded public review evidence; Feed posts/comments; accepted Group discussions/comments; policy-visible Events; Marketplace public description (never pickup); approved Agency broadcasts. Business/deals and neighbor-profile discovery stay disabled until explicit source policies exist. Private DMs, job/safety records, addresses, legal identity and moderation evidence are excluded.

Every return rechecks caller context; AI rechecks source authorization after model latency. A failed authorization check fails closed. Bounded per-family reads rank before limits. Comparison metrics are computed over all eligible providers before truncation. Availability remains provider stated. Exact source actions retain existing routes.

Quota is server-owned: 40/calendar UTC day, 6/minute, 500/global UTC day. No limit increase/reset. Return window start/end, used/remaining/percent, blocking scope and reset timestamp. Status reads do not consume allowance. Client renders reset in device local time and keeps Search available.

Integration starts from #156, includes #143–#155 by ancestry. No reset to stale main. Full PR/CI snapshot is in evidence/global-search-baseline-2026-09-28.json. Older PR ancestry still requires reconciliation before consolidation.
