import { A2A } from "@apt5/core/a2a"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"
import { A2AMessageNotFoundError } from "../errors"

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

    return handlers.handle("send", send).handle("inbox", inbox).handle("ack", ack)
  }),
)
