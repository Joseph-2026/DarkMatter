# APT-5 Agent Collaboration Board

> **Agent mpya? Soma kwanza: `apt5/collab/START-HERE.md`.**
> New agent? Read first: `apt5/collab/START-HERE.md`.

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

## 0. Installing (user machines — verified 2026-09-26)

NEVER `bun build --compile src/index.ts` directly — the binary will boot-broken
(missing Solid transform, embedded UI, defines). Use the official pipeline:

```sh
cd upstream/packages/opencode
bun run script/build.ts --single   # ~10 min, then smoke-tests itself
cp dist/apt-5-linux-x64/bin/apt-5 ~/.local/bin/apt-5
```

`alias apt='apt-5'` in interactive shells only (`sudo apt`/`command apt`
unaffected). Known: naive `bun build --compile` boots to
`Error: Unexpected error / Effect.tryPromise` (packaging, not app logic).

## 2. Current state (2026-09-23 — post PR #5 merge `3c27b96`)

| Item | State |
|---|---|
| Rebrand v1 (PR #1, merged) | Binary, config, TUI identity, provider IDs back to `opencode` (wire compat) |
| Civilization round 1 (PR #2, merged) | `work-board`, `memory-os`, `ledger`, `a2a`, `governance` in `packages/core` + generated migration `20260923035633_civilization` |
| Free router (PR #3, merged) | `FreeRouter.Chain` + `Catalog.model.free`, wire-ID guard test |
| Civilization round 2 (PR #5, merged `3c27b96`) | `InstanceHttpApi` 5 groups + 5 handlers + 3 errors + app wiring (work-board, memory-os, ledger, a2a, governance) — CI green (build-and-check 3m06s) |
| TUI `darkmatter` theme | `packages/ui/src/theme/themes/darkmatter.json`, default flipped |
| Protocol `server.*` groups | `server.workboard` etc in `packages/protocol/src/groups/` (untracked, next: api.ts wiring + client regen) |
| CI | `build-and-check`, `secrets-guard`, smoke — all green on `main` |

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
8. HttpClient in opencode server tests: GET uses bare `HttpClient.execute` in
   the pipe, POST/PUT use `Effect.flatMap(HttpClient.execute)` (verified
   2026-09-23 — swapped forms fail at runtime, not typecheck).

## 5. Lane ownership (avoids merge conflicts)

| Lane | Owner | Scope |
|---|---|---|
| Core civilization + catalog + providers + release | PHASE010203 (lead) | `packages/core/src`, `packages/schema/src`, migrations |
| Backend / SDK / models / QA (delegates) | `apt5-backend`, `apt5-sdk`, `apt5-models`, `apt5-gatekeeper`, `apt5-qa` (.cursor/agents) | Respective lanes, coordinated by PHASE010203 |
| Surfaces + docs (delegates) | `apt5-frontend`, `apt5-docs` (.cursor/agents) | `app`, `tui`, `ui`, `web`, `desktop`, i18n |
| Desktop/TUI lane (external) | PHASE040506 — STUCK (no reply since handshake) | `packages/app`, `tui`, `ui`, `web`, `desktop` |
| E2E / smoke scripts | unclaimed | `.github/workflows`, `apt5/gates` |

User (Joseph) has the final word on lanes. Claim a lane by editing this table in your PR.

## 5b. Team doctrine (zero-defect — mission-critical)

This system ships to large companies. Every agent on this board operates under:
1. **Evidence or it didn't happen** — no green claim without the command output.
2. **Gates are blocking** — typecheck 0, tests 0-fail, migration check, secrets,
   CI green. A skipped gate is mission failure.
3. **No mocks in production paths; no silent fallbacks; every decision audited.**
4. **Own lane only.** Need another lane? File it in §7, don't trespass.
5. **Sign your own name only.** Forging another identity is an instant KILL
   finding (see `apt5-qa`).
6. **If evidence contradicts any claim — even the lead's — evidence wins, loudly.**

## 6. Coordination protocol

1. Pick a task from §7 (or propose one here first).
2. Branch from `main`, implement with tests, run package typecheck + tests locally.
3. Open a PR against `main`, update §2 and §7 in the same PR.
4. Announce runtime agent messages via the A2A table when the API round lands;
   until then, this file + PR descriptions are the channel.

## 7. Task queue

- [x] Civilization round 1 (core domains + migration + tests)
- [x] Free router core (`FreeRouter.Chain`, `Catalog.model.free`, guard test)
- [x] Civilization round 2: InstanceHttpApi groups + handlers + app wiring (PR #5 `civilization-api` → `main` `3c27b96`, CI green)
- [ ] TUI surfaces for WorkBoard / Memory / Ledger (Claude Code lane — **unblocked**, API live at `/work-board`, `/memory`, `/ledger`, `/a2a`, `/governance` + `API-FOR-TUI.md`)
- [ ] Docs: provider + free-router + governance policy format (`packages/web`) — can start in parallel (no core conflict)
- [x] Protocol `server.*` groups + client regen (PR #6 `board-update` → `main`, CI green)
- [x] **Vendor round (CLOSED BY DECISION, not deferral)** — new-surface tarball
  `apt5-client-1.18.32-apt5.0.tgz` built + verified. Pin stays on 1.17.13:
  47-name audit proves the new client is a different architecture — whole
  namespaces dropped (mcp, project, shell, session.command/shell, model.default,
  pending-queue), message/file shapes reworked. Flip = rewriting app features,
  not renaming types. App keeps old tarball (legacy flows work) + live
  `@apt5/sdk/v2` (new flows work). Revisit only when app migrates to v2 sessions.
- [ ] TUI surfaces for WorkBoard / Memory / Ledger (assignee: `apt5-frontend`, per `API-FOR-TUI.md`; blocked until vendor round lands — direct-`fetch` escape hatch only if Joseph approves)
- [ ] Docs: provider + free-router + governance policy format (`packages/web`; assignee: `apt5-docs`)
- [ ] RELEASE-NOTES refresh to current main (assignee: `apt5-docs`)
- [ ] Release `apt-5-v1.0.0` (assignee: `apt5-gatekeeper` verdict + lead; only when everything above is green)
- [ ] Vendor tarball decision: app still uses pinned `apt5-client-1.17.13-apt5.0.tgz`; rebuilding it from the new surface is a separate round (needs app verification)
- [ ] Release `apt-5-v1.0.0` (after TUI + docs + protocol regen are green)

## 8. Claude Code — start here

1. Read this file, then `upstream/AGENTS.md`, then
   `apt5/civilization/DESIGN.md`.
2. Verify your checkout: `git log --oneline -5`, `gh pr checks` on open PRs.
3. Suggested first task: docs page for the free router + governance policy
   (`packages/web/src/content/docs/providers.mdx` area) — zero conflict with core work.
4. Ask Joseph for lane confirmation before touching `packages/core` or migrations.
