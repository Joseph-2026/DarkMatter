export * as A2A from "./a2a"

import { Schema } from "effect"
import { ascending } from "./identifier"
import { statics } from "./schema"

export const MessageID = Schema.String.pipe(
  Schema.brand("A2A.MessageID"),
  statics((schema) => ({ create: () => schema.make("a2a_" + ascending()) })),
)
export type MessageID = typeof MessageID.Type

export const MessageStatus = Schema.Literals(["pending", "delivered"])
export type MessageStatus = typeof MessageStatus.Type
