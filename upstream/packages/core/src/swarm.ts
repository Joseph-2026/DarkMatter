export * as Swarm from "./swarm"

import { asc, eq } from "drizzle-orm"
import { Context, Effect, Layer, Schema } from "effect"
import { A2A } from "./a2a"
import { Catalog } from "./catalog"
import { Database } from "./database/database"
import { makeLocationNode } from "./effect/app-node"
import { Location } from "./location"
import { MemoryOS } from "./memory-os"
import { ModelV2 } from "./model"
import { AbsolutePath } from "./schema"
import { AgentV2 } from "./agent"
import { Prompt } from "./session/prompt"
import { SessionV2 } from "./session"
import { WorkBoard } from "./work-board"
import { Swarm as SwarmSchema } from "@apt5/schema/swarm"
import { SwarmRunTable, SwarmTable } from "./swarm/sql"

export const SwarmID = SwarmSchema.SwarmID
export type SwarmID = SwarmSchema.SwarmID

export const RunID = SwarmSchema.RunID
export type RunID = SwarmSchema.RunID

export const SwarmStatus = SwarmSchema.SwarmStatus
export type SwarmStatus = SwarmSchema.SwarmStatus

export const RunStatus = SwarmSchema.RunStatus
export type RunStatus = SwarmSchema.RunStatus

export class NoBrainError extends Schema.TaggedErrorClass<NoBrainError>()("Swarm.NoBrainError", {
  message: Schema.String,
}) {}

export interface Info {
  readonly id: SwarmID
  readonly name: string
  readonly status: SwarmStatus
  readonly boardID: WorkBoard.BoardID | undefined
}

export interface Run {
  readonly id: RunID
  readonly swarmID: SwarmID
  readonly role: string
  readonly task: string
  readonly directory: string
  readonly sessionID: string | undefined
  readonly status: RunStatus
}

export interface SpawnInput {
  readonly role: AgentV2.ID
  readonly task: string
  readonly directory: string
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Swarm") {}

export interface Interface {
  readonly createSwarm: (name: string) => Effect.Effect<Info>
  readonly getSwarm: (id: SwarmID) => Effect.Effect<Info | undefined>
  readonly listRuns: (swarmID: SwarmID) => Effect.Effect<Run[]>
  readonly resolveBrain: () => Effect.Effect<ModelV2.Ref, NoBrainError>
  readonly sharedPreamble: (swarmID: SwarmID) => Effect.Effect<string>
  readonly spawnRun: (
    swarmID: SwarmID,
    input: SpawnInput,
  ) => Effect.Effect<Run | undefined, NoBrainError | SessionV2.NotFoundError | SessionV2.PromptConflictError>
  readonly completeRun: (id: RunID) => Effect.Effect<Run | undefined>
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const database = yield* Database.Service
    const boards = yield* WorkBoard.Service
    const memory = yield* MemoryOS.Service
    const catalog = yield* Catalog.Service
    const sessions = yield* SessionV2.Service
    const bus = yield* A2A.Service

    const toInfo = (row: typeof SwarmTable.$inferSelect): Info => ({
      id: row.id,
      name: row.name,
      status: row.status,
      boardID: row.board_id ?? undefined,
    })

    const toRun = (row: typeof SwarmRunTable.$inferSelect): Run => ({
      id: row.id,
      swarmID: row.swarm_id,
      role: row.role,
      task: row.task,
      directory: row.directory,
      sessionID: row.session_id ?? undefined,
      status: row.status,
    })

    const brainRef = Effect.fn("Swarm.brainRef")(function* () {
      const free = yield* catalog.model.free()
      const fallback = free ?? (yield* catalog.model.default())
      if (!fallback) return yield* new NoBrainError({ message: "No model available for swarm runs" })
      return ModelV2.Ref.make({ id: fallback.id, providerID: fallback.providerID })
    })

    const preambleText = Effect.fn("Swarm.preamble")(function* (swarmID: SwarmID) {
      const swarm = yield* database.db
        .select()
        .from(SwarmTable)
        .where(eq(SwarmTable.id, swarmID))
        .get()
        .pipe(Effect.orDie)
      const tasks = swarm?.board_id ? yield* boards.listTasks(swarm.board_id) : []
      const memories = yield* memory.list(`swarm:${String(swarmID)}`)
      const lines = ["## Shared context (read first, left by earlier runs)"]
      if (tasks.length === 0) lines.push("- No tasks yet.")
      for (const task of tasks) lines.push(`- [${task.status}] ${task.title}`)
      if (memories.length > 0) {
        lines.push("## Shared memory")
        for (const entry of memories) lines.push(`- ${entry.key}: ${JSON.stringify(entry.value)}`)
      }
      return lines.join("\n")
    })

