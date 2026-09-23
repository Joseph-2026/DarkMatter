import { Governance } from "@apt5/core/governance"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"

export const GovernanceHandler = HttpApiBuilder.group(Api, "server.governance", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* Governance.Service

    return handlers
      .handle(
        "governance.rules.add",
        Effect.fn(function* (ctx: { payload: { pattern: string; effect: Governance.RuleEffect } }) {
          return yield* svc.addRule(ctx.payload.pattern, ctx.payload.effect)
        }),
      )
      .handle(
        "governance.rules.list",
        Effect.fn(function* () {
          return yield* svc.listRules()
        }),
      )
      .handle(
        "governance.evaluate",
        Effect.fn(function* (ctx: { payload: { action: string } }) {
          return yield* svc.evaluate(ctx.payload.action)
        }),
      )
  }),
)
