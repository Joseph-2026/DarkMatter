import { A2A } from "@apt5/core/a2a"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { A2AMessageNotFoundError } from "../errors"
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
      title: "opencode HttpApi",
      version: "0.0.1",
      description: "Effect HttpApi surface for instance routes.",
    }),
  )
