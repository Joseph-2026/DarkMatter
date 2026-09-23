import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { Timestamps } from "../database/schema.sql"
import type { WorkBoard } from "../work-board"

export const WorkBoardTable = sqliteTable("work_board", {
  id: text().$type<WorkBoard.BoardID>().primaryKey(),
  name: text().notNull(),
  ...Timestamps,
})

export const WorkTaskTable = sqliteTable(
  "work_task",
  {
    id: text().$type<WorkBoard.TaskID>().primaryKey(),
    board_id: text()
      .$type<WorkBoard.BoardID>()
      .notNull()
      .references(() => WorkBoardTable.id),
    title: text().notNull(),
    status: text().$type<WorkBoard.TaskStatus>().notNull().default("open"),
    priority: integer().notNull().default(0),
    ...Timestamps,
  },
  (table) => [index("work_task_board_idx").on(table.board_id)],
)
