export * as Swarm from "./swarm"

import { Schema } from "effect"
import { ascending } from "./identifier"
import { statics } from "./schema"

export const SwarmID = Schema.String.pipe(
  Schema.brand("Swarm.SwarmID"),
  statics((schema) => ({ create: () => schema.make("swm_" + ascending()) })),
)
export type SwarmID = typeof SwarmID.Type

export const RunID = Schema.String.pipe(
  Schema.brand("Swarm.RunID"),
  statics((schema) => ({ create: () => schema.make("run_" + ascending()) })),
)
export type RunID = typeof RunID.Type

export const SwarmStatus = Schema.Literals(["active", "done"])
export type SwarmStatus = typeof SwarmStatus.Type

export const RunStatus = Schema.Literals(["pending", "running", "done", "failed"])
export type RunStatus = typeof RunStatus.Type
