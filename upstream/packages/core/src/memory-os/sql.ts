import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { Timestamps } from "../database/schema.sql"
import type { MemoryOS } from "../memory-os"

export const MemoryEntryTable = sqliteTable(
  "memory_entry",
  {
    id: text().$type<MemoryOS.EntryID>().primaryKey(),
    namespace: text().notNull(),
    key: text().notNull(),
    value: text({ mode: "json" }).$type<unknown>().notNull(),
    ...Timestamps,
  },
  (table) => [uniqueIndex("memory_entry_namespace_key_idx").on(table.namespace, table.key)],
)
