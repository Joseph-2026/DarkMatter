import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { A2A } from "@apt5/core/a2a"
import { Swarm } from "@apt5/core/swarm"
import { WorkBoard } from "@apt5/core/work-board"
import { MemoryOS } from "@apt5/core/memory-os"
import { Catalog } from "@apt5/core/catalog"
import { Credential } from "@apt5/core/credential"
import { Integration } from "@apt5/core/integration"
import { Policy } from "@apt5/core/policy"
import { EventV2 } from "@apt5/core/event"
import { Location } from "@apt5/core/location"
import { AbsolutePath } from "@apt5/core/schema"
import { ProjectV2 } from "@apt5/core/project"
import { SessionV2 } from "@apt5/core/session"
import { SessionExecution } from "@apt5/core/session/execution"
import { SessionProjector } from "@apt5/core/session/projector"
import { SessionStore } from "@apt5/core/session/store"
import { Database } from "@apt5/core/database/database"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { Layer } from "effect"
import { testEffect } from "./lib/effect"
import { location } from "./fixture/location"

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

describe("A2A", () => {
  it.effect("sends, receives, and acks a message", () =>
    Effect.gen(function* () {
      const bus = yield* A2A.Service
      const sent = yield* bus.send("planner", "coder", "task.assign", { title: "Write tests" })
      expect(sent.status).toBe("pending")
      expect(sent.origin).toBe("legacy")

      const inbox = yield* bus.inbox("coder")
      expect(inbox.some((message) => message.id === sent.id)).toBe(true)

      const acked = yield* bus.ack(sent.id)
      expect(acked?.status).toBe("delivered")

      const drained = yield* bus.inbox("coder")
      expect(drained.some((message) => message.id === sent.id)).toBe(false)
    }),
  )

  it.effect("registers agents and verifies signed messages, rejecting forgeries", () =>
    Effect.gen(function* () {
      const bus = yield* A2A.Service
      const swarm = yield* Swarm.Service
      const created = yield* swarm.createSwarm("Auth")

      const registration = yield* bus.registerAgent(created.id, "coder")
      expect(registration.name).toBe("coder")
      expect(registration.privateKey).toContain("PRIVATE KEY")

      const payload = { title: "Build it" }
      const signature = A2A.signPayload(registration.privateKey, "coder", "reviewer", "task.assign", payload)
      const sent = yield* bus.sendSigned(registration.id, { to: "reviewer", type: "task.assign", payload }, signature)
      expect(sent.origin).toBe("signed")
      expect(sent.from).toBe("coder")

      const inbox = yield* bus.inbox("reviewer")
      const found = inbox.find((message) => message.id === sent.id)
      expect(found?.origin).toBe("signed")
      expect(found?.signature).toBe(signature)

      const forged = yield* bus
        .sendSigned(registration.id, { to: "reviewer", type: "task.assign", payload }, "bm90LXJlYWwtc2ln")
        .pipe(Effect.flip)
      expect(forged._tag).toBe("A2A.InvalidSignatureError")

      const canonical1 = A2A.canonical({ b: 1, a: { y: [3, 2], x: 1 } })
      const canonical2 = A2A.canonical({ a: { x: 1, y: [3, 2] }, b: 1 })
      expect(canonical1).toBe(canonical2)
    }),
  )
})
