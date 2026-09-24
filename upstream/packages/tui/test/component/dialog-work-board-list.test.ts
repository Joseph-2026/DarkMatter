import { describe, expect, test } from "bun:test"
import { nextTaskStatus, parseTaskTitle } from "../../src/component/dialog-work-board-list"

describe("dialog work board list", () => {
  test("advances open tasks to doing and doing tasks to done", () => {
    expect(nextTaskStatus("open")).toBe("doing")
    expect(nextTaskStatus("doing")).toBe("done")
  })

  test("does not advance done tasks", () => {
    expect(nextTaskStatus("done")).toBeUndefined()
  })

  test("trims task titles and rejects blanks", () => {
    expect(parseTaskTitle("  hello  ")).toBe("hello")
    expect(parseTaskTitle("   ")).toBeUndefined()
    expect(parseTaskTitle("")).toBeUndefined()
  })
})
