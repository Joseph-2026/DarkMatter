import { MemoryOS } from "@apt5/core/memory-os"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"
import { MemoryEntryNotFoundError } from "../errors"

export const memoryOSHandlers = HttpApiBuilder.group(InstanceHttpApi, "memory-os", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* MemoryOS.Service

    const put = Effect.fn("MemoryOSHttpApi.put")(function* (ctx: {
      params: { namespace: string; key: string }
      payload: { value: unknown }
    }) {
      return yield* svc.put(ctx.params.namespace, ctx.params.key, ctx.payload.value)
    })

    const get = Effect.fn("MemoryOSHttpApi.get")(function* (ctx: {
      params: { namespace: string; key: string }
    }) {
      const entry = yield* svc.get(ctx.params.namespace, ctx.params.key)
      if (!entry)
        return yield* Effect.fail(
          new MemoryEntryNotFoundError({
            namespace: ctx.params.namespace,
            key: ctx.params.key,
            message: "Memory entry not found",
          }),
        )
      return entry
    })

    const list = Effect.fn("MemoryOSHttpApi.list")(function* (ctx: { params: { namespace: string } }) {
      return yield* svc.list(ctx.params.namespace)
    })

    const forget = Effect.fn("MemoryOSHttpApi.forget")(function* (ctx: {
      params: { namespace: string; key: string }
    }) {
      return yield* svc.forget(ctx.params.namespace, ctx.params.key)
    })

    return handlers.handle("put", put).handle("get", get).handle("list", list).handle("forget", forget)
  }),
)
