import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { WorkTaskNotFoundError } from "../errors"

const Board = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
})

const Task = Schema.Struct({
  id: Schema.String,
  boardID: Schema.String,
  title: Schema.String,
  status: Schema.Literals(["open", "doing", "done"]),
  priority: Schema.Number,
})

export const WorkBoardGroup = HttpApiGroup.make("server.workboard")
  .add(
    HttpApiEndpoint.post("workboard.createBoard", "/api/workboard/boards", {
      payload: Schema.Struct({ name: Schema.String }),
      success: Board,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.workboard.boards.create",
        summary: "Create a work board",
        description: "Create a board that groups work tasks.",
      }),
    ),
    HttpApiEndpoint.get("workboard.listBoards", "/api/workboard/boards", {
      success: Schema.Array(Board),
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.workboard.boards.list",
        summary: "List work boards",
        description: "Get all work boards in creation order.",
      }),
    ),
    HttpApiEndpoint.post("workboard.createTask", "/api/workboard/boards/:boardID/tasks", {
      params: Schema.Struct({ boardID: Schema.String }),
      payload: Schema.Struct({ title: Schema.String, priority: Schema.optional(Schema.Number) }),
      success: Task,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.workboard.tasks.create",
        summary: "Create a task",
        description: "Create an open task on a board.",
      }),
    ),
    HttpApiEndpoint.get("workboard.listTasks", "/api/workboard/boards/:boardID/tasks", {
      params: Schema.Struct({ boardID: Schema.String }),
      success: Schema.Array(Task),
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.workboard.tasks.list",
        summary: "List board tasks",
        description: "Get all tasks on a board in creation order.",
      }),
    ),
    HttpApiEndpoint.post("workboard.moveTask", "/api/workboard/tasks/:taskID/move", {
      params: Schema.Struct({ taskID: Schema.String }),
      payload: Schema.Struct({ status: Schema.Literals(["open", "doing", "done"]) }),
      success: Task,
      error: WorkTaskNotFoundError,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.workboard.tasks.move",
        summary: "Move a task",
        description: "Change a task status (open, doing, done).",
      }),
    ),
  )
  .annotateMerge(OpenApi.annotations({ title: "workboards", description: "Experimental work board routes." }))
