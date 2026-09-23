import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { Civilization } from "@apt5/core/civilization"
import { Ledger } from "@apt5/core/ledger"
import { WorkBoard } from "@apt5/core/work-board"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { testEffect } from "./lib/effect"

const services = AppNodeBuilder.build(LayerNode.group([Civilization.node, Ledger.node, WorkBoard.node]))
const it = testEffect(services)

describe("Civilization", () => {
  it.effect("boots against migrated tables and reports health", () =>
    Effect.gen(function* () {
      const runtime = yield* Civilization.Service
      yield* runtime.boot()

      const board = yield* WorkBoard.Service
      const created = yield* board.createBoard("Runtime")
      yield* board.createTask(created.id, "Boot check")

      const ledger = yield* Ledger.Service
      yield* ledger.record({
        sessionID: "ses_runtime",
        providerID: "openrouter",
        modelID: "nex-agi/nex-n2-mini",
        inputTokens: 10,
        outputTokens: 5,
        cost: 0.0001,
      })

      const health = yield* runtime.health()
      expect(health.boards).toBeGreaterThanOrEqual(1)
      expect(health.tasks).toBeGreaterThanOrEqual(1)
      expect(health.ledgerEntries).toBeGreaterThanOrEqual(1)
      expect(health.ledgerCost).toBeGreaterThanOrEqual(0.0001)
    }),
  )
})
