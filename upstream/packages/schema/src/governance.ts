export * as Governance from "./governance"

import { Schema } from "effect"
import { ascending } from "./identifier"
import { statics } from "./schema"

export const RuleID = Schema.String.pipe(
  Schema.brand("Governance.RuleID"),
  statics((schema) => ({ create: () => schema.make("gov_" + ascending()) })),
)
export type RuleID = typeof RuleID.Type

export const AuditID = Schema.String.pipe(
  Schema.brand("Governance.AuditID"),
  statics((schema) => ({ create: () => schema.make("aud_" + ascending()) })),
)
export type AuditID = typeof AuditID.Type

export const RuleEffect = Schema.Literals(["allow", "deny", "approve"])
export type RuleEffect = typeof RuleEffect.Type

export const Decision = Schema.Literals(["allow", "deny", "approve"])
export type Decision = typeof Decision.Type
