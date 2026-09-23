import { WorkBoard } from "@apt5/core/work-board"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"
import { WorkTaskNotFoundError } from "../errors"

export const workBoardHandlers = HttpApiBuilder.group(InstanceHttpApi, "work-board", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* WorkBoard.Service

    const createBoard = Effect.fn("WorkBoardHttpApi.createBoard")(function* (ctx: {
      payload: { name: string }
    }) {
      return yield* svc.createBoard(ctx.payload.name)
    })

    const listBoards = Effect.fn("WorkBoardHttpApi.listBoards")(function* () {
      return yield* svc.listBoards()
    })

    const createTask = Effect.fn("WorkBoardHttpApi.createTask")(function* (ctx: {
      params: { boardID: WorkBoard.BoardID }
      payload: { title: string; priority?: number }
    }) {
      return yield* svc.createTask(ctx.params.boardID, ctx.payload.title, ctx.payload.priority)
    })

    const listTasks = Effect.fn("WorkBoardHttpApi.listTasks")(function* (ctx: {
      params: { boardID: WorkBoard.BoardID }
    }) {
      return yield* svc.listTasks(ctx.params.boardID)
    })

    const moveTask = Effect.fn("WorkBoardHttpApi.moveTask")(function* (ctx: {
      params: { taskID: WorkBoard.TaskID }
      payload: { status: WorkBoard.TaskStatus }
    }) {
      const task = yield* svc.moveTask(ctx.params.taskID, ctx.payload.status)
      if (!task)
        return yield* Effect.fail(
          new WorkTaskNotFoundError({ taskID: String(ctx.params.taskID), message: "Task not found" }),
        )
      return task
    })

    return handlers
      .handle("createBoard", createBoard)
      .handle("listBoards", listBoards)
      .handle("createTask", createTask)
      .handle("listTasks", listTasks)
      .handle("moveTask", moveTask)
  }),
)
