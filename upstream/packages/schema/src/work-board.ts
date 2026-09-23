export * as WorkBoard from "./work-board"

import { Schema } from "effect"
import { ascending } from "./identifier"
import { statics } from "./schema"

export const BoardID = Schema.String.pipe(
  Schema.brand("WorkBoard.BoardID"),
  statics((schema) => ({ create: () => schema.make("brd_" + ascending()) })),
)
export type BoardID = typeof BoardID.Type

export const TaskID = Schema.String.pipe(
  Schema.brand("WorkBoard.TaskID"),
  statics((schema) => ({ create: () => schema.make("tsk_" + ascending()) })),
)
export type TaskID = typeof TaskID.Type

export const TaskStatus = Schema.Literals(["open", "doing", "done"])
export type TaskStatus = typeof TaskStatus.Type
