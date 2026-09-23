export * as WorkBoard from "./work-board"

import { asc, eq } from "drizzle-orm"
import { Context, Effect, Layer } from "effect"
import { WorkBoard } from "@apt5/schema/work-board"
import { Database } from "./database/database"
import { makeGlobalNode } from "./effect/app-node"
import { WorkBoardTable, WorkTaskTable } from "./work-board/sql"

export const BoardID = WorkBoard.BoardID
export type BoardID = WorkBoard.BoardID

export const TaskID = WorkBoard.TaskID
export type TaskID = WorkBoard.TaskID

export const TaskStatus = WorkBoard.TaskStatus
export type TaskStatus = WorkBoard.TaskStatus

export interface Board {
  readonly id: BoardID
  readonly name: string
}

export interface Task {
  readonly id: TaskID
  readonly boardID: BoardID
  readonly title: string
  readonly status: TaskStatus
  readonly priority: number
}

export class Service extends Context.Service<Service, Interface>()("@opencode/WorkBoard") {}

export interface Interface {
  readonly createBoard: (name: string) => Effect.Effect<Board>
  readonly listBoards: () => Effect.Effect<Board[]>
  readonly createTask: (boardID: BoardID, title: string, priority?: number) => Effect.Effect<Task>
  readonly moveTask: (id: TaskID, status: TaskStatus) => Effect.Effect<Task | undefined>
  readonly listTasks: (boardID: BoardID) => Effect.Effect<Task[]>
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const database = yield* Database.Service
    return Service.of({
      createBoard: Effect.fn("WorkBoard.createBoard")(function* (name: string) {
        const id = BoardID.create()
        yield* database.db.insert(WorkBoardTable).values({ id, name }).pipe(Effect.orDie)
        return { id, name }
      }),
      listBoards: Effect.fn("WorkBoard.listBoards")(function* () {
        const rows = yield* database.db
          .select()
          .from(WorkBoardTable)
          .orderBy(asc(WorkBoardTable.time_created))
          .all()
          .pipe(Effect.orDie)
        return rows.map((row) => ({ id: row.id, name: row.name }))
      }),
      createTask: Effect.fn("WorkBoard.createTask")(function* (boardID: BoardID, title: string, priority = 0) {
        const id = TaskID.create()
        yield* database.db
          .insert(WorkTaskTable)
          .values({ id, board_id: boardID, title, status: "open", priority })
          .pipe(Effect.orDie)
        return { id, boardID, title, status: "open" as TaskStatus, priority }
      }),
      moveTask: Effect.fn("WorkBoard.moveTask")(function* (id: TaskID, status: TaskStatus) {
        const row = yield* database.db
          .update(WorkTaskTable)
          .set({ status })
          .where(eq(WorkTaskTable.id, id))
          .returning()
          .get()
          .pipe(Effect.orDie)
        if (!row) return undefined
        return { id: row.id, boardID: row.board_id, title: row.title, status: row.status, priority: row.priority }
      }),
      listTasks: Effect.fn("WorkBoard.listTasks")(function* (boardID: BoardID) {
        const rows = yield* database.db
          .select()
          .from(WorkTaskTable)
          .where(eq(WorkTaskTable.board_id, boardID))
          .orderBy(asc(WorkTaskTable.time_created))
          .all()
          .pipe(Effect.orDie)
        return rows.map((row) => ({
          id: row.id,
          boardID: row.board_id,
          title: row.title,
          status: row.status,
          priority: row.priority,
        }))
      }),
    })
  }),
)

export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node] })
