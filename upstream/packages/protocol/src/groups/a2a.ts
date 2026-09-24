import { A2A } from "@apt5/schema/a2a"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { A2AAgentNotFoundError, A2AInvalidSignatureError, A2AMessageNotFoundError } from "../errors"

const Message = Schema.Struct({
  id: A2A.MessageID,
  from: Schema.String,
  to: Schema.String,
  type: Schema.String,
  payload: Schema.Unknown,
  status: A2A.MessageStatus,
  origin: A2A.MessageOrigin,
  signature: Schema.optional(Schema.String),
})

const Registration = Schema.Struct({
  id: A2A.AgentID,
  name: Schema.String,
  privateKey: Schema.String,
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
      params: Schema.Struct({ id: A2A.MessageID }),
      success: Message,
      error: A2AMessageNotFoundError,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.a2a.messages.ack",
        summary: "Acknowledge a message",
        description: "Mark a message delivered so it leaves the inbox.",
      }),
    ),
    HttpApiEndpoint.post("a2a.agents.register", "/api/a2a/agents", {
      payload: Schema.Struct({ swarmID: Schema.String, name: Schema.String }),
      success: Registration,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.a2a.agents.register",
        summary: "Register an agent",
        description: "Enroll an agent in a swarm; returns the private key once for signing.",
      }),
    ),
    HttpApiEndpoint.post("a2a.messages.sendSigned", "/api/a2a/messages/signed", {
      payload: Schema.Struct({
        agentID: A2A.AgentID,
        to: Schema.String,
        type: Schema.String,
        payload: Schema.Unknown,
        signature: Schema.String,
      }),
      success: Message,
      error: [A2AAgentNotFoundError, A2AInvalidSignatureError],
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.a2a.messages.sendSigned",
        summary: "Send a signed message",
        description: "Verify the ed25519 signature against the registered key, then deliver.",
      }),
    ),
  )
  .annotateMerge(OpenApi.annotations({ title: "a2a", description: "Experimental agent-to-agent routes." }))