    return Service.of({
      createSwarm: Effect.fn("Swarm.createSwarm")(function* (name: string) {
        const id = SwarmID.create()
        const board = yield* boards.createBoard(`Swarm: ${name}`)
        yield* database.db.insert(SwarmTable).values({ id, name, status: "active", board_id: board.id }).pipe(Effect.orDie)
        return { id, name, status: "active" as SwarmStatus, boardID: board.id }
      }),
      getSwarm: Effect.fn("Swarm.getSwarm")(function* (id: SwarmID) {
        const row = yield* database.db
          .select()
          .from(SwarmTable)
          .where(eq(SwarmTable.id, id))
          .get()
          .pipe(Effect.orDie)
        if (!row) return undefined
        return toInfo(row)
      }),
      listRuns: Effect.fn("Swarm.listRuns")(function* (swarmID: SwarmID) {
        const rows = yield* database.db
          .select()
          .from(SwarmRunTable)
          .where(eq(SwarmRunTable.swarm_id, swarmID))
          .orderBy(asc(SwarmRunTable.time_created))
          .all()
          .pipe(Effect.orDie)
        return rows.map(toRun)
      }),
      resolveBrain: Effect.fn("Swarm.resolveBrain")(function* () {
        return yield* brainRef()
      }),
      sharedPreamble: Effect.fn("Swarm.sharedPreamble")(function* (swarmID: SwarmID) {
        return yield* preambleText(swarmID)
      }),
      spawnRun: Effect.fn("Swarm.spawnRun")(function* (swarmID: SwarmID, input: SpawnInput) {
        const swarm = yield* database.db
          .select()
          .from(SwarmTable)
          .where(eq(SwarmTable.id, swarmID))
          .get()
          .pipe(Effect.orDie)
        if (!swarm) return undefined
        const brain = yield* brainRef()
        const location = Location.Ref.make({ directory: AbsolutePath.make(input.directory) })
        const info = yield* sessions.create({ agent: input.role, model: brain, location })
        const preamble = yield* preambleText(swarmID)
        const boardTask = swarm.board_id
          ? yield* boards.createTask(swarm.board_id, `${String(input.role)}: ${input.task.slice(0, 80)}`)
          : undefined
        const id = RunID.create()
        yield* database.db
          .insert(SwarmRunTable)
          .values({
            id,
            swarm_id: swarmID,
            role: String(input.role),
            task: input.task,
            directory: input.directory,
            session_id: String(info.id),
            task_id: boardTask?.id,
            status: "running",
          })
          .pipe(Effect.orDie)
        yield* sessions.prompt({
          sessionID: info.id,
          prompt: Prompt.make({ text: `${preamble}\n\n## Task (${String(input.role)})\n${input.task}` }),
        })
        const created = yield* database.db
          .select()
          .from(SwarmRunTable)
          .where(eq(SwarmRunTable.id, id))
          .get()
          .pipe(Effect.orDie)
        if (!created) return undefined
        return toRun(created)
      }),
      completeRun: Effect.fn("Swarm.completeRun")(function* (id: RunID) {
        const row = yield* database.db
          .select()
          .from(SwarmRunTable)
          .where(eq(SwarmRunTable.id, id))
          .get()
          .pipe(Effect.orDie)
        if (!row) return undefined
        if (row.task_id) yield* boards.moveTask(row.task_id, "done").pipe(Effect.orDie)
        const channel = A2A.channel(String(row.swarm_id))
        yield* bus
          .send(channel, channel, "run.done", {
            runID: String(row.id),
            role: row.role,
          })
          .pipe(Effect.orDie)
        const updated = yield* database.db
          .update(SwarmRunTable)
          .set({ status: "done" })
          .where(eq(SwarmRunTable.id, id))
          .returning()
          .get()
          .pipe(Effect.orDie)
        if (!updated) return undefined
        return toRun(updated)
      }),
    })
  }),
)

export const node = makeLocationNode({
  service: Service,
  layer,
  deps: [Database.node, WorkBoard.node, MemoryOS.node, Catalog.node, SessionV2.node, A2A.node],
})
