import { Governance } from "@apt5/core/governance"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { Authorization } from "../middleware/authorization"
import { InstanceContextMiddleware } from "../middleware/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "../middleware/workspace-routing"
import { described } from "./metadata"

const root = "/governance"

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

export const GovernanceApi = HttpApi.make("governance")
  .add(
    HttpApiGroup.make("governance")
      .add(
        HttpApiEndpoint.post("addRule", `${root}/rules`, {
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({ pattern: Schema.String, effect: Governance.RuleEffect }),
          success: described(Rule, "Added rule"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "governance.addRule",
            summary: "Add a policy rule",
            description: "Add an allow, deny, or approve rule for action patterns.",
          }),
        ),
        HttpApiEndpoint.get("listRules", `${root}/rules`, {
          query: WorkspaceRoutingQuery,
          success: described(Schema.Array(Rule), "List of rules"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "governance.listRules",
            summary: "List policy rules",
            description: "Get all policy rules in creation order.",
          }),
        ),
        HttpApiEndpoint.post("evaluate", `${root}/evaluate`, {
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({ action: Schema.String }),
          success: described(Evaluation, "Policy decision"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "governance.evaluate",
            summary: "Evaluate an action",
            description: "Decide an action against the rules and audit the decision.",
          }),
        ),
      )
      .annotateMerge(
        OpenApi.annotations({
          title: "governance",
          description: "Governance routes.",
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
