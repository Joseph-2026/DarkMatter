import { describe, expect, test } from "bun:test"
import { ProviderV2 } from "@apt5/core/provider"

// Wire identifiers travel in user configs, stored sessions, and API payloads.
// Typecheck cannot catch value renames inside `schema.make(...)`, so this guard
// pins every static to its intended value. APT-5 owns its provider namespace:
// the `opencode` KEY is a code identifier; its VALUE is "darkmatter".
// (String() unwraps the brand for comparison against plain wire values.)
describe("ProviderV2 IDs", () => {
  test("statics keep upstream wire values", () => {
    expect(String(ProviderV2.ID.opencode)).toBe("darkmatter")
    expect(String(ProviderV2.ID.anthropic)).toBe("anthropic")
    expect(String(ProviderV2.ID.openai)).toBe("openai")
    expect(String(ProviderV2.ID.google)).toBe("google")
    expect(String(ProviderV2.ID.googleVertex)).toBe("google-vertex")
    expect(String(ProviderV2.ID.githubCopilot)).toBe("github-copilot")
    expect(String(ProviderV2.ID.amazonBedrock)).toBe("amazon-bedrock")
    expect(String(ProviderV2.ID.azure)).toBe("azure")
    expect(String(ProviderV2.ID.openrouter)).toBe("openrouter")
    expect(String(ProviderV2.ID.mistral)).toBe("mistral")
    expect(String(ProviderV2.ID.gitlab)).toBe("gitlab")
  })
})
