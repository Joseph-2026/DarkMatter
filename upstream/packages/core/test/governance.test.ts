import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { Governance } from "@apt5/core/governance"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { GovernanceAuditTable } from "@apt5/core/governance/sql"
import { Database } from "@apt5/core/database/database"
import { testEffect } from "./lib/effect"

const services = AppNodeBuilder.build(LayerNode.group([Database.node, Governance.node]))
const it = testEffect(services)

describe("Governance", () => {
  it.effect("denies a matched action, allows the rest, and audits both", () =>
    Effect.gen(function* () {
      const policy = yield* Governance.Service
      const database = yield* Database.Service
      const rule = yield* policy.addRule("shell.rm*", "deny")
      expect(rule.effect).toBe("deny")

      const denied = yield* policy.evaluate("shell.rm -rf /tmp/x")
      expect(denied.decision).toBe("deny")
      expect(denied.ruleID).toBe(rule.id)

      const allowed = yield* policy.evaluate("file.read")
      expect(allowed.decision).toBe("allow")
      expect(allowed.ruleID).toBeUndefined()

      const audits = yield* database.db.select().from(GovernanceAuditTable).all().pipe(Effect.orDie)
      const actions = audits.map((row) => row.action)
      expect(actions).toContain("shell.rm -rf /tmp/x")
      expect(actions).toContain("file.read")
    }),
  )
})
