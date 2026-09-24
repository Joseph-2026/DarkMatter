import { A2A } from "@apt5/core/a2a"
import { Swarm } from "@apt5/core/swarm"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"
import { A2AAgentNotFoundError, A2AInvalidSignatureError, A2AMessageNotFoundError } from "../errors"

export const a2aHandlers = HttpApiBuilder.group(InstanceHttpApi, "a2a", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* A2A.Service

    const send = Effect.fn("A2AHttpApi.send")(function* (ctx: {
      payload: { from: string; to: string; type: string; payload: unknown }
    }) {
      return yield* svc.send(ctx.payload.from, ctx.payload.to, ctx.payload.type, ctx.payload.payload)
    })

    const inbox = Effect.fn("A2AHttpApi.inbox")(function* (ctx: { params: { agent: string } }) {
      return yield* svc.inbox(ctx.params.agent)
    })

    const ack = Effect.fn("A2AHttpApi.ack")(function* (ctx: { params: { id: A2A.MessageID } }) {
      const message = yield* svc.ack(ctx.params.id)
      if (!message)
        return yield* Effect.fail(
          new A2AMessageNotFoundError({ messageID: String(ctx.params.id), message: "Message not found" }),
        )
      return message
    })

    const registerAgent = Effect.fn("A2AHttpApi.registerAgent")(function* (ctx: {
      payload: { swarmID: string; name: string }
    }) {
      const registration = yield* svc.registerAgent(Swarm.SwarmID.make(ctx.payload.swarmID), ctx.payload.name)
      return { id: registration.id, name: registration.name, privateKey: registration.privateKey }
    })

    const sendSigned = Effect.fn("A2AHttpApi.sendSigned")(function* (ctx: {
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
    })

    return handlers
      .handle("send", send)
      .handle("inbox", inbox)
      .handle("ack", ack)
      .handle("registerAgent", registerAgent)
      .handle("sendSigned", sendSigned)
  }),
)
