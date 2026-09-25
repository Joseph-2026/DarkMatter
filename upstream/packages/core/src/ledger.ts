export * as Ledger from "./ledger"

import { asc, eq } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"
import { Ledger } from "@apt5/schema/ledger"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import { LedgerEntryTable } from "./ledger/sql"

export const EntryID = Ledger.EntryID
export type EntryID = Ledger.EntryID

export interface RecordInput {
  readonly sessionID: string
  readonly providerID: string
  readonly modelID: string
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cost: number
}

export interface Entry extends RecordInput {
  readonly id: EntryID
}

export interface Summary {
  readonly entries: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly cost: number
}

export class Service extends Context.Service<Service, Interface>()("/Ledger") {}

export interface Interface {
  readonly record: (input: RecordInput) => Effect.Effect<Entry>
  readonly list: (sessionID?: string) => Effect.Effect<Entry[]>
  readonly summary: () => Effect.Effect<Summary>
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const database = yield* Database.Service
    const toEntry = (row: typeof LedgerEntryTable.$inferSelect): Entry => ({
      id: row.id,
      sessionID: row.session_id,
      providerID: row.provider_id,
      modelID: row.model_id,
      inputTokens: row.input_tokens,
      outputTokens: row.output_tokens,
      cost: row.cost,
    })
    return Service.of({
      record: Effect.fn("Ledger.record")(function* (input: RecordInput) {
        const id = EntryID.create()
        yield* database.db
          .insert(LedgerEntryTable)
          .values({
            id,
            session_id: input.sessionID,
            provider_id: input.providerID,
            model_id: input.modelID,
            input_tokens: input.inputTokens,
            output_tokens: input.outputTokens,
            cost: input.cost,
          })
          .pipe(Effect.orDie)
        return { id, ...input }
      }),
      list: Effect.fn("Ledger.list")(function* (sessionID?: string) {
        const base = database.db.select().from(LedgerEntryTable).orderBy(asc(LedgerEntryTable.time_created))
        const rows = yield* (sessionID === undefined
          ? base.all().pipe(Effect.orDie)
          : base.where(eq(LedgerEntryTable.session_id, sessionID)).all().pipe(Effect.orDie))
        return rows.map(toEntry)
      }),
      summary: Effect.fn("Ledger.summary")(function* () {
        const rows = yield* database.db.select().from(LedgerEntryTable).all().pipe(Effect.orDie)
        return {
          entries: rows.length,
          inputTokens: rows.reduce((total, row) => total + row.input_tokens, 0),
          outputTokens: rows.reduce((total, row) => total + row.output_tokens, 0),
          cost: rows.reduce((total, row) => total + row.cost, 0),
        }
      }),
    })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node] })
