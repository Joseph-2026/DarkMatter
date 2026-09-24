import { A2A } from "@apt5/core/a2a"
import { Swarm } from "@apt5/core/swarm"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"
import { A2AAgentNotFoundError, A2AInvalidSignatureError, A2AMessageNotFoundError } from "@apt5/protocol/errors"

export const A2AHandler = HttpApiBuilder.group(Api, "server.a2a", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* A2A.Service

    return handlers
      .handle(
        "a2a.messages.send",
        Effect.fn(function* (ctx: { payload: { from: string; to: string; type: string; payload: unknown } }) {
          return yield* svc.send(ctx.payload.from, ctx.payload.to, ctx.payload.type, ctx.payload.payload)
        }),
      )
      .handle(
        "a2a.inbox.list",
        Effect.fn(function* (ctx: { params: { agent: string } }) {
          return yield* svc.inbox(ctx.params.agent)
        }),
      )
      .handle(
        "a2a.messages.ack",
        Effect.fn(function* (ctx: { params: { id: A2A.MessageID } }) {
          const message = yield* svc.ack(ctx.params.id)
          if (!message) return yield* new A2AMessageNotFoundError({ messageID: String(ctx.params.id), message: "Message not found" })
          return message
        }),
      )
      .handle(
        "a2a.agents.register",
        Effect.fn(function* (ctx: { payload: { swarmID: string; name: string } }) {
          const registration = yield* svc.registerAgent(Swarm.SwarmID.make(ctx.payload.swarmID), ctx.payload.name)
          return { id: registration.id, name: registration.name, privateKey: registration.privateKey }
        }),
      )
      .handle(
        "a2a.messages.sendSigned",
        Effect.fn(function* (ctx: {
          payload: { agentID: A2A.AgentID; to: string; type: string; payload: unknown; signature: string }
        }) {
          return yield* svc
            .sendSigned(
              ctx.payload.agentID,
              { to: ctx.payload.to, type: ctx.payload.type, payload: ctx.payload.payload },
              ctx.payload.signature,
            )
            .pipe(
              Effect.catchTags({
                "A2A.AgentNotFoundError": (error) =>
                  Effect.fail(new A2AAgentNotFoundError({ agentID: error.agentID, message: "Agent not registered" })),
                "A2A.InvalidSignatureError": (error) =>
                  Effect.fail(new A2AInvalidSignatureError({ agentID: error.agentID, message: "Signature invalid" })),
              }),
            )
        }),
      )
  }),
)
