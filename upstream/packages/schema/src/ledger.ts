export * as Ledger from "./ledger"

import { Schema } from "effect"
import { ascending } from "./identifier"
import { statics } from "./schema"

export const EntryID = Schema.String.pipe(
  Schema.brand("Ledger.EntryID"),
  statics((schema) => ({ create: () => schema.make("ldg_" + ascending()) })),
)
export type EntryID = typeof EntryID.Type
