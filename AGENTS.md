# AGENTS.md — DarkMatter (APT-5)

Fork of `anomalyco/opencode` (snapshot `fe3f3a4`), rebranded to APT-5.
Code lives in `upstream/` (bun 1.4.0 workspaces + turbo). Ops overlay in `apt5/`
(plans, branding scripts, civilization design, collab board, release notes).
Team subagents: `.cursor/agents/` (`apt5-backend`, `apt5-frontend`, `apt5-gatekeeper`).

## Commands (run from the stated dir — never guess)

- Package checks: `cd upstream/packages/<pkg> && bun run typecheck`
  (`tsgo --noEmit`; never bare `tsc`).
- Package tests: `cd upstream/packages/<pkg> && bun test --timeout 30000 <file>`.
  Never run tests from repo root (guard `do-not-run-tests-from-root`).
- Full gates: `cd upstream && bun run typecheck` (turbo). Lint is advisory only.
- Core migrations: `cd upstream/packages/core && bun script/migration.ts --check`
  (verify) or `--name <name>` (create). Never hand-write `migration/*.ts`.
- Client regen after Protocol/HttpApi changes:
  `cd upstream/packages/client && bun run generate` (commit the output).
- CI (16GB runners; dev box has 3.7GB — defer full typecheck to CI):
  `build-and-check`, `secrets-guard`, smoke (`test/acp/permission`,
  `test/event-manifest`). Install is always `bun install --frozen-lockfile`.

## Architecture (not obvious from filenames)

- Dependency direction is enforced: Schema → Core + Protocol → Server.
  Client code may use Schema/Protocol, never Core/Server. `sdk-next` composes all.
- Two API surfaces: instance HttpApi (`opencode/.../httpapi`, served by `apt-5 serve`)
  and the curated protocol surface (`protocol/src/groups/*` + `server/src/handlers/*`)
  compiled into `@apt5/client` via codegen. The desktop/app uses the **pinned vendor
  tarball** (`app/vendor/apt5-client-*-apt5.*.tgz`), not live codegen — new endpoints
  need a separate vendor round with app verification.
- Civilization domains (`work-board`, `memory-os`, `ledger`, `a2a`, `governance`):
  wire contracts in `schema/src/<domain>.ts`, services in `core/src/<domain>.ts`,
  tables in `core/src/<domain>/sql.ts`. Migration `20260923035633_civilization`.
- Effect v4 beta (`effect@4.0.0-beta.x`): `Schema.Literals([...])` for unions
  (not multi-arg `Literal`); `Effect.fn("Domain.method")`; no `Effect.fork`.
- Style (upstream AGENTS.md): no import aliases/star imports, snake_case drizzle
  columns, bind services to named vars, `yield* new MyError()` for early failure.

## Constraints that bite

- Wire IDs (`ProviderV2.ID.*`, integration IDs) keep upstream values —
  `core/test/provider-id.test.ts` pins them. Display strings use `darkmatter`.
- Branch names: ≤3 words, hyphens, no slashes. Commits: conventional
  (`feat(core): …`). One PR per workstream vs `main`; CI green before merge.
- Tests: no mocks in production paths; core tests use `:memory:` SQLite via
  `test/preload.ts` + `test/lib/effect.ts`. Piped `$?` lies — capture check
  output to a file and grep `error TS`.
- Coordination: `apt5/collab/BOARD.md` is source of truth; A2A table + PR
  descriptions are the channel. Sign messages with your own agent name only —
  never forge another identity (see Oct 2026 incident notes in BOARD history).

## Entry points

- CLI/TUI dev: `upstream/packages/opencode` (`bun dev` there; TUI via tmux, never
  blocking foreground). Binary `bin/apt-5` + `darkmatter` alias.
- Deep dives: `upstream/AGENTS.md`, `upstream/packages/opencode/AGENTS.md`,
  `upstream/packages/opencode/src/server/routes/instance/httpapi/AGENTS.md`,
  `apt5/civilization/DESIGN.md`, `specs/effect/migration.md`.
