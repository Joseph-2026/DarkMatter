import { Swarm } from "@apt5/core/swarm"
import { WorkBoard } from "@apt5/core/work-board"
import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { SwarmNotFoundError } from "../errors"
import { Authorization } from "../middleware/authorization"
import { InstanceContextMiddleware } from "../middleware/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "../middleware/workspace-routing"
import { described } from "./metadata"

const root = "/swarm"

const SwarmInfo = Schema.Struct({
  id: Swarm.SwarmID,
  name: Schema.String,
  status: Swarm.SwarmStatus,
  boardID: Schema.optional(WorkBoard.BoardID),
})

export const SwarmApi = HttpApi.make("swarm")
  .add(
    HttpApiGroup.make("swarm")
      .add(
        HttpApiEndpoint.post("createSwarm", root, {
          query: WorkspaceRoutingQuery,
          payload: Schema.Struct({ name: Schema.String }),
          success: described(SwarmInfo, "Created swarm"),
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "swarm.createSwarm",
            summary: "Create a swarm",
            description: "Create a swarm with its own work board.",
          }),
        ),
        HttpApiEndpoint.get("getSwarm", `${root}/:id`, {
          params: { id: Swarm.SwarmID },
          query: WorkspaceRoutingQuery,
          success: described(SwarmInfo, "Swarm"),
          error: [HttpApiError.BadRequest, SwarmNotFoundError],
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "swarm.getSwarm",
            summary: "Get a swarm",
            description: "Get one swarm by ID.",
          }),
        ),
      )
      .annotateMerge(
        OpenApi.annotations({
          title: "swarm",
          description: "Swarm routes.",
        }),
      )
      .middleware(InstanceContextMiddleware)
      .middleware(WorkspaceRoutingMiddleware)
      .middleware(Authorization),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "apt5 HttpApi",
      version: "0.0.1",
      description: "Effect HttpApi surface for instance routes.",
    }),
  )
