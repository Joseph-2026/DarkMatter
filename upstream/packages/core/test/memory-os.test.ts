import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { MemoryOS } from "@apt5/core/memory-os"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { testEffect } from "./lib/effect"

const services = AppNodeBuilder.build(LayerNode.group([MemoryOS.node]))
const it = testEffect(services)

describe("MemoryOS", () => {
  it.effect("puts, overwrites, lists, and forgets entries", () =>
    Effect.gen(function* () {
      const memory = yield* MemoryOS.Service
      yield* memory.put("project", "stack", { runtime: "bun" })
      yield* memory.put("project", "owner", "apt-5")

      const stacked = yield* memory.get("project", "stack")
      expect(stacked?.value).toEqual({ runtime: "bun" })

      yield* memory.put("project", "stack", { runtime: "node" })
      const updated = yield* memory.get("project", "stack")
      expect(updated?.value).toEqual({ runtime: "node" })

      const entries = yield* memory.list("project")
      expect(entries.length).toBe(2)

      const forgotten = yield* memory.forget("project", "owner")
      expect(forgotten).toBe(true)
      const missing = yield* memory.get("project", "owner")
      expect(missing).toBeUndefined()
    }),
  )
})
