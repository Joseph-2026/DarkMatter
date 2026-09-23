import { MemoryOS } from "@apt5/core/memory-os"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { MemoryEntryNotFoundError } from "../errors"
import { Authorization } from "../middleware/authorization"
import { InstanceContextMiddleware } from "../middleware/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "../middleware/workspace-routing"
import { described } from "./metadata"

const root = "/memory"

const Entry = Schema.Struct({
  id: MemoryOS.EntryID,
  namespace: Schema.String,
  key: Schema.String,
  value: Schema.Unknown,
})

export const MemoryOSApi = HttpApi.make("memory-os")
  .add(
    HttpApiGroup.make("memory-os")
      .add(
        HttpApiEndpoint.put("put", `${root}/:namespace/:key`, {
          params: { namespace: Schema.String, key: Schema.String },
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({ value: Schema.Unknown }),
          success: described(Entry, "Stored entry"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "memory-os.put",
            summary: "Store a memory entry",
            description: "Create or overwrite a namespaced memory entry.",
          }),
        ),
        HttpApiEndpoint.get("get", `${root}/:namespace/:key`, {
          params: { namespace: Schema.String, key: Schema.String },
          query: WorkspaceRoutingQuery,
          success: described(Entry, "Memory entry"),
          error: [HttpApiError.BadRequest, MemoryEntryNotFoundError],
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "memory-os.get",
            summary: "Read a memory entry",
            description: "Get one namespaced memory entry by key.",
          }),
        ),
        HttpApiEndpoint.get("list", `${root}/:namespace`, {
          params: { namespace: Schema.String },
          query: WorkspaceRoutingQuery,
          success: described(Schema.Array(Entry), "List of entries"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "memory-os.list",
            summary: "List namespace entries",
            description: "Get all memory entries in a namespace.",
          }),
        ),
        HttpApiEndpoint.delete("forget", `${root}/:namespace/:key`, {
          params: { namespace: Schema.String, key: Schema.String },
          query: WorkspaceRoutingQuery,
          success: described(Schema.Boolean, "Entry forgotten"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "memory-os.forget",
            summary: "Forget a memory entry",
            description: "Delete one namespaced memory entry by key.",
          }),
        ),
      )
      .annotateMerge(
        OpenApi.annotations({
          title: "memory-os",
          description: "Memory OS routes.",
        }),
      )
      .middleware(InstanceContextMiddleware)
      .middleware(WorkspaceRoutingMiddleware)
      .middleware(Authorization),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "opencode HttpApi",
      version: "0.0.1",
      description: "Effect HttpApi surface for instance routes.",
    }),
  )
