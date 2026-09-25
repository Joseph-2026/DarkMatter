import { A2A } from "@apt5/core/a2a"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { A2AAgentNotFoundError, A2AInvalidSignatureError, A2AMessageNotFoundError } from "../errors"
import { Authorization } from "../middleware/authorization"
import { InstanceContextMiddleware } from "../middleware/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "../middleware/workspace-routing"
import { described } from "./metadata"

const root = "/a2a"

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

export const A2AApi = HttpApi.make("a2a")
  .add(
    HttpApiGroup.make("a2a")
      .add(
        HttpApiEndpoint.post("send", root, {
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({
            from: Schema.String,
            to: Schema.String,
            type: Schema.String,
            payload: Schema.Unknown,
          }),
          success: described(Message, "Sent message"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "a2a.send",
            summary: "Send a message",
            description: "Send an agent-to-agent message (local transport).",
          }),
        ),
        HttpApiEndpoint.get("inbox", `${root}/inbox/:agent`, {
          params: { agent: Schema.String },
          query: WorkspaceRoutingQuery,
          success: described(Schema.Array(Message), "Pending messages"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "a2a.inbox",
            summary: "Read inbox",
            description: "Get pending messages addressed to an agent.",
          }),
        ),
        HttpApiEndpoint.post("ack", `${root}/:id/ack`, {
          params: { id: A2A.MessageID },
          query: WorkspaceRoutingQuery,
          success: described(Message, "Acknowledged message"),
          error: [HttpApiError.BadRequest, A2AMessageNotFoundError],
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "a2a.ack",
            summary: "Acknowledge a message",
            description: "Mark a message delivered so it leaves the inbox.",
          }),
        ),
        HttpApiEndpoint.post("registerAgent", `${root}/agents`, {
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({ swarmID: Schema.String, name: Schema.String }),
          success: described(Registration, "Registered agent with one-time private key"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "a2a.registerAgent",
            summary: "Register an agent",
            description: "Enroll an agent in a swarm; returns the private key once for signing.",
          }),
        ),
        HttpApiEndpoint.post("sendSigned", `${root}/signed`, {
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({
            agentID: A2A.AgentID,
            to: Schema.String,
            type: Schema.String,
            payload: Schema.Unknown,
            signature: Schema.String,
          }),
          success: described(Message, "Verified message"),
          error: [HttpApiError.BadRequest, A2AAgentNotFoundError, A2AInvalidSignatureError],
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "a2a.sendSigned",
            summary: "Send a signed message",
            description: "Verify the ed25519 signature against the registered key, then deliver.",
          }),
        ),
      )
      .annotateMerge(
        OpenApi.annotations({
          title: "a2a",
          description: "Agent-to-agent routes.",
        }),
      )
      .middleware(InstanceContextMiddleware)
      .middleware(WorkspaceRoutingMiddleware)
      .middleware(Authorization),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "apt5 HttpApi",
      version: "0.0.1",
      description: "Effect HttpApi surface for instance routes.",
    }),
  )
