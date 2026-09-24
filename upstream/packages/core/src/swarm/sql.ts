import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { Timestamps } from "../database/schema.sql"
import type { Swarm } from "../swarm"
import type { WorkBoard } from "../work-board"

export const SwarmTable = sqliteTable("swarm", {
  id: text().$type<Swarm.SwarmID>().primaryKey(),
  name: text().notNull(),
  status: text().$type<Swarm.SwarmStatus>().notNull().default("active"),
  board_id: text().$type<WorkBoard.BoardID>(),
  ...Timestamps,
})

export const SwarmRunTable = sqliteTable(
  "swarm_run",
  {
    id: text().$type<Swarm.RunID>().primaryKey(),
    swarm_id: text()
      .$type<Swarm.SwarmID>()
      .notNull()
      .references(() => SwarmTable.id),
    role: text().notNull(),
    task: text().notNull(),
    directory: text().notNull(),
    session_id: text(),
    task_id: text().$type<WorkBoard.TaskID>(),
    status: text().$type<Swarm.RunStatus>().notNull().default("pending"),
    ...Timestamps,
  },
  (table) => [index("swarm_run_swarm_idx").on(table.swarm_id)],
)
