export * as A2A from "./a2a"

import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from "node:crypto"
import { and, asc, eq } from "drizzle-orm"
import { Context, Effect, Layer, Schema } from "effect"
import { A2A } from "@apt5/schema/a2a"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import type { Swarm } from "./swarm"
import { A2AMessageTable, SwarmAgentTable } from "./a2a/sql"

export const MessageID = A2A.MessageID
export type MessageID = A2A.MessageID

export const MessageStatus = A2A.MessageStatus
export type MessageStatus = A2A.MessageStatus

export const AgentID = A2A.AgentID
export type AgentID = A2A.AgentID

export const MessageOrigin = A2A.MessageOrigin
export type MessageOrigin = A2A.MessageOrigin

// Swarm channel convention: runs in one swarm share a single channel address.
// Both sides of a completion announcement use it, so any run (or operator)
// sees every run.done event with one inbox read.
export function channel(swarmID: string) {
  return `swarm:${swarmID}`
}

// Canonical JSON: recursive key sort so signatures verify across languages.
export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null"
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`
  const entries = Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`)
  return `{${entries.join(",")}}`
}

export function signPayload(privateKeyPem: string, from: string, to: string, type: string, payload: unknown) {
  const key = createPrivateKey({ key: privateKeyPem, format: "pem" })
  return sign(null, Buffer.from(canonical({ from, to, type, payload })), key).toString("base64")
}

export function verifyPayload(
  publicKeyPem: string,
  from: string,
  to: string,
  type: string,
  payload: unknown,
  signature: string,
) {
  try {
    const key = createPublicKey({ key: publicKeyPem, format: "pem" })
    return verify(null, Buffer.from(canonical({ from, to, type, payload })), key, Buffer.from(signature, "base64"))
  } catch {
    return false
  }
}

export class AgentNotFoundError extends Schema.TaggedErrorClass<AgentNotFoundError>()("A2A.AgentNotFoundError", {
  agentID: Schema.String,
}) {}

export class InvalidSignatureError extends Schema.TaggedErrorClass<InvalidSignatureError>()(
  "A2A.InvalidSignatureError",
  { agentID: Schema.String },
) {}

export interface Message {
  readonly id: MessageID
  readonly from: string
  readonly to: string
  readonly type: string
  readonly payload: unknown
  readonly status: MessageStatus
  readonly origin: MessageOrigin
  readonly signature: string | undefined
}

export interface Agent {
  readonly id: AgentID
  readonly swarmID: Swarm.SwarmID
  readonly name: string
}

export interface Registration extends Agent {
  readonly privateKey: string
}

export class Service extends Context.Service<Service, Interface>()("@opencode/A2A") {}

export interface Interface {
  readonly send: (
    from: string,
    to: string,
    type: string,
    payload: unknown,
    origin?: MessageOrigin,
  ) => Effect.Effect<Message>
  readonly sendSigned: (
    agentID: AgentID,
    input: { to: string; type: string; payload: unknown },
    signature: string,
  ) => Effect.Effect<Message, AgentNotFoundError | InvalidSignatureError>
  readonly registerAgent: (swarmID: Swarm.SwarmID, name: string) => Effect.Effect<Registration>
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
      origin: row.origin,
      signature: row.signature ?? undefined,
    })
    const store = Effect.fn("A2A.store")(function* (
      from: string,
      to: string,
      type: string,
      payload: unknown,
      origin: MessageOrigin,
      signature?: string,
    ) {
      const id = MessageID.create()
      yield* database.db
        .insert(A2AMessageTable)
        .values({ id, from_agent: from, to_agent: to, type, payload, status: "pending", origin, signature })
        .pipe(Effect.orDie)
      return { id, from, to, type, payload, status: "pending" as MessageStatus, origin, signature }
    })
    return Service.of({
      send: Effect.fn("A2A.send")(function* (
        from: string,
        to: string,
        type: string,
        payload: unknown,
        origin: MessageOrigin = "legacy",
      ) {
        return yield* store(from, to, type, payload, origin)
      }),
      sendSigned: Effect.fn("A2A.sendSigned")(function* (
        agentID: AgentID,
        input: { to: string; type: string; payload: unknown },
        signature: string,
      ) {
        const agent = yield* database.db
          .select()
          .from(SwarmAgentTable)
          .where(eq(SwarmAgentTable.id, agentID))
          .get()
          .pipe(Effect.orDie)
        if (!agent) return yield* new AgentNotFoundError({ agentID: String(agentID) })
        const valid = verifyPayload(agent.public_key, agent.name, input.to, input.type, input.payload, signature)
        if (!valid) return yield* new InvalidSignatureError({ agentID: String(agentID) })
        return yield* store(agent.name, input.to, input.type, input.payload, "signed", signature)
      }),
      registerAgent: Effect.fn("A2A.registerAgent")(function* (swarmID: Swarm.SwarmID, name: string) {
        const { publicKey, privateKey } = generateKeyPairSync("ed25519")
        const id = AgentID.create()
        yield* database.db
          .insert(SwarmAgentTable)
          .values({
            id,
            swarm_id: swarmID,
            name,
            public_key: publicKey.export({ type: "spki", format: "pem" }).toString(),
          })
          .pipe(Effect.orDie)
        return { id, swarmID, name, privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString() }
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
