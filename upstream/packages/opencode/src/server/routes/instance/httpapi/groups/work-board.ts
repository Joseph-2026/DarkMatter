import { WorkBoard } from "@apt5/core/work-board"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { WorkTaskNotFoundError } from "../errors"
import { Authorization } from "../middleware/authorization"
import { InstanceContextMiddleware } from "../middleware/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "../middleware/workspace-routing"
import { described } from "./metadata"

const root = "/work-board"

const Board = Schema.Struct({
  id: WorkBoard.BoardID,
  name: Schema.String,
})

const Task = Schema.Struct({
  id: WorkBoard.TaskID,
  boardID: WorkBoard.BoardID,
  title: Schema.String,
  status: WorkBoard.TaskStatus,
  priority: Schema.Number,
})

export const WorkBoardApi = HttpApi.make("work-board")
  .add(
    HttpApiGroup.make("work-board")
      .add(
        HttpApiEndpoint.post("createBoard", root, {
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({ name: Schema.String }),
          success: described(Board, "Created board"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "work-board.createBoard",
            summary: "Create a work board",
            description: "Create a board that groups work tasks.",
          }),
        ),
        HttpApiEndpoint.get("listBoards", root, {
          query: WorkspaceRoutingQuery,
          success: described(Schema.Array(Board), "List of boards"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "work-board.listBoards",
            summary: "List work boards",
            description: "Get all work boards in creation order.",
          }),
        ),
        HttpApiEndpoint.post("createTask", `${root}/:boardID/tasks`, {
          params: { boardID: WorkBoard.BoardID },
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({ title: Schema.String, priority: Schema.optional(Schema.Number) }),
          success: described(Task, "Created task"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "work-board.createTask",
            summary: "Create a task",
            description: "Create an open task on a board.",
          }),
        ),
        HttpApiEndpoint.get("listTasks", `${root}/:boardID/tasks`, {
          params: { boardID: WorkBoard.BoardID },
          query: WorkspaceRoutingQuery,
          success: described(Schema.Array(Task), "List of tasks"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "work-board.listTasks",
            summary: "List board tasks",
            description: "Get all tasks on a board in creation order.",
          }),
        ),
        HttpApiEndpoint.post("moveTask", `${root}/tasks/:taskID/move`, {
          params: { taskID: WorkBoard.TaskID },
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({ status: WorkBoard.TaskStatus }),
          success: described(Task, "Moved task"),
          error: [HttpApiError.BadRequest, WorkTaskNotFoundError],
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "work-board.moveTask",
            summary: "Move a task",
            description: "Change a task status (open, doing, done).",
          }),
        ),
      )
      .annotateMerge(
        OpenApi.annotations({
          title: "work-board",
          description: "Work board routes.",
        }),
      )
      .middleware(InstanceContextMiddleware)
      .middleware(WorkspaceRoutingMiddleware)
      .middleware(Authorization),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "apt5 HttpApi",
      version: "0.0.1",
      description: "Effect HttpApi surface for instance routes.",
    }),
  )
