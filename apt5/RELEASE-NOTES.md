# Release Notes — apt-5-v1.0.0 / v1.1.0 / v1.2.0 / v1.3.0

**Repo:** `Joseph-2026/DarkMatter` — merge SHAs below are immutable facts; tag annotations record exact release commits. Verified via `gh pr list`, `gh run list --branch main`, `gh pr checks`.

## v1.3.0 (2026-09-25) — stealth edition + world demo

- **PR #26 — world showcase + pitch** — merge `7a3752cad` (2026-09-24T14:27:40Z, head `121fb67b4`). 7-act HTTP demo (CI-enforced), PITCH.md, VIDEO-SCRIPT.md.
- **PR #27 — showcase transcript + GIF** — merge `d8c3cba6b` (2026-09-24T15:32:48Z, head `52f76d122`). Recorded green run + real terminal GIF.
- **PR #28 — models catalog + free default** — merge `7aadf9de8` (2026-09-24T17:10:11Z, head `a53ec86e8`). Real catalog URL (was dead domain), preferFreeModel + tests.
- **PR #29 — product surfaces rebrand** — merge `ff6f83ad1` (2026-09-24T19:06:57Z, head `884eb4b49`). TUI/CLI/server/app/desktop/docs display strings, apt5.json config (+fallback), support URLs.
- **PR #30 — identifiers** — merge `e6f121610` (2026-09-25T06:08:57Z, head `4f1bba1c4`). Provider IDs darkmatter, tags @apt5, API apt5-*, tools apt5, apt5.db (+automigrate).
- **PR #31 — residual strings** — merge `1b512faff` (2026-09-25T06:28:40Z, head `5343fb90f`). Keymap, errors, config filenames (62 locales).
- **PR #32 — managed paths** — merge `263bb0d84` (2026-09-25T06:48:43Z, head `3529bc8fc`). Managed dirs, mDNS apt5.local, ACP names, docs paths.
- **PR #33 — github flow removal** — merge `cb65f6018` (2026-09-25T15:17:41Z, head `9c7f34cd2`). Upstream-bot installer removed; blind test rewrites fixed (6 tests).
- **PR #34 — terminal + locales** — merge `941f423c1` (2026-09-25T16:53:40Z, head `b1a8136d2`). Terminal title APT-5, 61 desktop locales, story mock.
- **PR #35 — catalog mapping** — merge `36e5466f6` (2026-09-25T17:22:18Z, head `6efa97a44`). Upstream house data → darkmatter/APT-5 + mapping test.
- **PR #36 — data coupling** — merge `b4fb5b617` (2026-09-25T18:09:45Z, head `15ebaad29`). fromModelsDevProvider mapping, transform branches, models sort.
- **PR #37 — APT-5 logo** — merge `5cb189532` (2026-09-25T18:31:27Z, head `e6e60bd3d`). Block-letter splash, visually verified.

## v1.2.0 (2026-09-24) — A2A auth + swarm serving + surfaces

- **PR #21 — tui memory/a2a/governance surfaces** — merge `e44e83653` (2026-09-24T10:48:57Z, head `2205baca5`). namespace browser, inbox viewer, rules + evaluate (audited), commands + keybinds.
- **PR #22 — a2a signed agents** — merge `9fc1809e9` (2026-09-24T12:21:33Z, head `c85bb8c4a`). ed25519 registry, sendSigned/verify, origin tracking, both API surfaces + SDK regens, swarm split (registry static, runner location-bound), e2e incl 401 on forgery.
- **PR #23 — tui origin badges** — merge `2df287032` (2026-09-24T12:42:47Z, head `e05cee89c`). verified/service/legacy display.

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

## Known debts (post-v1.2.0, tracked in BOARD §7)

- **Vendor pin flip:** new-surface tarball built + verified (PR #17); flip awaits the app import migration window with its own QA cycle.
- **Remaining surfaces:** app desktop surfaces — API-complete and HTTP-tested; v1.3.
- **Dart SDK** (generator-blocked upstream) replaced by `c` in the 20-language matrix; `go` needs upstream recursive-type fix to compile. Both recorded in `sdks/README.md` + `manifest.json`.

## Release (apt-5-v1.0.0) — shipped 2026-09-23

Criteria met: 13/13 PRs merged (#1–#13, SHAs above), main CI green at merge time for each, no open PRs, artifacts present (`bin/apt-5` + `darkmatter` alias, `AGENTS.md`, `.cursor/agents/` ×7, theme, migrations).
Tag `apt-5-v1.0.0` created on the green main HEAD; annotation records the exact SHA.

## Release (apt-5-v1.1.0) — shipped 2026-09-24

19/19 PRs merged (#1–#19), main CI green, no open PRs. Tag `apt-5-v1.1.0` created on the green main HEAD; annotation records the exact SHA.

## Release (apt-5-v1.2.0) — criteria

23/23 PRs merged (#1–#23 above), main CI green, no open PRs. Tag `apt-5-v1.2.0` on the green main HEAD; annotation records the exact SHA (no pre-pin by design).
