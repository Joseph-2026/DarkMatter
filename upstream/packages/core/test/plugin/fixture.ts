import { AgentV2 } from "@apt5/core/agent"
import { AISDK } from "@apt5/core/aisdk"
import { Catalog } from "@apt5/core/catalog"
import { CommandV2 } from "@apt5/core/command"
import { Credential } from "@apt5/core/credential"
import { AppNodeBuilder } from "@apt5/core/effect/app-node-builder"
import { LayerNodePlatform } from "@apt5/core/effect/app-node-platform"
import { LayerNode } from "@apt5/core/effect/layer-node"
import { EventV2 } from "@apt5/core/event"
import { FileSystem } from "@apt5/core/filesystem"
import { FSUtil } from "@apt5/core/fs-util"
import { Integration } from "@apt5/core/integration"
import { Location } from "@apt5/core/location"
import { Npm } from "@apt5/core/npm"
import { PluginV2 } from "@apt5/core/plugin"
import { Reference } from "@apt5/core/reference"
import { SkillV2 } from "@apt5/core/skill"
import { Effect, Layer } from "effect"
import { tempLocationLayer } from "../fixture/location"

const npmLayer = Layer.succeed(
  Npm.Service,
  Npm.Service.of({
    add: () => Effect.succeed({ directory: "", entrypoint: undefined }),
    install: () => Effect.void,
    which: () => Effect.succeed(undefined),
  }),
)

export const PluginTestLayer = AppNodeBuilder.build(
  LayerNode.group([
    FileSystem.node,
    FSUtil.node,
    Location.node,
    Npm.node,
    Credential.node,
    EventV2.node,
    LayerNodePlatform.httpClient,
    PluginV2.node,
    AgentV2.node,
    AISDK.node,
    Catalog.node,
    CommandV2.node,
    Integration.node,
    Reference.node,
    SkillV2.node,
  ]),
  [
    [Location.node, tempLocationLayer],
    [Npm.node, npmLayer],
  ],
)
