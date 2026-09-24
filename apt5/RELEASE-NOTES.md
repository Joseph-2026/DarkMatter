# Release Notes — apt-5-v1.0.0 / v1.1.0

**Repo:** `Joseph-2026/DarkMatter` — merge SHAs below are immutable facts; tag annotations record exact release commits. Verified via `gh pr list`, `gh run list --branch main`, `gh pr checks`.

## v1.1.0 (2026-09-24) — swarm + vendor pipeline + TUI mutations + docs

- **PR #15 — swarm orchestrator** — merge `a5aa3e47e` (2026-09-24T06:04:29Z, head `4d46c66e2`). Swarm/run registry + migration, one brain (`Catalog.model.free`, `NoBrainError`), preamble, spawnRun with real sessions.
- **PR #16 — swarm demo chain** — merge `b40a2580a` (2026-09-24T07:56:09Z, head `96e069d73`). researcher→coder→reviewer accumulation proof, A2A channel convention, completed tasks visible in preamble.
- **PR #17 — vendor pipeline (pin unchanged)** — merge `242495b9e` (2026-09-24T08:18:37Z, head `a078bfad5`). New-surface tarball `apt5-client-1.18.32-apt5.0.tgz` built + verified; app pin stays (evidence: 1 value-use + 24 type-only files; new client has different construction).
- **PR #18 — tui mutations** — merge `810e20f3c` (2026-09-24T08:45:10Z, head `730f5c74f`). create/move tasks with server refresh, error toasts. Run `35977087623`: success. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35977087623
- **PR #19 — docs pages** — merge `6ba024aba` (2026-09-24T09:18:58Z, head `29718c324`). free-router, governance, openrouter provider (all claims cited path:line).

## v1.0.0 (2026-09-23) — PRs #1–#13

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
- **PR #11 — release docs + vendor deferral** — merge `5c3a49e4c` (2026-09-23T14:42:10Z, head `1ced3f1ef`). Run on main: success.
- **PR #12 — 20-language SDK matrix + civilization indexes** — merge `2b378e836` (2026-09-23T18:09:11Z, head `d5063b68c`). Spec + normalize + generate.sh (20 langs) + manifest (20/20 present, 23,735 files, 138MB) + CI `sdk-matrix` job + 5 DB indexes. Run `35900491945`: success. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35900491945
- **PR #13 — release notes current** — merge `070b2f60d` (2026-09-23T18:36:25Z, head `37f1539de`). Docs only.

## Pending (open PRs)

None. `gh pr list --state open` is empty.

## Known debts (post-v1.1.0, tracked in BOARD §7)

- **Vendor pin flip:** new-surface tarball built + verified (PR #17); flip awaits the app import migration window with its own QA cycle.
- **Remaining surfaces:** memory/a2a/governance UI, app desktop surfaces — API-complete and HTTP-tested; v1.2.
- **Dart SDK** (generator-blocked upstream) replaced by `c` in the 20-language matrix; `go` needs upstream recursive-type fix to compile. Both recorded in `sdks/README.md` + `manifest.json`.

## Release (apt-5-v1.0.0) — shipped 2026-09-23

Criteria met: 13/13 PRs merged (#1–#13, SHAs above), main CI green at merge time for each, no open PRs, artifacts present (`bin/apt-5` + `darkmatter` alias, `AGENTS.md`, `.cursor/agents/` ×7, theme, migrations).
Tag `apt-5-v1.0.0` created on the green main HEAD; annotation records the exact SHA.

## Release (apt-5-v1.1.0) — criteria

19/19 PRs merged (#1–#19 above), main CI green, no open PRs. Tag `apt-5-v1.1.0` on the green main HEAD; annotation records the exact SHA (no pre-pin by design).
