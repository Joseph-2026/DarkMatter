import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { Timestamps } from "../database/schema.sql"
import type { Ledger } from "../ledger"

export const LedgerEntryTable = sqliteTable(
  "ledger_entry",
  {
    id: text().$type<Ledger.EntryID>().primaryKey(),
    session_id: text().notNull(),
    provider_id: text().notNull(),
    model_id: text().notNull(),
    input_tokens: integer().notNull().default(0),
    output_tokens: integer().notNull().default(0),
    cost: real().notNull().default(0),
    ...Timestamps,
  },
  (table) => [index("ledger_entry_session_idx").on(table.session_id)],
)
