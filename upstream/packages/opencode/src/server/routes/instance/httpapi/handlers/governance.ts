import { Governance } from "@apt5/core/governance"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"

export const governanceHandlers = HttpApiBuilder.group(InstanceHttpApi, "governance", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* Governance.Service

    const addRule = Effect.fn("GovernanceHttpApi.addRule")(function* (ctx: {
      payload: { pattern: string; effect: Governance.RuleEffect }
    }) {
      return yield* svc.addRule(ctx.payload.pattern, ctx.payload.effect)
    })

    const listRules = Effect.fn("GovernanceHttpApi.listRules")(function* () {
      return yield* svc.listRules()
    })

    const evaluate = Effect.fn("GovernanceHttpApi.evaluate")(function* (ctx: {
      payload: { action: string }
    }) {
      return yield* svc.evaluate(ctx.payload.action)
    })

    return handlers.handle("addRule", addRule).handle("listRules", listRules).handle("evaluate", evaluate)
  }),
)
