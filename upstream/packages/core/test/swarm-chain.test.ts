import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AgentV2 } from "@apt5/core/agent"
import { Credential } from "@apt5/core/credential"
import { Integration } from "@apt5/core/integration"
import { Policy } from "@apt5/core/policy"
import { ProviderV2 } from "@apt5/core/provider"
import { ModelV2 } from "@apt5/core/model"
import { ProjectV2 } from "@apt5/core/project"
import { Catalog } from "@apt5/core/catalog"
import { Database } from "@apt5/core/database/database"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { EventV2 } from "@apt5/core/event"
import { A2A } from "@apt5/core/a2a"
import { MemoryOS } from "@apt5/core/memory-os"
import { WorkBoard } from "@apt5/core/work-board"
import { Location } from "@apt5/core/location"
import { AbsolutePath } from "@apt5/core/schema"
import { SessionV2 } from "@apt5/core/session"
import { SessionExecution } from "@apt5/core/session/execution"
import { SessionProjector } from "@apt5/core/session/projector"
import { SessionStore } from "@apt5/core/session/store"
import { Swarm } from "@apt5/core/swarm"
import { testEffect } from "./lib/effect"
import { tmpdir } from "./fixture/tmpdir"
import { location } from "./fixture/location"

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

const locationLayer = Layer.succeed(
  Location.Service,
  Location.Service.of(location({ directory: AbsolutePath.make("project") })),
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

// Mirrors the document's live example: researcher discovers, coder builds on
// it, reviewer reads both — through shared board + memory + sessions.
describe("Swarm chain", () => {
  it.effect("researcher, coder, and reviewer build on shared state", () =>
    Effect.gen(function* () {
      const swarm = yield* Swarm.Service
      const sessions = yield* SessionV2.Service
      const memory = yield* MemoryOS.Service
      const bus = yield* A2A.Service
      const researchDir = yield* Effect.promise(() => tmpdir())
      const codeDir = yield* Effect.promise(() => tmpdir())
      const reviewDir = yield* Effect.promise(() => tmpdir())
      try {
        yield* seedBrain
        const created = yield* swarm.createSwarm("Calculator")

        const research = required(
          yield* swarm.spawnRun(created.id, {
            role: AgentV2.ID.make("researcher"),
            task: "Research calculator structure",
            directory: researchDir.path,
          }),
        )
        const researchSession = yield* sessions.get(SessionV2.ID.make(required(research.sessionID))).pipe(Effect.orDie)
        expect(String(researchSession.agent)).toBe("researcher")

        yield* memory.put(`swarm:${String(created.id)}`, "requirements", ["add", "subtract", "divide-by-zero"])
        yield* swarm.completeRun(research.id)

        const coderPreamble = yield* swarm.sharedPreamble(created.id)
        expect(coderPreamble).toContain("Research calculator structure")
        expect(coderPreamble).toContain("requirements")

        const code = required(
          yield* swarm.spawnRun(created.id, {
            role: AgentV2.ID.make("coder"),
            task: "Build calculator",
            directory: codeDir.path,
          }),
        )
        yield* swarm.completeRun(code.id)

        const reviewPreamble = yield* swarm.sharedPreamble(created.id)
        expect(reviewPreamble).toContain("Research calculator structure")
        expect(reviewPreamble).toContain("Build calculator")

        const review = required(
          yield* swarm.spawnRun(created.id, {
            role: AgentV2.ID.make("reviewer"),
            task: "Review calculator",
            directory: reviewDir.path,
          }),
        )
        yield* swarm.completeRun(review.id)

        const runs = yield* swarm.listRuns(created.id)
        expect(runs.filter((run) => run.status === "done")).toHaveLength(3)
        expect(new Set(runs.map((run) => run.directory)).size).toBe(3)

        const inbox = yield* bus.inbox(A2A.channel(String(created.id)))
        expect(inbox.length).toBeGreaterThanOrEqual(3)
        expect(A2A.channel(String(created.id))).toBe(`swarm:${String(created.id)}`)
      } finally {
        yield* Effect.promise(() => researchDir[Symbol.asyncDispose]())
        yield* Effect.promise(() => codeDir[Symbol.asyncDispose]())
        yield* Effect.promise(() => reviewDir[Symbol.asyncDispose]())
      }
    }),
  )
})
