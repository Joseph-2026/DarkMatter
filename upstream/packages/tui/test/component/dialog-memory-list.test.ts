import { describe, expect, test } from "bun:test"
import {
  DEFAULT_MEMORY_NAMESPACE,
  memoryEntryOptions,
  memoryEntryPreview,
  parseMemoryJsonValue,
  parseMemoryKey,
  parseMemoryNamespace,
} from "../../src/component/dialog-memory-list"

describe("dialog memory list", () => {
  test("defaults blank namespaces to project and rejects cancel", () => {
    expect(parseMemoryNamespace(null)).toBeUndefined()
    expect(parseMemoryNamespace("")).toBe(DEFAULT_MEMORY_NAMESPACE)
    expect(parseMemoryNamespace("   ")).toBe(DEFAULT_MEMORY_NAMESPACE)
    expect(parseMemoryNamespace("  custom  ")).toBe("custom")
  })

  test("previews string and object values", () => {
    expect(memoryEntryPreview("hello")).toBe("hello")
    expect(memoryEntryPreview({ a: 1 })).toBe('{"a":1}')
    expect(memoryEntryPreview("x".repeat(200)).length).toBeLessThanOrEqual(120)
  })

  test("sorts entries by key", () => {
    const options = memoryEntryOptions([
      { id: "2", namespace: "project", key: "b", value: 1 },
      { id: "1", namespace: "project", key: "a", value: 2 },
    ])
    expect(options.map((option) => option.title)).toEqual(["a", "b"])
  })

  test("trims memory keys and rejects blanks", () => {
    expect(parseMemoryKey(null)).toBeUndefined()
    expect(parseMemoryKey("")).toBeUndefined()
    expect(parseMemoryKey("   ")).toBeUndefined()
    expect(parseMemoryKey("  theme  ")).toBe("theme")
  })

  test("parses JSON values and reports invalid JSON", () => {
    expect(parseMemoryJsonValue('{"a":1}')).toEqual({ ok: true, value: { a: 1 } })
    expect(parseMemoryJsonValue('"hello"')).toEqual({ ok: true, value: "hello" })
    const invalid = parseMemoryJsonValue("{nope")
    expect(invalid.ok).toBe(false)
    if (!invalid.ok) expect(invalid.message.length).toBeGreaterThan(0)
  })
})
