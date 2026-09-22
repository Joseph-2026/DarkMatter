import { Config } from "effect"

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

const copy = process.env["APT5_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["APT5_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("APT5_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  APT5_AUTO_HEAP_SNAPSHOT: truthy("APT5_AUTO_HEAP_SNAPSHOT"),
  APT5_GIT_BASH_PATH: process.env["APT5_GIT_BASH_PATH"],
  APT5_CONFIG: process.env["APT5_CONFIG"],
  APT5_CONFIG_CONTENT: process.env["APT5_CONFIG_CONTENT"],
  APT5_DISABLE_AUTOUPDATE: truthy("APT5_DISABLE_AUTOUPDATE"),
  APT5_ALWAYS_NOTIFY_UPDATE: truthy("APT5_ALWAYS_NOTIFY_UPDATE"),
  APT5_DISABLE_PRUNE: truthy("APT5_DISABLE_PRUNE"),
  APT5_DISABLE_TERMINAL_TITLE: truthy("APT5_DISABLE_TERMINAL_TITLE"),
  APT5_SHOW_TTFD: truthy("APT5_SHOW_TTFD"),
  APT5_DISABLE_AUTOCOMPACT: truthy("APT5_DISABLE_AUTOCOMPACT"),
  APT5_DISABLE_MODELS_FETCH: truthy("APT5_DISABLE_MODELS_FETCH"),
  APT5_DISABLE_MOUSE: truthy("APT5_DISABLE_MOUSE"),
  APT5_FAKE_VCS: process.env["APT5_FAKE_VCS"],
  APT5_SERVER_PASSWORD: process.env["APT5_SERVER_PASSWORD"],
  APT5_SERVER_USERNAME: process.env["APT5_SERVER_USERNAME"],
  APT5_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("APT5_DISABLE_FFF"),

  // Experimental
  APT5_EXPERIMENTAL_FILEWATCHER: Config.boolean("APT5_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  APT5_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("APT5_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  APT5_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("APT5_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  APT5_MODELS_URL: process.env["APT5_MODELS_URL"],
  APT5_MODELS_PATH: process.env["APT5_MODELS_PATH"],
  APT5_DB: process.env["APT5_DB"],

  APT5_WORKSPACE_ID: process.env["APT5_WORKSPACE_ID"],
  APT5_EXPERIMENTAL_WORKSPACES: enabledByExperimental("APT5_EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get APT5_DISABLE_PROJECT_CONFIG() {
    return truthy("APT5_DISABLE_PROJECT_CONFIG")
  },
  get APT5_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("APT5_EXPERIMENTAL_REFERENCES")
  },
  get APT5_TUI_CONFIG() {
    return process.env["APT5_TUI_CONFIG"]
  },
  get APT5_CONFIG_DIR() {
    return process.env["APT5_CONFIG_DIR"]
  },
  get APT5_PURE() {
    return truthy("APT5_PURE")
  },
  get APT5_PERMISSION() {
    return process.env["APT5_PERMISSION"]
  },
  get APT5_PLUGIN_META_FILE() {
    return process.env["APT5_PLUGIN_META_FILE"]
  },
  get APT5_CLIENT() {
    return process.env["APT5_CLIENT"] ?? "cli"
  },
}
