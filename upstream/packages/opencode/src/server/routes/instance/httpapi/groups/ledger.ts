import { Ledger } from "@apt5/core/ledger"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { Authorization } from "../middleware/authorization"
import { InstanceContextMiddleware } from "../middleware/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "../middleware/workspace-routing"
import { described } from "./metadata"

const root = "/ledger"

const Entry = Schema.Struct({
  id: Ledger.EntryID,
  sessionID: Schema.String,
  providerID: Schema.String,
  modelID: Schema.String,
  inputTokens: Schema.Number,
  outputTokens: Schema.Number,
  cost: Schema.Number,
})

const Summary = Schema.Struct({
  entries: Schema.Number,
  inputTokens: Schema.Number,
  outputTokens: Schema.Number,
  cost: Schema.Number,
})

export const LedgerApi = HttpApi.make("ledger")
  .add(
    HttpApiGroup.make("ledger")
      .add(
        HttpApiEndpoint.post("record", root, {
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({
            sessionID: Schema.String,
            providerID: Schema.String,
            modelID: Schema.String,
            inputTokens: Schema.Number,
            outputTokens: Schema.Number,
            cost: Schema.Number,
          }),
          success: described(Entry, "Recorded entry"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "ledger.record",
            summary: "Record usage",
            description: "Append one usage record to the ledger (append-only).",
          }),
        ),
        HttpApiEndpoint.get("list", root, {
          query: WorkspaceRoutingQuery,
          success: described(Schema.Array(Entry), "List of entries"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "ledger.list",
            summary: "List ledger entries",
            description: "Get ledger entries in creation order.",
          }),
        ),
        HttpApiEndpoint.get("summary", `${root}/summary`, {
          query: WorkspaceRoutingQuery,
          success: described(Summary, "Usage totals"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "ledger.summary",
            summary: "Summarize usage",
            description: "Get total entries, tokens, and cost.",
          }),
        ),
      )
      .annotateMerge(
        OpenApi.annotations({
          title: "ledger",
          description: "Ledger routes.",
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
