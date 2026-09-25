import { Schema } from "effect"
import { HttpApi } from "effect/unstable/httpapi"
import { EventV2 } from "@apt5/core/event"
import { EventManifest } from "@/event-manifest"
import { Credential } from "@apt5/core/credential"
import { Integration } from "@apt5/core/integration"
import { SkillV2 } from "@apt5/core/skill"
import { InstanceDisposed } from "@/server/event"
import { Question } from "@/question"
import { A2AApi } from "./groups/a2a"
import { ConfigApi } from "./groups/config"
import { ControlApi } from "./groups/control"
import { ControlPlaneApi } from "./groups/control-plane"
import { EventApi } from "./groups/event"
import { ExperimentalApi } from "./groups/experimental"
import { FileApi } from "./groups/file"
import { GovernanceApi } from "./groups/governance"
import { InstanceApi } from "./groups/instance"
import { LedgerApi } from "./groups/ledger"
import { McpApi } from "./groups/mcp"
import { MemoryOSApi } from "./groups/memory-os"
import { PermissionApi } from "./groups/permission"
import { ProjectApi } from "./groups/project"
import { ProjectCopyApi } from "./groups/project-copy"
import { ProviderApi } from "./groups/provider"
import { PtyApi, PtyConnectApi } from "./groups/pty"
import { QuestionApi } from "./groups/question"
import { SessionApi } from "./groups/session"
import { SyncApi } from "./groups/sync"
import { SwarmApi } from "./groups/swarm"
import { TuiApi } from "./groups/tui"
import { WorkBoardApi } from "./groups/work-board"
import { WorkspaceApi } from "./groups/workspace"
import { makeApi } from "@apt5/protocol/api"
import { LocationMiddleware } from "@apt5/server/location"
import { SessionLocationMiddleware } from "@apt5/server/middleware/session-location"
import { GlobalApi } from "./groups/global"
import { Authorization } from "./middleware/authorization"
import { SchemaErrorMiddleware } from "./middleware/schema-error"

const EventSchema = Schema.Union([
  ...EventManifest.Latest.values()
    .map((definition) =>
      Schema.Struct({
        id: EventV2.ID,
        type: Schema.Literal(definition.type),
        properties: definition.data,
      }).annotate({ identifier: `Event.${definition.type}` }),
    )
    .toArray(),
  InstanceDisposed,
]).annotate({ identifier: "Event" })

export const ServerApi = makeApi({
  definitions: EventManifest.Latest.values().toArray(),
  locationMiddleware: LocationMiddleware,
  sessionLocationMiddleware: SessionLocationMiddleware,
})

export const RootHttpApi = HttpApi.make("apt5-root")
  .addHttpApi(ControlApi)
  .addHttpApi(ControlPlaneApi)
  .addHttpApi(GlobalApi)
  .middleware(SchemaErrorMiddleware)
  .middleware(Authorization)

export const InstanceHttpApi = HttpApi.make("apt5-instance")
  .addHttpApi(ConfigApi)
  .addHttpApi(ExperimentalApi)
  .addHttpApi(FileApi)
  .addHttpApi(InstanceApi)
  .addHttpApi(McpApi)
  .addHttpApi(ProjectApi)
  .addHttpApi(ProjectCopyApi)
  .addHttpApi(PtyApi)
  .addHttpApi(QuestionApi)
  .addHttpApi(PermissionApi)
  .addHttpApi(ProviderApi)
  .addHttpApi(SessionApi)
  .addHttpApi(SyncApi)
  .addHttpApi(SwarmApi)
  .addHttpApi(TuiApi)
  .addHttpApi(WorkBoardApi)
  .addHttpApi(MemoryOSApi)
  .addHttpApi(LedgerApi)
  .addHttpApi(A2AApi)
  .addHttpApi(GovernanceApi)
  .addHttpApi(WorkspaceApi)
  .middleware(SchemaErrorMiddleware)

export const Apt5HttpApi = HttpApi.make("apt5")
  .addHttpApi(RootHttpApi)
  .addHttpApi(EventApi)
  .addHttpApi(InstanceHttpApi)
  .addHttpApi(ServerApi)
  .addHttpApi(PtyConnectApi)
  .annotate(HttpApi.AdditionalSchemas, [
    EventSchema,
    Question.Replied,
    Question.Rejected,
    Credential.Value,
    Integration.Inputs,
    Integration.Method,
    Integration.Ref,
    SkillV2.Source,
  ])

export type RootHttpApiType = typeof RootHttpApi
export type InstanceHttpApiType = typeof InstanceHttpApi
