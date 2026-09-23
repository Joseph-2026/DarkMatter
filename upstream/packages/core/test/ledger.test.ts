import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { Ledger } from "@apt5/core/ledger"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { testEffect } from "./lib/effect"

const services = AppNodeBuilder.build(LayerNode.group([Ledger.node]))
const it = testEffect(services)

describe("Ledger", () => {
  it.effect("records usage and summarizes totals", () =>
    Effect.gen(function* () {
      const ledger = yield* Ledger.Service
      yield* ledger.record({
        sessionID: "ses_test",
        providerID: "openrouter",
        modelID: "nex-agi/nex-n2-mini",
        inputTokens: 100,
        outputTokens: 25,
        cost: 0.001,
      })
      yield* ledger.record({
        sessionID: "ses_test",
        providerID: "openrouter",
        modelID: "liquid/lfm-2.5",
        inputTokens: 50,
        outputTokens: 10,
        cost: 0.0005,
      })

      const scoped = yield* ledger.list("ses_test")
      expect(scoped.length).toBe(2)

      const summary = yield* ledger.summary()
      expect(summary.entries).toBeGreaterThanOrEqual(2)
      expect(summary.inputTokens).toBeGreaterThanOrEqual(150)
      expect(summary.outputTokens).toBeGreaterThanOrEqual(35)
      expect(summary.cost).toBeGreaterThanOrEqual(0.0015)
    }),
  )
})
