import { Governance } from "@apt5/schema/governance"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"

const Rule = Schema.Struct({
  id: Governance.RuleID,
  pattern: Schema.String,
  effect: Governance.RuleEffect,
})

const Evaluation = Schema.Struct({
  action: Schema.String,
  decision: Governance.Decision,
  ruleID: Schema.optional(Governance.RuleID),
})

export const GovernanceGroup = HttpApiGroup.make("server.governance")
  .add(
    HttpApiEndpoint.post("governance.rules.add", "/api/governance/rules", {
      payload: Schema.Struct({ pattern: Schema.String, effect: Schema.Literals(["allow", "deny", "approve"]) }),
      success: Rule,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.governance.rules.add",
        summary: "Add a policy rule",
        description: "Add an allow, deny, or approve rule for action patterns.",
      }),
    ),
    HttpApiEndpoint.get("governance.rules.list", "/api/governance/rules", {
      success: Schema.Array(Rule),
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.governance.rules.list",
        summary: "List policy rules",
        description: "Get all policy rules in creation order.",
      }),
    ),
    HttpApiEndpoint.post("governance.evaluate", "/api/governance/evaluate", {
      payload: Schema.Struct({ action: Schema.String }),
      success: Evaluation,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.governance.evaluate",
        summary: "Evaluate an action",
        description: "Decide an action against the rules and audit the decision.",
      }),
    ),
  )
  .annotateMerge(OpenApi.annotations({ title: "governance", description: "Experimental governance routes." }))
