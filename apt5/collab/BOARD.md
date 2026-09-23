# APT-5 Agent Collaboration Board

Shared notice board for every agent building this system (Muse Spark, Claude Code,
and any future agent). **This file is the source of truth for coordination.**
Git is the transport: claim work here, push branches, open PRs, let CI judge.

## 1. What we are building

**APT-5 / DarkMatter** — a production coding agent forked from `anomalyco/opencode`
(MIT, snapshot `fe3f3a4`), rebranded (`apt-5` binary, `darkmatter` alias, `.apt5`
config, `APT5_*` env, `@apt5/*` scopes), extended with civilization layers and an
OpenRouter free-tier router. Target: large companies — enterprise bar, no mocks in
production paths, every claim backed by evidence or CI.

Repo: `https://github.com/Joseph-2026/DarkMatter` · default branch: `main`.

## 2. Current state (2026-09-23)

| Item | State |
|---|---|
| Rebrand v1 (PR #1, merged) | Binary, config, TUI identity, provider IDs back to `opencode` (wire compat) |
| Civilization round 1 (PR #2, merged) | `work-board`, `memory-os`, `ledger`, `a2a`, `governance` in `packages/core` + generated migration `20260923035633_civilization` |
| Free router (in progress, branch `free-router`) | `FreeRouter.Chain` + `Catalog.model.free`, wire-ID guard test |
| TUI `darkmatter` theme | `packages/ui/src/theme/themes/darkmatter.json`, default flipped |
| CI | `build-and-check`, `secrets-guard`, smoke — must stay green |

## 3. Architecture map (read before touching)

- `upstream/packages/core/src/` — backend services. Pattern per domain:
  `<domain>.ts` (Service + Interface + Layer + node) + `<domain>/sql.ts` (drizzle tables).
  Reference skeleton: `global.ts`. DB-backed reference: `session/store.ts`.
- `upstream/packages/core/src/database/` — `database.ts` (Database.Service),
  `migration/<ts>_<name>.ts` (GENERATED, never hand-written),
  `migration.gen.ts`, `schema.gen.ts`, `schema.json`.
- `upstream/packages/schema/src/` — shared Effect schemas + ID brands.
  **Wire-ID rule**: `schema.make("...")` values are protocol. Never rename a value;
  `test/provider-id.test.ts` pins them.
- `upstream/packages/opencode/src/server/routes/` — HttpApi groups + handlers.
  **Changing public Protocol/HttpApi requires** `bun run generate` from
  `packages/client` + vendor tarball rebuild. Avoid unless the task demands it.
- Tests live next to code: `packages/core/test/`. Harness: `test/lib/effect.ts`
  (`testEffect`), `APT5_DB=":memory:"` via `test/preload.ts`. No mocks.

## 4. Iron rules (from upstream AGENTS.md — no exceptions)

1. Branch names: max three words, hyphens, no slashes/prefixes (`civilization-layers`, not `feat/x`).
2. Commits/PRs: conventional style — `feat(core): ...`, `fix(tui): ...`, `docs: ...`, `chore: ...`, `refactor: ...`, `test: ...`.
3. Migrations: `bun script/migration.ts --name <name>` from `packages/core`. Never hand-write.
4. Checks from package dirs: `bun run typecheck`, `bun test --timeout 30000 <file>`. Never `tsc`. Never run tests from repo root.
5. Style: no import aliases, no star imports, snake_case drizzle columns, no `any`,
   no `else`, bind services to named variables (`const db = yield* Db.Service`).
6. One PR per workstream. CI (`build-and-check`, `secrets-guard`, smoke) must be green before merge.
7. Evidence before claims. If a check contradicts you, the check wins.

## 5. Lane ownership (avoids merge conflicts)

| Lane | Owner | Scope |
|---|---|---|
| Core civilization + catalog + providers | Muse Spark | `packages/core/src`, `packages/schema/src`, migrations |
| Desktop/TUI surfaces + web docs + i18n | **Claude Code (suggested)** | `packages/app`, `packages/tui`, `packages/ui`, `packages/web`, `packages/desktop` |
| E2E / smoke scripts | unclaimed | `.github/workflows`, `apt5/gates` |

User (Joseph) has the final word on lanes. Claim a lane by editing this table in your PR.

## 6. Coordination protocol

1. Pick a task from §7 (or propose one here first).
2. Branch from `main`, implement with tests, run package typecheck + tests locally.
3. Open a PR against `main`, update §2 and §7 in the same PR.
4. Announce runtime agent messages via the A2A table when the API round lands;
   until then, this file + PR descriptions are the channel.

## 7. Task queue

- [x] Civilization round 1 (core domains + migration + tests)
- [x] Free router core (`FreeRouter.Chain`, `Catalog.model.free`, guard test)
- [ ] Civilization round 2: HttpApi groups + client regen for the 5 domains
- [ ] TUI surfaces for WorkBoard / Memory / Ledger (Claude Code lane)
- [ ] Docs: provider + free-router + governance policy format (`packages/web`)
- [ ] Release `apt-5-v1.0.0` (after rounds above are green)

## 8. Claude Code — start here

1. Read this file, then `upstream/AGENTS.md`, then
   `apt5/civilization/DESIGN.md`.
2. Verify your checkout: `git log --oneline -5`, `gh pr checks` on open PRs.
3. Suggested first task: docs page for the free router + governance policy
   (`packages/web/src/content/docs/providers.mdx` area) — zero conflict with core work.
4. Ask Joseph for lane confirmation before touching `packages/core` or migrations.
