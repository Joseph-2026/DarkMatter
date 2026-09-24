export * as A2A from "./a2a"

import { and, asc, eq } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"
import { A2A } from "@apt5/schema/a2a"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import { A2AMessageTable } from "./a2a/sql"

export const MessageID = A2A.MessageID
export type MessageID = A2A.MessageID

export const MessageStatus = A2A.MessageStatus
export type MessageStatus = A2A.MessageStatus

// Swarm channel convention: runs in one swarm share a single channel address.
// Both sides of a completion announcement use it, so any run (or operator)
// sees every run.done event with one inbox read.
export function channel(swarmID: string) {
  return `swarm:${swarmID}`
}

export interface Message {
  readonly id: MessageID
  readonly from: string
  readonly to: string
  readonly type: string
  readonly payload: unknown
  readonly status: MessageStatus
}

export class Service extends Context.Service<Service, Interface>()("@opencode/A2A") {}

export interface Interface {
  readonly send: (from: string, to: string, type: string, payload: unknown) => Effect.Effect<Message>
  readonly inbox: (agent: string) => Effect.Effect<Message[]>
  readonly ack: (id: MessageID) => Effect.Effect<Message | undefined>
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const database = yield* Database.Service
    const toMessage = (row: typeof A2AMessageTable.$inferSelect): Message => ({
      id: row.id,
      from: row.from_agent,
      to: row.to_agent,
      type: row.type,
      payload: row.payload,
      status: row.status,
    })
    return Service.of({
      send: Effect.fn("A2A.send")(function* (from: string, to: string, type: string, payload: unknown) {
        const id = MessageID.create()
        yield* database.db
          .insert(A2AMessageTable)
          .values({ id, from_agent: from, to_agent: to, type, payload, status: "pending" })
          .pipe(Effect.orDie)
        return { id, from, to, type, payload, status: "pending" as MessageStatus }
      }),
      inbox: Effect.fn("A2A.inbox")(function* (agent: string) {
        const rows = yield* database.db
          .select()
          .from(A2AMessageTable)
          .where(and(eq(A2AMessageTable.to_agent, agent), eq(A2AMessageTable.status, "pending")))
          .orderBy(asc(A2AMessageTable.time_created))
          .all()
          .pipe(Effect.orDie)
        return rows.map(toMessage)
      }),
      ack: Effect.fn("A2A.ack")(function* (id: MessageID) {
        const row = yield* database.db
          .update(A2AMessageTable)
          .set({ status: "delivered" })
          .where(eq(A2AMessageTable.id, id))
          .returning()
          .get()
          .pipe(Effect.orDie)
        if (!row) return undefined
        return toMessage(row)
      }),
    })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node] })
