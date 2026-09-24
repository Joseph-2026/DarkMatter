import { describe, expect, test } from "bun:test"
import {
  governanceRuleOptions,
  parseGovernanceAction,
} from "../../src/component/dialog-governance"

describe("dialog governance", () => {
  test("trims actions and rejects blanks", () => {
    expect(parseGovernanceAction(null)).toBeUndefined()
    expect(parseGovernanceAction("")).toBeUndefined()
    expect(parseGovernanceAction("   ")).toBeUndefined()
    expect(parseGovernanceAction("  deploy  ")).toBe("deploy")
  })

  test("sorts rules by pattern", () => {
    const options = governanceRuleOptions([
      { id: "2", pattern: "write:*", effect: "deny" },
      { id: "1", pattern: "read:*", effect: "allow" },
    ])
    expect(options.map((option) => option.title)).toEqual(["read:*", "write:*"])
    expect(options[0].description).toBe("allow")
  })
})
