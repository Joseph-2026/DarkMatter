import { Ledger } from "@apt5/schema/ledger"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"

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

export const LedgerGroup = HttpApiGroup.make("server.ledger")
  .add(
    HttpApiEndpoint.post("ledger.entries.record", "/api/ledger/entries", {
      payload: Schema.Struct({
        sessionID: Schema.String,
        providerID: Schema.String,
        modelID: Schema.String,
        inputTokens: Schema.Number,
        outputTokens: Schema.Number,
        cost: Schema.Number,
      }),
      success: Entry,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.ledger.entries.record",
        summary: "Record usage",
        description: "Append one usage record to the ledger (append-only).",
      }),
    ),
    HttpApiEndpoint.get("ledger.entries.list", "/api/ledger/entries", {
      success: Schema.Array(Entry),
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.ledger.entries.list",
        summary: "List ledger entries",
        description: "Get ledger entries in creation order.",
      }),
    ),
    HttpApiEndpoint.get("ledger.summary.get", "/api/ledger/summary", {
      success: Summary,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.ledger.summary.get",
        summary: "Summarize usage",
        description: "Get total entries, tokens, and cost.",
      }),
    ),
  )
  .annotateMerge(OpenApi.annotations({ title: "ledgers", description: "Experimental ledger routes." }))
