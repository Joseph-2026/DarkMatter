import { Config, ConfigProvider, Context, Effect, Layer, Option } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const positiveInteger = (name: string) =>
  Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
const experimental = bool("APT5_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: Config.boolean(name).pipe(Config.option) }).pipe(
    Config.map((flags) => Option.getOrElse(flags.enabled, () => flags.experimental)),
  )

export class Service extends ConfigService.Service<Service>()("/RuntimeFlags", {
  autoShare: bool("APT5_AUTO_SHARE"),
  pure: bool("APT5_PURE"),
  disableDefaultPlugins: bool("APT5_DISABLE_DEFAULT_PLUGINS"),
  disableEmbeddedWebUi: bool("APT5_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("APT5_DISABLE_EXTERNAL_SKILLS"),
  disableLspDownload: bool("APT5_DISABLE_LSP_DOWNLOAD"),
  disableClaudeCodePrompt: Config.all({
    broad: bool("APT5_DISABLE_CLAUDE_CODE"),
    direct: bool("APT5_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: bool("APT5_DISABLE_CLAUDE_CODE"),
    direct: bool("APT5_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("APT5_ENABLE_EXA"),
    legacy: bool("APT5_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("APT5_ENABLE_PARALLEL"),
    legacy: bool("APT5_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("APT5_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("APT5_ENABLE_QUESTION_TOOL"),
  experimentalReferences: enabledByExperimental("APT5_EXPERIMENTAL_REFERENCES"),
  experimentalBackgroundSubagents: enabledByExperimental("APT5_EXPERIMENTAL_BACKGROUND_SUBAGENTS"),
  experimentalLspTy: bool("APT5_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("APT5_EXPERIMENTAL_LSP_TOOL"),
  experimentalOxfmt: enabledByExperimental("APT5_EXPERIMENTAL_OXFMT"),
  experimentalPlanMode: enabledByExperimental("APT5_EXPERIMENTAL_PLAN_MODE"),
  experimentalCodeMode: enabledByExperimental("APT5_EXPERIMENTAL_CODE_MODE"),
  experimentalEventSystem: enabledByExperimental("APT5_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalWorkspaces: enabledByExperimental("APT5_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("APT5_EXPERIMENTAL_ICON_DISCOVERY"),
  outputTokenMax: positiveInteger("APT5_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("APT5_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  experimentalNativeLlm: bool("APT5_EXPERIMENTAL_NATIVE_LLM"),
  experimentalWebSockets: bool("APT5_EXPERIMENTAL_WEBSOCKETS"),
  client: Config.string("APT5_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.layer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const node = LayerNode.make({ service: Service, layer: Service.layer.pipe(Layer.orDie), deps: [] })

export * as RuntimeFlags from "./runtime-flags"
import { LayerNode } from "@apt5/core/effect/layer-node"
