export * as Civilization from "./civilization"

import { count, eq } from "drizzle-orm"
import type { SQLiteTable } from "drizzle-orm/sqlite-core"
import { Context, Effect, Layer } from "effect"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import { WorkBoardTable, WorkTaskTable } from "./work-board/sql"
import { MemoryEntryTable } from "./memory-os/sql"
import { LedgerEntryTable } from "./ledger/sql"
import { A2AMessageTable } from "./a2a/sql"
import { GovernanceAuditTable, GovernanceRuleTable } from "./governance/sql"

export interface Health {
  readonly boards: number
  readonly tasks: number
  readonly memories: number
  readonly ledgerEntries: number
  readonly ledgerCost: number
  readonly pendingMessages: number
  readonly rules: number
  readonly audits: number
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Civilization") {}

export interface Interface {
  readonly boot: () => Effect.Effect<void>
  readonly health: () => Effect.Effect<Health>
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const database = yield* Database.Service

    const tableCount = <T extends SQLiteTable>(table: T) =>
      database.db
        .select({ value: count() })
        .from(table)
        .get()
        .pipe(
          Effect.orDie,
          Effect.map((row) => row?.value ?? 0),
        )

    const pendingMessages = () =>
      database.db
        .select({ value: count() })
        .from(A2AMessageTable)
        .where(eq(A2AMessageTable.status, "pending"))
        .get()
        .pipe(
          Effect.orDie,
          Effect.map((row) => row?.value ?? 0),
        )

    const ledgerCost = () =>
      database.db
        .select({ cost: LedgerEntryTable.cost })
        .from(LedgerEntryTable)
        .all()
        .pipe(
          Effect.orDie,
          Effect.map((rows) => rows.reduce((total, row) => total + row.cost, 0)),
        )

    return Service.of({
      boot: Effect.fn("Civilization.boot")(function* () {
        yield* Effect.all(
          [
            tableCount(WorkBoardTable),
            tableCount(WorkTaskTable),
            tableCount(MemoryEntryTable),
            tableCount(LedgerEntryTable),
            tableCount(A2AMessageTable),
            tableCount(GovernanceRuleTable),
            tableCount(GovernanceAuditTable),
          ],
          { discard: true },
        )
      }),
      health: Effect.fn("Civilization.health")(function* () {
        const [boards, tasks, memories, ledgerEntries, cost, pending, rules, audits] = yield* Effect.all([
          tableCount(WorkBoardTable),
          tableCount(WorkTaskTable),
          tableCount(MemoryEntryTable),
          tableCount(LedgerEntryTable),
          ledgerCost(),
          pendingMessages(),
          tableCount(GovernanceRuleTable),
          tableCount(GovernanceAuditTable),
        ])
        return {
          boards,
          tasks,
          memories,
          ledgerEntries,
          ledgerCost: cost,
          pendingMessages: pending,
          rules,
          audits,
        }
      }),
    })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node] })
