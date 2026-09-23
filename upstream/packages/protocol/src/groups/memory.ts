import { MemoryOS } from "@apt5/schema/memory-os"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { MemoryEntryNotFoundError } from "../errors"

const Entry = Schema.Struct({
  id: MemoryOS.EntryID,
  namespace: Schema.String,
  key: Schema.String,
  value: Schema.Unknown,
})

export const MemoryGroup = HttpApiGroup.make("server.memory")
  .add(
    HttpApiEndpoint.put("memory.entries.put", "/api/memory/:namespace/:key", {
      params: Schema.Struct({ namespace: Schema.String, key: Schema.String }),
      payload: Schema.Struct({ value: Schema.Unknown }),
      success: Entry,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.memory.entries.put",
        summary: "Store a memory entry",
        description: "Create or overwrite a namespaced memory entry.",
      }),
    ),
    HttpApiEndpoint.get("memory.entries.get", "/api/memory/:namespace/:key", {
      params: Schema.Struct({ namespace: Schema.String, key: Schema.String }),
      success: Entry,
      error: MemoryEntryNotFoundError,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.memory.entries.get",
        summary: "Read a memory entry",
        description: "Get one namespaced memory entry by key.",
      }),
    ),
    HttpApiEndpoint.get("memory.entries.list", "/api/memory/:namespace", {
      params: Schema.Struct({ namespace: Schema.String }),
      success: Schema.Array(Entry),
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.memory.entries.list",
        summary: "List namespace entries",
        description: "Get all memory entries in a namespace.",
      }),
    ),
    HttpApiEndpoint.delete("memory.entries.forget", "/api/memory/:namespace/:key", {
      params: Schema.Struct({ namespace: Schema.String, key: Schema.String }),
      success: Schema.Boolean,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.memory.entries.forget",
        summary: "Forget a memory entry",
        description: "Delete one namespaced memory entry by key.",
      }),
    ),
  )
  .annotateMerge(OpenApi.annotations({ title: "memories", description: "Experimental memory routes." }))
