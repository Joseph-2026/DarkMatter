import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { Timestamps } from "../database/schema.sql"
import type { A2A } from "../a2a"
import type { Swarm } from "../swarm"
import { SwarmTable } from "../swarm/sql"

export const A2AMessageTable = sqliteTable(
  "a2a_message",
  {
    id: text().$type<A2A.MessageID>().primaryKey(),
    from_agent: text().notNull(),
    to_agent: text().notNull(),
    type: text().notNull(),
    payload: text({ mode: "json" }).$type<unknown>().notNull(),
    status: text().$type<A2A.MessageStatus>().notNull().default("pending"),
    origin: text().$type<A2A.MessageOrigin>().notNull().default("legacy"),
    signature: text(),
    ...Timestamps,
  },
  (table) => [index("a2a_message_to_status_idx").on(table.to_agent, table.status)],
)

export const SwarmAgentTable = sqliteTable(
  "swarm_agent",
  {
    id: text().$type<A2A.AgentID>().primaryKey(),
    swarm_id: text()
      .$type<Swarm.SwarmID>()
      .notNull()
      .references(() => SwarmTable.id),
    name: text().notNull(),
    public_key: text().notNull(),
    ...Timestamps,
  },
  (table) => [index("swarm_agent_swarm_name_idx").on(table.swarm_id, table.name)],
)
