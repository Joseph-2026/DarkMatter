# Release Notes — apt-5-v1.0.0

**Date:** 2026-09-23 — **main:** `1c8f3699425632b754965c76bbb221fe469c4f2b` (PR #10 merge) — repo `Joseph-2026/DarkMatter`
Verified via `gh pr list`, `gh run list --branch main`, `gh pr checks` on 2026-09-23.

## Shipped (per merged PR, all CI success on main)

- **PR #1 — Rebrand v1** — merge `c5537e15b` (2026-09-22T16:45:06Z, head `b5023fe96`). Run `35756184618`: success. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35756184618
- **PR #2 — civilization layers round 1** — merge `4e1ff5c5e` (2026-09-23T04:12:17Z, head `f49bdc71b`). 5 domains + migration `20260923035633_civilization` + tests.
- **PR #3 — free router** — merge `2ece93046` (2026-09-23T04:50:31Z, head `211717ace`). `FreeRouter.Chain` + `Catalog.model.free` + wire-ID guard.
- **PR #4 — agent onboarding docs** — merge `c89e5d26b` (2026-09-23T06:51:19Z, head `dac69c83d`). `START-HERE.md` + `BOARD.md`.
- **PR #5 — instance httpapi** — merge `3c27b9654` (2026-09-23T07:26:30Z, head `84cb7536a`). 5 groups + handlers. Run `35831724056`: success. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35831724056
- **PR #6 — protocol groups + client regen** — merge `ca2e75625` (2026-09-23T11:22:52Z, head `474bbfd90`). Run `35854198174`: success. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35854198174
- **PR #7 — agent team + root guide** — merge `1b26f8c68` (2026-09-23T11:36:53Z, head `e514e4c74`). Run `35855560265`: success. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35855560265
- **PR #8 — sdk regen** — merge `16614899b` (2026-09-23T11:48:39Z, head `802287193`). js v2 client with civilization namespaces. Run `35856701594`: success. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35856701594
- **PR #9 — tui read-only surfaces** — merge `2d32feece` (2026-09-23T12:06:43Z, head `d7058e698`). Board dialog + ledger summary. Run `35858468084`: success. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35858468084
- **PR #10 — civilization runtime** — merge `1c8f36994` (2026-09-23T12:40:03Z, head `9786de48b`). Runtime service + ledger auto-ingest + HTTP e2e (23 expects). Run `35861932003`: success. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35861932003

## Pending (open PRs)

None. `gh pr list --state open` is empty.

## Known debts (post-v1.0.0, tracked in BOARD §7)

- **Vendor round (deferred):** app still uses pinned `apt5-client-1.17.13-apt5.0.tgz` for its promise leg; new endpoints are served via the live `@apt5/sdk/v2` leg. Rebuild = new TS→dist pipeline + ~92 app import migrations (sdk probe). Separate round with app verification.
- **TUI mutations** (create/move tasks), memory/a2a/governance UI, app desktop surfaces, web docs pages — API-complete and HTTP-tested; surfaces are v1.1.

## Release (apt-5-v1.0.0)

Criteria met: 10/10 PRs merged, latest main run `35861932003` success, no open PRs, artifacts present (`bin/apt-5` + `darkmatter` alias, `AGENTS.md`, `.cursor/agents/` ×7, theme, migration).
Tag: `apt-5-v1.0.0` on `1c8f3699425632b754965c76bbb221fe469c4f2b`.
