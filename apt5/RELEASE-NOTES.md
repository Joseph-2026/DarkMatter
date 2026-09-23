# Release Notes — apt-5-v1.0.0 (draft, collaboration ongoing)

**Date:** 2026-09-23 — **Branch:** `main` @ `3c27b96` (PR #5 merged) + `board-update` PR #6 (protocol regen pending CI)
**Team:** Spark (core) ↔ Claude (TUI) via `A2A` + `BOARD.md` + PRs — lanes respected, CI green

## What shipped

- **Rebrand v1 (PR #1):** `apt-5` binary + `darkmatter` alias, `.apt5` config, `APT5_*` env, `@apt5/*` scopes — wire compat `opencode` IDs via `CREDITS.md`
- **Civilization Round 1 (PR #2):** 5 core domains + migration `20260923035633_civilization` — `work_board`, `memory_entry`, `ledger_entry`, `a2a_message`, `governance_rule/audit` + `testEffect` harness, no mocks
- **Free Router (PR #3):** `FreeRouter.Chain` (nex-agi → nvidia → liquid → cohere) + `Catalog.model.free` + guard test
- **Civilization Round 2 — InstanceHttpApi (PR #5 `3c27b96`, CI green 3m06s):**
  - 5 groups `work-board` (5 endpoints), `memory-os` (4), `ledger` (3), `a2a` (3), `governance` (3) — `InstanceHttpApi` + handlers + `WorkTaskNotFound` etc
  - `server.ts` app wiring (`WorkBoard.node` etc) — fix `ad8ef1e`
  - Docs `API-FOR-TUI.md` + `DESIGN.md` Round 2 + `INBOX` A2A transcript (8 messages, all delivered)
- **Protocol + Client Regen (PR #6 `board-update`, in_progress):**
  - `protocol/src/groups/*` 5 groups + `protocol/src/api.ts` + `errors.ts` + `server/src/handlers/*` 5 + `client/src/contract.ts` endpointNames fix (`workboards.create` collision) + `generated/*` 756 lines

## Collaboration evidence

- **A2A:** `spark→claude` handshake → update → fix → api-spec → ci-success → merged → pr6 → protocol (7) + `claude→spark` reply → progress → tui-ready (3) — all via `A2A.Service` (`a2a_0cd*`), DB `/home/blackhat/.local/share/darkmatter/opencode-local.db`
- **BOARD:** `apt5/collab/BOARD.md:2` post-merge + `§7` queue (Round 2 [x], TUI unblocked)
- **CI:** `build-and-check` heavy runner, `secrets-guard`, `smoke` — all green on `main` (PR #5 3m11s, PR #6 pending)

## Still in progress (TUI lane — Claude, unblocked)

- **TUI surfaces:** `packages/tui, ui, web, app, desktop` — WorkBoard kanban + Memory list + Ledger summary — consumes `API-FOR-TUI.md`
- **Docs:** `packages/web` provider + free-router + governance policy format
- **Vendor:** `apt5-client-1.17.13-apt5.0.tgz` still pinned — rebuild needs app verification (separate round)
- **Release:** `apt-5-v1.0.0` tag after TUI/docs/protocol all green

## Gates

`bun run typecheck` (pkg dir) → `bun test --timeout 30000` (core 5 pass) → commit (conventional) → push → CI green → merge → release

## Next (Spark + Claude)

- Spark: finish `PR #6` CI → merge → help TUI via `BOARD §7` requests (no lane violation)
- Claude: TUI PR + docs PR (zero conflict)
- Joseph: final lane/merge decisions

— *Draft — collaboration haijasimama, tunaendelea!*
