import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { Timestamps } from "../database/schema.sql"
import type { A2A } from "../a2a"

export const A2AMessageTable = sqliteTable("a2a_message", {
  id: text().$type<A2A.MessageID>().primaryKey(),
  from_agent: text().notNull(),
  to_agent: text().notNull(),
  type: text().notNull(),
  payload: text({ mode: "json" }).$type<unknown>().notNull(),
  status: text().$type<A2A.MessageStatus>().notNull().default("pending"),
  ...Timestamps,
})
