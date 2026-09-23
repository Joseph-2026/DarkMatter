import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { Timestamps } from "../database/schema.sql"
import type { Governance } from "../governance"

export const GovernanceRuleTable = sqliteTable("governance_rule", {
  id: text().$type<Governance.RuleID>().primaryKey(),
  action_pattern: text().notNull(),
  effect: text().$type<Governance.RuleEffect>().notNull(),
  ...Timestamps,
})

export const GovernanceAuditTable = sqliteTable("governance_audit", {
  id: text().$type<Governance.AuditID>().primaryKey(),
  action: text().notNull(),
  decision: text().$type<Governance.Decision>().notNull(),
  rule_id: text().$type<Governance.RuleID>(),
  ...Timestamps,
})
