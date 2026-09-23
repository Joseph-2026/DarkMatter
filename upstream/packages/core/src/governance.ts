export * as Governance from "./governance"

import { asc, eq } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"
import { Governance } from "@apt5/schema/governance"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import { GovernanceAuditTable, GovernanceRuleTable } from "./governance/sql"

export const RuleID = Governance.RuleID
export type RuleID = Governance.RuleID

export const AuditID = Governance.AuditID
export type AuditID = Governance.AuditID

export const RuleEffect = Governance.RuleEffect
export type RuleEffect = Governance.RuleEffect

export const Decision = Governance.Decision
export type Decision = Governance.Decision

export interface Rule {
  readonly id: RuleID
  readonly pattern: string
  readonly effect: RuleEffect
}

export interface Evaluation {
  readonly action: string
  readonly decision: Decision
  readonly ruleID: RuleID | undefined
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Governance") {}

export interface Interface {
  readonly addRule: (pattern: string, effect: RuleEffect) => Effect.Effect<Rule>
  readonly listRules: () => Effect.Effect<Rule[]>
  readonly evaluate: (action: string) => Effect.Effect<Evaluation>
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const database = yield* Database.Service
    const matches = (pattern: string, action: string) =>
      pattern.endsWith("*") ? action.startsWith(pattern.slice(0, -1)) : action === pattern
    return Service.of({
      addRule: Effect.fn("Governance.addRule")(function* (pattern: string, effect: RuleEffect) {
        const id = RuleID.create()
        yield* database.db
          .insert(GovernanceRuleTable)
          .values({ id, action_pattern: pattern, effect })
          .pipe(Effect.orDie)
        return { id, pattern, effect }
      }),
      listRules: Effect.fn("Governance.listRules")(function* () {
        const rows = yield* database.db
          .select()
          .from(GovernanceRuleTable)
          .orderBy(asc(GovernanceRuleTable.time_created))
          .all()
          .pipe(Effect.orDie)
        return rows.map((row) => ({ id: row.id, pattern: row.action_pattern, effect: row.effect }))
      }),
      evaluate: Effect.fn("Governance.evaluate")(function* (action: string) {
        const rows = yield* database.db
          .select()
          .from(GovernanceRuleTable)
          .orderBy(asc(GovernanceRuleTable.time_created))
          .all()
          .pipe(Effect.orDie)
        const hit = rows.find((row) => matches(row.action_pattern, action))
        const evaluation: Evaluation = hit
          ? { action, decision: hit.effect, ruleID: hit.id }
          : { action, decision: "allow", ruleID: undefined }
        yield* database.db
          .insert(GovernanceAuditTable)
          .values({ id: AuditID.create(), action, decision: evaluation.decision, rule_id: evaluation.ruleID })
          .pipe(Effect.orDie)
        return evaluation
      }),
    })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node] })
