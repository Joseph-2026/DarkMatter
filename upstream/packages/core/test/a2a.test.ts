import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { A2A } from "@apt5/core/a2a"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { testEffect } from "./lib/effect"

const services = AppNodeBuilder.build(LayerNode.group([A2A.node]))
const it = testEffect(services)

describe("A2A", () => {
  it.effect("sends, receives, and acks a message", () =>
    Effect.gen(function* () {
      const bus = yield* A2A.Service
      const sent = yield* bus.send("planner", "coder", "task.assign", { title: "Write tests" })
      expect(sent.status).toBe("pending")

      const inbox = yield* bus.inbox("coder")
      expect(inbox.some((message) => message.id === sent.id)).toBe(true)

      const acked = yield* bus.ack(sent.id)
      expect(acked?.status).toBe("delivered")

      const drained = yield* bus.inbox("coder")
      expect(drained.some((message) => message.id === sent.id)).toBe(false)
    }),
  )
})
