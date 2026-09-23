import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { A2AMessageNotFoundError } from "../errors"

const Message = Schema.Struct({
  id: Schema.String,
  from: Schema.String,
  to: Schema.String,
  type: Schema.String,
  payload: Schema.Unknown,
  status: Schema.Literals(["pending", "delivered"]),
})

export const A2AGroup = HttpApiGroup.make("server.a2a")
  .add(
    HttpApiEndpoint.post("a2a.messages.send", "/api/a2a/messages", {
      payload: Schema.Struct({
        from: Schema.String,
        to: Schema.String,
        type: Schema.String,
        payload: Schema.Unknown,
      }),
      success: Message,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.a2a.messages.send",
        summary: "Send a message",
        description: "Send an agent-to-agent message (local transport).",
      }),
    ),
    HttpApiEndpoint.get("a2a.inbox.list", "/api/a2a/inbox/:agent", {
      params: Schema.Struct({ agent: Schema.String }),
      success: Schema.Array(Message),
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.a2a.inbox.list",
        summary: "Read inbox",
        description: "Get pending messages addressed to an agent.",
      }),
    ),
    HttpApiEndpoint.post("a2a.messages.ack", "/api/a2a/messages/:id/ack", {
      params: Schema.Struct({ id: Schema.String }),
      success: Message,
      error: A2AMessageNotFoundError,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.a2a.messages.ack",
        summary: "Acknowledge a message",
        description: "Mark a message delivered so it leaves the inbox.",
      }),
    ),
  )
  .annotateMerge(OpenApi.annotations({ title: "a2a", description: "Experimental agent-to-agent routes." }))
