export * as MemoryOS from "./memory-os"

import { Schema } from "effect"
import { ascending } from "./identifier"
import { statics } from "./schema"

export const EntryID = Schema.String.pipe(
  Schema.brand("MemoryOS.EntryID"),
  statics((schema) => ({ create: () => schema.make("mem_" + ascending()) })),
)
export type EntryID = typeof EntryID.Type
