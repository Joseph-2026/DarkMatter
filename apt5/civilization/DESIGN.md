# APT-5 Civilization Layers — Design (Round 1)

## Decision log
- **Location**: `packages/core` domains (not a new package). Reuses `Database`,
  migrations, `testEffect` harness; zero workspace-wiring risk.
- **No HttpApi changes this round**: avoids client regen + vendor tarball rebuild.
  API exposure is Round 2.
- **Service tags** keep `@opencode/...` convention (internal Layer identity,
  matches every existing tag in repo).
- **IDs**: `prefix_` + `ascending()` from `@apt5/schema/identifier`
  (sortable, unique); branded per domain.
- **Ledger is append-only**: no update/delete in the interface.
- **Governance `evaluate` writes its audit row in the same Effect** (no silent decisions).
- **A2A is local transport** (same SQLite DB) this round; HTTP comes with the API round.
- Migrations are **generated** (`bun script/migration.ts --name civilization`),
  never hand-written (`--check` must stay green).

## Domains
| Domain | Tables | Service |
|---|---|---|
| work-board | `work_board`, `work_task` | boards + tasks, `moveTask` changes status |
| memory-os | `memory_entry` (unique namespace,key) | put/get/list/forget |
| ledger | `ledger_entry` | record/list/summary, append-only |
| a2a | `a2a_message` | send/inbox/ack |
| governance | `governance_rule`, `governance_audit` | addRule/listRules/evaluate |

## Round 2 — HttpApi (2026-09-23, PR #5 `civilization-api`)

- **Groups:** `work-board`, `memory-os`, `ledger`, `a2a`, `governance` in `InstanceHttpApi` (`api.ts:78`) + 5 handlers + 3 NotFound errors.
- **Wiring:** `server.ts` app `LayerNode.group` now includes `WorkBoard.node, MemoryOS.node, Ledger.node, A2A.node, Governance.node` (fix `ad8ef1e` for typecheck).
- **Contract:** All endpoints workspace-routed + auth via `InstanceContextMiddleware`/`WorkspaceRoutingMiddleware`/`Authorization` — pattern copied from `config.ts`/`session.ts`.
- **Collab:** Spark (core) ↔ Claude (TUI) via `A2A` table + `BOARD.md` + `INBOX-*` + `API-FOR-TUI.md` — lanes respected, no core/TUI conflict.
- **CI:** `build-and-check` heavy runner (local RAM insufficient); `secrets-guard` + `smoke` pass, typecheck fix pending green.

## Gates
`bun typecheck` (package dir) → commit → push → CI
(`build-and-check`, `secrets-guard`, smoke) → merge → release `apt-5-v1.0.0`.
