import { describe, expect, test } from "bun:test"
import { a2aMessageFooter, a2aMessageOptions, parseAgentName } from "../../src/component/dialog-a2a-inbox"

describe("dialog a2a inbox", () => {
  test("trims agent names and rejects blanks", () => {
    expect(parseAgentName(null)).toBeUndefined()
    expect(parseAgentName("")).toBeUndefined()
    expect(parseAgentName("   ")).toBeUndefined()
    expect(parseAgentName("  atlas  ")).toBe("atlas")
  })

  test("shows sender, type, and origin in the footer", () => {
    expect(
      a2aMessageFooter({ id: "1", from: "spark", to: "atlas", type: "task", payload: null, status: "pending", origin: "legacy" }),
    ).toBe("spark · task · legacy")
    expect(
      a2aMessageFooter({ id: "2", from: "spark", to: "atlas", type: "task", payload: null, status: "pending", origin: "service" }),
    ).toBe("spark · task · service")
    expect(
      a2aMessageFooter({ id: "3", from: "coder", to: "atlas", type: "task.assign", payload: null, status: "pending", origin: "signed" }),
    ).toBe("coder · task.assign · verified")
  })

  test("maps messages to options", () => {
    const options = a2aMessageOptions([
      { id: "abc123", from: "spark", to: "atlas", type: "task", payload: null, status: "pending", origin: "legacy" },
    ])
    expect(options).toHaveLength(1)
    expect(options[0].description).toBe("spark · task · legacy")
  })
})
