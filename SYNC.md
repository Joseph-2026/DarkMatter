# Upstream sync record

- Upstream: `anomalyco/opencode`, branch `dev`
- Pinned commit: `fe3f3a41f79ad292cc3c7c629567385a20ec5130`
- Commit date: 2026-09-21 — `sync release versions for v1.18.32`
- License: MIT (see `CREDITS.md` + upstream `LICENSE`)
- Local reference snapshot: `/tmp/opencode-upstream` (shallow, depth 1, 6632 files, ~221MB)
- Packages observed (30): app, cli, client, codemode, console, containers, core, desktop, docs,
  effect-drizzle-sqlite, effect-sqlite-node, enterprise, function, httpapi-codegen, http-recorder,
  identity, llm, opencode, plugin, protocol, schema, script, sdk, sdk-next, server, session-ui,
  slack, stats, storybook, tui, ui, web
- TUI stack: `@opentui/core` + `@opentui/solid` (SolidJS terminal UI), shiki, kobalte — redesign
  ya DarkMatter itajengwa juu ya OpenTUI/Solid, sio React/Ink.
- packageManager: `bun@1.3.14`
- Strategy: squashed snapshot import kwenye `upstream/` (single commit, historia ya upstream hailetwi —
  ndio njia ya rebrand isiyoacha fork badge; full history inabaki kwenye GitHub upstream yenyewe).
- Status: inspected — snapshot import + baseline `bun install/test` ndio hatua inayofuata.
