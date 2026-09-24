import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AgentV2 } from "@apt5/core/agent"
import { Credential } from "@apt5/core/credential"
import { Integration } from "@apt5/core/integration"
import { Policy } from "@apt5/core/policy"
import { ProviderV2 } from "@apt5/core/provider"
import { ModelV2 } from "@apt5/core/model"
import { ProjectV2 } from "@apt5/core/project"
import { Location } from "@apt5/core/location"
import { AbsolutePath } from "@apt5/core/schema"
import { Catalog } from "@apt5/core/catalog"
import { Database } from "@apt5/core/database/database"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { EventV2 } from "@apt5/core/event"
import { A2A } from "@apt5/core/a2a"
import { MemoryOS } from "@apt5/core/memory-os"
import { WorkBoard } from "@apt5/core/work-board"
import { SessionV2 } from "@apt5/core/session"
import { SessionExecution } from "@apt5/core/session/execution"
import { SessionProjector } from "@apt5/core/session/projector"
import { SessionStore } from "@apt5/core/session/store"
import { Swarm } from "@apt5/core/swarm"
import { testEffect } from "./lib/effect"
import { tmpdir } from "./fixture/tmpdir"
import { location } from "./fixture/location"

const locationLayer = Layer.succeed(
  Location.Service,
  Location.Service.of(location({ directory: AbsolutePath.make("project") })),
)

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Expected value")
  return value
}

const projects = Layer.succeed(
  ProjectV2.Service,
  ProjectV2.Service.of({
    resolve: (directory) => Effect.succeed({ id: ProjectV2.ID.global, directory }),
    directories: () => Effect.succeed([]),
    commit: () => Effect.void,
  }),
)

const services = AppNodeBuilder.build(
  LayerNode.group([
    Database.node,
    EventV2.node,
    SessionProjector.node,
    SessionStore.node,
    SessionV2.node,
    WorkBoard.node,
    MemoryOS.node,
    Catalog.node,
    Credential.node,
    Integration.node,
    Policy.node,
    A2A.node,
    Swarm.node,
    Swarm.runnerNode,
  ]),
  [
    [ProjectV2.node, projects],
    [Location.node, locationLayer],
    [SessionExecution.node, SessionExecution.noopLayer],
  ],
)
const it = testEffect(services)

const seedBrain = Effect.gen(function* () {
  const catalog = yield* Catalog.Service
  const credentials = yield* Credential.Service
  yield* catalog.transform((editor) => {
    editor.provider.update(ProviderV2.ID.openrouter, () => {})
    editor.model.update(ProviderV2.ID.openrouter, ModelV2.ID.make("nex-agi/nex-n2.5-mini:free"), () => {})
  })
  yield* credentials.create({
    integrationID: Integration.ID.make("openrouter"),
    label: "Swarm",
    value: Credential.Key.make({ type: "key", key: "swarm", metadata: { tenant: "swarm" } }),
  })
})

describe("Swarm", () => {
  it.effect("creates a swarm with a board, resolves one brain, and shares preamble", () =>
    Effect.gen(function* () {
      const swarm = yield* Swarm.Service
      yield* seedBrain

      const created = yield* swarm.createSwarm("Calculator")
      expect(created.name).toBe("Calculator")
      expect(created.status).toBe("active")
      expect(created.boardID).toBeDefined()

      const runner = yield* Swarm.RunnerService
      const brain = yield* runner.resolveBrain()
      expect(String(brain.id)).toBe("nex-agi/nex-n2.5-mini:free")
      expect(String(brain.providerID)).toBe("openrouter")

      const preamble = yield* swarm.sharedPreamble(created.id)
      expect(preamble).toContain("No tasks yet.")

      const memory = yield* MemoryOS.Service
      yield* memory.put(`swarm:${String(created.id)}`, "stack", "bun")
      const preamble2 = yield* swarm.sharedPreamble(created.id)
      expect(preamble2).toContain("stack")
    }),
  )

  it.effect("spawns a run as a real session with board linkage", () =>
    Effect.gen(function* () {
      const swarm = yield* Swarm.Service
      const sessions = yield* SessionV2.Service
      const boards = yield* WorkBoard.Service
      const tmp = yield* Effect.promise(() => tmpdir())
      try {
        yield* seedBrain
      const created = yield* swarm.createSwarm("Calc")
      const runner = yield* Swarm.RunnerService
      const run = required(
        yield* runner.spawnRun(created.id, {
            role: AgentV2.ID.make("researcher"),
            task: "Research calculator structure",
            directory: tmp.path,
          }),
        )
        expect(run.status).toBe("running")
        expect(run.sessionID).toBeDefined()

        const session = yield* sessions.get(SessionV2.ID.make(required(run.sessionID))).pipe(Effect.orDie)
        expect(session).toBeDefined()

        const tasks = yield* boards.listTasks(required(created.boardID))
        expect(tasks.length).toBe(1)

        const done = required(yield* swarm.completeRun(run.id))
        expect(done.status).toBe("done")
      } finally {
        yield* Effect.promise(() => tmp[Symbol.asyncDispose]())
      }
    }),
  )
})
