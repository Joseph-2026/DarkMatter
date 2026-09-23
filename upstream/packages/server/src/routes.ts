import { Database } from "@apt5/core/database/database"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { httpClient } from "@apt5/core/effect/app-node-platform"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { EventV2 } from "@apt5/core/event"
import { Credential } from "@apt5/core/credential"
import { PermissionSaved } from "@apt5/core/permission/saved"
import { PtyTicket } from "@apt5/core/pty/ticket"
import { SessionV2 } from "@apt5/core/session"
import { SessionExecution } from "@apt5/core/session/execution"
import { LocationServiceMap } from "@apt5/core/location-service-map"
import { SessionExecutionLocal } from "@apt5/core/session/execution/local"
import { ToolOutputStore } from "@apt5/core/tool-output-store"
import { WorkBoard } from "@apt5/core/work-board"
import { MemoryOS } from "@apt5/core/memory-os"
import { Ledger } from "@apt5/core/ledger"
import { A2A } from "@apt5/core/a2a"
import { Governance } from "@apt5/core/governance"
import { HttpRouter, HttpServer } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Layer, Option } from "effect"
import { Api } from "./api"
import { ServerAuth } from "./auth"
import { handlers } from "./handlers"
import { authorizationLayer } from "./middleware/authorization"
import { schemaErrorLayer } from "./middleware/schema-error"
import { PtyEnvironment } from "./pty-environment"
import { layer as locationLayer } from "./location"
import { sessionLocationLayer } from "./middleware/session-location"

const applicationServices = LayerNode.group([
  Database.node,
  EventV2.node,
  httpClient,
  ToolOutputStore.cleanupNode,
  SessionV2.node,
  PermissionSaved.node,
  PtyTicket.node,
  Credential.node,
  PtyEnvironment.node,
  LocationServiceMap.node,
  WorkBoard.node,
  MemoryOS.node,
  Ledger.node,
  A2A.node,
  Governance.node,
])

export function createRoutes(password?: string) {
  return makeRoutes(
    password
      ? ServerAuth.Config.configLayer({ username: "darkmatter", password: Option.some(password) })
      : ServerAuth.Config.layer,
  )
}

export function createEmbeddedRoutes() {
  return makeRoutes(ServerAuth.Config.configLayer({ username: "darkmatter", password: Option.none() }))
}

function makeRoutes<AuthError, AuthServices>(auth: Layer.Layer<ServerAuth.Config, AuthError, AuthServices>) {
  const serviceLayer = AppNodeBuilder.build(applicationServices, [[SessionExecution.node, SessionExecutionLocal.node]])

  return HttpApiBuilder.layer(Api, { openapiPath: "/openapi.json" }).pipe(
    Layer.provide(handlers),
    Layer.provide(sessionLocationLayer),
    Layer.provide(locationLayer),
    Layer.provide(authorizationLayer),
    Layer.provide(schemaErrorLayer),
    Layer.provide(auth),
    Layer.provide(serviceLayer),
  )
}

export const routes = createRoutes()

export const webHandler = () =>
  HttpRouter.toWebHandler(routes.pipe(Layer.provide(HttpServer.layerServices)), { disableLogger: true })
