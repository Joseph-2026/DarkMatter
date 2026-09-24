import { NodeHttpServer, NodeServices } from "@effect/platform-node"
import { describe, expect } from "bun:test"
import { Config, Effect, Layer } from "effect"
import { HttpClient, HttpClientRequest, HttpRouter, HttpServer } from "effect/unstable/http"
import * as Socket from "effect/unstable/socket/Socket"
import { A2A } from "@apt5/core/a2a"
import { HttpApiApp } from "../../src/server/routes/instance/httpapi/server"
import { resetDatabase } from "../fixture/db"
import { tmpdirScoped } from "../fixture/fixture"
import { testEffect } from "../lib/effect"

// WORLD SHOWCASE — the demo Big Tech watches. Five acts over real HTTP backed
// by real SQLite, with real ed25519 signatures. It runs green in CI forever,
// so the show can never rot. Run it: bun test test/server/swarm-showcase.test.ts
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

const narrate = (act: string, line: string) => console.log(`\n[ACT ${act}] ${line}`)

describe("world showcase", () => {
  it.live("a swarm collaborates live: board, memory, signed agents, policy, costs", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const post = (path: string, body: unknown) =>
        HttpClientRequest.post(path).pipe(
          directoryHeader(dir),
          HttpClientRequest.bodyJson(body),
          Effect.flatMap(HttpClient.execute),
        )
      const get = (path: string) => HttpClientRequest.get(path).pipe(directoryHeader(dir), HttpClient.execute)
      const body = <T>(response: { json: Effect.Effect<unknown> }) =>
        response.json.pipe(Effect.map((value) => value as T))

      narrate("1", "A swarm is born with its own board.")
      const swarm = yield* post("/swarm", { name: "WorldDemo" })
      expect(swarm.status).toBe(200)
      const swarmBody = yield* body<{ id: string }>(swarm)

      narrate("2", "The researcher leaves discoveries in shared memory.")
      const memory = yield* HttpClientRequest.put(`/memory/swarm:${swarmBody.id}/stack`).pipe(
        directoryHeader(dir),
        HttpClientRequest.bodyJson({ value: { runtime: "bun", tests: "green" } }),
        Effect.flatMap(HttpClient.execute),
      )
      expect(memory.status).toBe(200)

      narrate("3", "Two agents enroll with cryptographic identities — no forgeries possible.")
      const coder = yield* post("/a2a/agents", { swarmID: swarmBody.id, name: "coder" })
      expect(coder.status).toBe(200)
      const coderReg = yield* body<{ id: string; privateKey: string }>(coder)
      const reviewer = yield* post("/a2a/agents", { swarmID: swarmBody.id, name: "reviewer" })
      expect(reviewer.status).toBe(200)
      const reviewerReg = yield* body<{ id: string; privateKey: string }>(reviewer)
      expect(coderReg.privateKey).toContain("PRIVATE KEY")

      narrate("4", "The coder announces signed work; the signature verifies on delivery.")
      const payload = { title: "Calculator built", tests: "green" }
      const signature = A2A.signPayload(coderReg.privateKey, "coder", "reviewer", "task.done", payload)
      const sent = yield* post("/a2a/signed", {
        agentID: coderReg.id,
        to: "reviewer",
        type: "task.done",
        payload,
        signature,
      })
      expect(sent.status).toBe(200)
      expect(yield* sent.json).toMatchObject({ origin: "signed", from: "coder" })

      narrate("5", "A forged message is rejected at the gate (401) — trust is enforced, not promised.")
      const forged = yield* post("/a2a/signed", {
        agentID: coderReg.id,
        to: "reviewer",
        type: "task.done",
        payload,
        signature: "Zm9yZ2Vk",
      })
      expect(forged.status).toBe(401)

      narrate("5b", "The reviewer replies signed — two-way verified collaboration.")
      const replyPayload = { verdict: "approved" }
      const replySig = A2A.signPayload(reviewerReg.privateKey, "reviewer", "coder", "review.done", replyPayload)
      const reply = yield* post("/a2a/signed", {
        agentID: reviewerReg.id,
        to: "coder",
        type: "review.done",
        payload: replyPayload,
        signature: replySig,
      })
      expect(reply.status).toBe(200)
      expect(yield* reply.json).toMatchObject({ origin: "signed", from: "reviewer" })

      narrate("6", "Governance decides with an audit trail; the ledger prices everything.")
      const rule = yield* post("/governance/rules", { pattern: "deploy.*", effect: "approve" })
      expect(rule.status).toBe(200)
      const decision = yield* post("/governance/evaluate", { action: "deploy.prod" })
      expect(decision.status).toBe(200)
      expect(yield* decision.json).toMatchObject({ decision: "approve" })

      const usage = yield* post("/ledger", {
        sessionID: "ses_showcase",
        providerID: "openrouter",
        modelID: "nex-agi/nex-n2.5-mini:free",
        inputTokens: 1200,
        outputTokens: 300,
        cost: 0.0,
      })
      expect(usage.status).toBe(200)
      const summary = yield* get("/ledger/summary")
      expect(summary.status).toBe(200)
      const totals = yield* body<{ entries: number; inputTokens: number; cost: number }>(summary)
      expect(totals.entries).toBeGreaterThanOrEqual(1)
      expect(totals.inputTokens).toBeGreaterThanOrEqual(1200)

      narrate("7", "Boards, memory, verified messages, policy, costs — one system, live. Curtain.")
    }),
  )
})
