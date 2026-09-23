import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { WorkBoard } from "@apt5/core/work-board"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { testEffect } from "./lib/effect"

const services = AppNodeBuilder.build(LayerNode.group([WorkBoard.node]))
const it = testEffect(services)

describe("WorkBoard", () => {
  it.effect("creates a board, adds tasks, and moves one to done", () =>
    Effect.gen(function* () {
      const board = yield* WorkBoard.Service
      const created = yield* board.createBoard("Release")
      expect(created.name).toBe("Release")

      const first = yield* board.createTask(created.id, "Cut RC", 1)
      const second = yield* board.createTask(created.id, "Write notes")
      expect(first.status).toBe("open")
      expect(second.priority).toBe(0)

      const moved = yield* board.moveTask(first.id, "done")
      expect(moved?.status).toBe("done")

      const tasks = yield* board.listTasks(created.id)
      expect(tasks.length).toBe(2)

      const boards = yield* board.listBoards()
      expect(boards.some((entry) => entry.id === created.id)).toBe(true)
    }),
  )
})
