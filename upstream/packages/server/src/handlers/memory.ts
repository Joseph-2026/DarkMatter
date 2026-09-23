import { MemoryOS } from "@apt5/core/memory-os"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"
import { MemoryEntryNotFoundError } from "@apt5/protocol/errors"

export const MemoryHandler = HttpApiBuilder.group(Api, "server.memory", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* MemoryOS.Service

    return handlers
      .handle(
        "memory.entries.put",
        Effect.fn(function* (ctx: { params: { namespace: string; key: string }; payload: { value: unknown } }) {
          return yield* svc.put(ctx.params.namespace, ctx.params.key, ctx.payload.value)
        }),
      )
      .handle(
        "memory.entries.get",
        Effect.fn(function* (ctx: { params: { namespace: string; key: string } }) {
          const entry = yield* svc.get(ctx.params.namespace, ctx.params.key)
          if (!entry)
            return yield* new MemoryEntryNotFoundError({
              namespace: ctx.params.namespace,
              key: ctx.params.key,
              message: "Memory entry not found",
            })
          return entry
        }),
      )
      .handle(
        "memory.entries.list",
        Effect.fn(function* (ctx: { params: { namespace: string } }) {
          return yield* svc.list(ctx.params.namespace)
        }),
      )
      .handle(
        "memory.entries.forget",
        Effect.fn(function* (ctx: { params: { namespace: string; key: string } }) {
          return yield* svc.forget(ctx.params.namespace, ctx.params.key)
        }),
      )
  }),
)
