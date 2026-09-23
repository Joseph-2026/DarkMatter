import { Ledger } from "@apt5/core/ledger"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"

export const LedgerHandler = HttpApiBuilder.group(Api, "server.ledger", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* Ledger.Service

    return handlers
      .handle(
        "ledger.entries.record",
        Effect.fn(function* (ctx: {
          payload: {
            sessionID: string
            providerID: string
            modelID: string
            inputTokens: number
            outputTokens: number
            cost: number
          }
        }) {
          return yield* svc.record(ctx.payload)
        }),
      )
      .handle(
        "ledger.entries.list",
        Effect.fn(function* () {
          return yield* svc.list()
        }),
      )
      .handle(
        "ledger.summary.get",
        Effect.fn(function* () {
          return yield* svc.summary()
        }),
      )
  }),
)
