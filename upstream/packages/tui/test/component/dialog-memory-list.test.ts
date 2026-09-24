import { describe, expect, test } from "bun:test"
import {
  DEFAULT_MEMORY_NAMESPACE,
  memoryEntryOptions,
  memoryEntryPreview,
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
})
