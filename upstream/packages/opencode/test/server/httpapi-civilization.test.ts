import { NodeHttpServer, NodeServices } from "@effect/platform-node"
import { describe, expect } from "bun:test"
import { Config, Effect, Layer } from "effect"
import { HttpClient, HttpClientRequest, HttpRouter, HttpServer } from "effect/unstable/http"
import * as Socket from "effect/unstable/socket/Socket"
import { HttpApiApp } from "../../src/server/routes/instance/httpapi/server"
import { resetDatabase } from "../fixture/db"
import { tmpdirScoped } from "../fixture/fixture"
import { testEffect } from "../lib/effect"

// End-to-end proof that the civilization runtime serves over real HTTP backed
// by real SQLite: boards, memory, ledger, a2a, governance in one flow.
const testStateLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* Effect.promise(() => resetDatabase())
    yield* Effect.addFinalizer(() => Effect.promise(() => resetDatabase()))
  }),
)

const servedRoutes: Layer.Layer<never, Config.ConfigError, HttpServer.HttpServer> = HttpRouter.serve(
  HttpApiApp.routes,
  { disableListenLog: true, disableLogger: true },
)

const httpApiServerLayer = servedRoutes.pipe(
  Layer.provide(Socket.layerWebSocketConstructorGlobal),
  Layer.provideMerge(NodeHttpServer.layerTest),
  Layer.provideMerge(NodeServices.layer),
)

const it = testEffect(Layer.mergeAll(testStateLayer, httpApiServerLayer))

const directoryHeader = (dir: string) => HttpClientRequest.setHeader("x-opencode-directory", dir)

describe("civilization runtime", () => {
  it.live("serves boards, memory, ledger, a2a, and governance over HTTP", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const post = (path: string, body: unknown) =>
        HttpClientRequest.post(path).pipe(
          directoryHeader(dir),
          HttpClientRequest.bodyJson(body),
          Effect.flatMap(HttpClient.execute),
        )
      const get = (path: string) =>
        HttpClientRequest.get(path).pipe(directoryHeader(dir), HttpClient.execute)

      const board = yield* post("/work-board", { name: "Runtime" })
      expect(board.status).toBe(200)
      const boardBody = yield* board.json.pipe(Effect.map((value) => value as { id: string }))
      expect(typeof boardBody.id).toBe("string")

      const task = yield* post(`/work-board/${boardBody.id}/tasks`, { title: "Boot check" })
      expect(task.status).toBe(200)
      const taskBody = yield* task.json.pipe(Effect.map((value) => value as { id: string; status: string }))
      expect(taskBody.status).toBe("open")

      const moved = yield* post(`/work-board/tasks/${taskBody.id}/move`, { status: "done" })
      expect(moved.status).toBe(200)
      expect(yield* moved.json).toMatchObject({ status: "done" })

      const put = yield* HttpClientRequest.put("/memory/demo/key").pipe(
        directoryHeader(dir),
        HttpClientRequest.bodyJson({ value: { runtime: "bun" } }),
        Effect.flatMap(HttpClient.execute),
      )
      expect(put.status).toBe(200)

      const entry = yield* get("/memory/demo/key")
      expect(entry.status).toBe(200)
      expect(yield* entry.json).toMatchObject({ namespace: "demo", key: "key" })

      const missing = yield* get("/memory/demo/nope")
      expect(missing.status).toBe(404)

      const recorded = yield* post("/ledger", {
        sessionID: "ses_e2e",
        providerID: "openrouter",
        modelID: "nex-agi/nex-n2-mini",
        inputTokens: 100,
        outputTokens: 25,
        cost: 0.001,
      })
      expect(recorded.status).toBe(200)

      const summary = yield* get("/ledger/summary")
      expect(summary.status).toBe(200)
      const summaryBody = yield* summary.json.pipe(Effect.map((value) => value as { entries: number }))
      expect(summaryBody.entries).toBeGreaterThanOrEqual(1)

      const sent = yield* post("/a2a", { from: "e2e", to: "agent", type: "task.assign", payload: { title: "Hi" } })
      expect(sent.status).toBe(200)
      const sentBody = yield* sent.json.pipe(Effect.map((value) => value as { id: string; status: string }))
      expect(sentBody.status).toBe("pending")

      const inbox = yield* get("/a2a/inbox/agent")
      expect(inbox.status).toBe(200)

      const acked = yield* post(`/a2a/${sentBody.id}/ack`, {})
      expect(acked.status).toBe(200)
      expect(yield* acked.json).toMatchObject({ status: "delivered" })

      const rule = yield* post("/governance/rules", { pattern: "e2e.*", effect: "deny" })
      expect(rule.status).toBe(200)

      const denied = yield* post("/governance/evaluate", { action: "e2e.rm" })
      expect(denied.status).toBe(200)
      expect(yield* denied.json).toMatchObject({ decision: "deny" })

      const allowed = yield* post("/governance/evaluate", { action: "other.read" })
      expect(allowed.status).toBe(200)
      expect(yield* allowed.json).toMatchObject({ decision: "allow" })
    }),
  )
})
