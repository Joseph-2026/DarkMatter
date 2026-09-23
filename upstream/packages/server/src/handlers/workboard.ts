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
        "workboard.createBoard",
        Effect.fn(function* (ctx: { payload: { name: string } }) {
          return yield* svc.createBoard(ctx.payload.name)
        }),
      )
      .handle(
        "workboard.listBoards",
        Effect.fn(function* () {
          return yield* svc.listBoards()
        }),
      )
      .handle(
        "workboard.createTask",
        Effect.fn(function* (ctx: {
          params: { boardID: WorkBoard.BoardID }
          payload: { title: string; priority?: number }
        }) {
          return yield* svc.createTask(ctx.params.boardID, ctx.payload.title, ctx.payload.priority)
        }),
      )
      .handle(
        "workboard.listTasks",
        Effect.fn(function* (ctx: { params: { boardID: WorkBoard.BoardID } }) {
          return yield* svc.listTasks(ctx.params.boardID)
        }),
      )
      .handle(
        "workboard.moveTask",
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
