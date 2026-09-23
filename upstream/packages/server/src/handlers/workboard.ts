import { WorkBoard } from "@apt5/core/work-board"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"
import { WorkTaskNotFoundError } from "@apt5/protocol/errors"

export const WorkBoardHandler = HttpApiBuilder.group(Api, "server.workboard", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* WorkBoard.Service

    return handlers
      .handle(
        "workboard.boards.create",
        Effect.fn(function* (ctx: { payload: { name: string } }) {
          return yield* svc.createBoard(ctx.payload.name)
        }),
      )
      .handle(
        "workboard.boards.list",
        Effect.fn(function* () {
          return yield* svc.listBoards()
        }),
      )
      .handle(
        "workboard.tasks.create",
        Effect.fn(function* (ctx: {
          params: { boardID: WorkBoard.BoardID }
          payload: { title: string; priority?: number }
        }) {
          return yield* svc.createTask(ctx.params.boardID, ctx.payload.title, ctx.payload.priority)
        }),
      )
      .handle(
        "workboard.tasks.list",
        Effect.fn(function* (ctx: { params: { boardID: WorkBoard.BoardID } }) {
          return yield* svc.listTasks(ctx.params.boardID)
        }),
      )
      .handle(
        "workboard.tasks.move",
        Effect.fn(function* (ctx: {
          params: { taskID: WorkBoard.TaskID }
          payload: { status: WorkBoard.TaskStatus }
        }) {
          const task = yield* svc.moveTask(ctx.params.taskID, ctx.payload.status)
          if (!task) return yield* new WorkTaskNotFoundError({ taskID: String(ctx.params.taskID), message: "Task not found" })
          return task
        }),
      )
  }),
)
