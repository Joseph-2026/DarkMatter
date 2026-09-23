export * as MemoryOS from "./memory-os"

import { and, asc, eq } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"
import { MemoryOS } from "@apt5/schema/memory-os"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import { MemoryEntryTable } from "./memory-os/sql"

export const EntryID = MemoryOS.EntryID
export type EntryID = MemoryOS.EntryID

export interface Entry {
  readonly id: EntryID
  readonly namespace: string
  readonly key: string
  readonly value: unknown
}

export class Service extends Context.Service<Service, Interface>()("@opencode/MemoryOS") {}

export interface Interface {
  readonly put: (namespace: string, key: string, value: unknown) => Effect.Effect<Entry>
  readonly get: (namespace: string, key: string) => Effect.Effect<Entry | undefined>
  readonly list: (namespace: string) => Effect.Effect<Entry[]>
  readonly forget: (namespace: string, key: string) => Effect.Effect<boolean>
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const database = yield* Database.Service
    return Service.of({
      put: Effect.fn("MemoryOS.put")(function* (namespace: string, key: string, value: unknown) {
        const existing = yield* database.db
          .select()
          .from(MemoryEntryTable)
          .where(and(eq(MemoryEntryTable.namespace, namespace), eq(MemoryEntryTable.key, key)))
          .get()
          .pipe(Effect.orDie)
        if (existing) {
          const row = yield* database.db
            .update(MemoryEntryTable)
            .set({ value })
            .where(eq(MemoryEntryTable.id, existing.id))
            .returning()
            .get()
            .pipe(Effect.orDie)
          return { id: existing.id, namespace, key, value: row?.value ?? value }
        }
        const id = EntryID.create()
        yield* database.db.insert(MemoryEntryTable).values({ id, namespace, key, value }).pipe(Effect.orDie)
        return { id, namespace, key, value }
      }),
      get: Effect.fn("MemoryOS.get")(function* (namespace: string, key: string) {
        const row = yield* database.db
          .select()
          .from(MemoryEntryTable)
          .where(and(eq(MemoryEntryTable.namespace, namespace), eq(MemoryEntryTable.key, key)))
          .get()
          .pipe(Effect.orDie)
        if (!row) return undefined
        return { id: row.id, namespace: row.namespace, key: row.key, value: row.value }
      }),
      list: Effect.fn("MemoryOS.list")(function* (namespace: string) {
        const rows = yield* database.db
          .select()
          .from(MemoryEntryTable)
          .where(eq(MemoryEntryTable.namespace, namespace))
          .orderBy(asc(MemoryEntryTable.time_created))
          .all()
          .pipe(Effect.orDie)
        return rows.map((row) => ({ id: row.id, namespace: row.namespace, key: row.key, value: row.value }))
      }),
      forget: Effect.fn("MemoryOS.forget")(function* (namespace: string, key: string) {
        const row = yield* database.db
          .delete(MemoryEntryTable)
          .where(and(eq(MemoryEntryTable.namespace, namespace), eq(MemoryEntryTable.key, key)))
          .returning()
          .get()
          .pipe(Effect.orDie)
        return row !== undefined
      }),
    })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node] })
