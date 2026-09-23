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

## Gates
`bun typecheck` (package dir) → commit → push → CI
(`build-and-check`, `secrets-guard`, smoke) → merge → release `apt-5-v1.0.0`.
