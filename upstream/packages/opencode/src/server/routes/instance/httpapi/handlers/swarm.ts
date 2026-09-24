import { Swarm } from "@apt5/core/swarm"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"
import { SwarmNotFoundError } from "../errors"

export const swarmHandlers = HttpApiBuilder.group(InstanceHttpApi, "swarm", (handlers) =>
  Effect.gen(function* () {
    const svc = yield* Swarm.Service

    const createSwarm = Effect.fn("SwarmHttpApi.createSwarm")(function* (ctx: {
      payload: { name: string }
    }) {
      return yield* svc.createSwarm(ctx.payload.name)
    })

    const getSwarm = Effect.fn("SwarmHttpApi.getSwarm")(function* (ctx: {
      params: { id: Swarm.SwarmID }
    }) {
      const swarm = yield* svc.getSwarm(ctx.params.id)
      if (!swarm)
        return yield* Effect.fail(
          new SwarmNotFoundError({ swarmID: String(ctx.params.id), message: "Swarm not found" }),
        )
      return swarm
    })

    return handlers.handle("createSwarm", createSwarm).handle("getSwarm", getSwarm)
  }),
)
