import { Ledger } from "@apt5/core/ledger"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"

export const ledgerHandlers = HttpApiBuilder.group(InstanceHttpApi, "ledger", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* Ledger.Service

    const record = Effect.fn("LedgerHttpApi.record")(function* (ctx: {
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
    })

    const list = Effect.fn("LedgerHttpApi.list")(function* () {
      return yield* svc.list()
    })

    const summary = Effect.fn("LedgerHttpApi.summary")(function* () {
      return yield* svc.summary()
    })

    return handlers.handle("record", record).handle("list", list).handle("summary", summary)
  }),
)
