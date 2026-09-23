# API for TUI — Spark → Claude (collaboration)

**Branch:** `civilization-api` @ `ad8ef1e` (fix: wire nodes) — PR #5
**Base:** `InstanceHttpApi` (`upstream/packages/opencode/src/server/routes/instance/httpapi/api.ts:78`)
**DB:** `/home/blackhat/.local/share/darkmatter/opencode-local.db` + `A2A` table for live messaging
**Date:** 2026-09-23 — A2A seq: handshake → reply → update → progress → fix (all via `A2A.Service`)

> Claude, hii ndiyo contract yako ya TUI. Sijagusa `packages/tui` — hii doc tu. Unaweza ku-consume moja kwa moja via `fetch`/`@apt5/opencode` client au `curl` kwa dev.

## Endpoints (HttpApi groups, all under workspace routing + auth)

### 1. work-board — `groups/work-board.ts`
- `POST /work-board?name` + payload `{name}` → `Board {id, name}` — `createBoard`
- `GET /work-board` → `Board[]` — `listBoards`
- `POST /work-board/:boardID/tasks` payload `{title, priority?}` → `Task {id, boardID, title, status, priority}` — `createTask`
- `GET /work-board/:boardID/tasks` → `Task[]` — `listTasks`
- `POST /work-board/tasks/:taskID/move` payload `{status: "open"|"doing"|"done"}` → `Task` (404 if missing) — `moveTask`

**TUI tip:** Table ya boards + kanban ya tasks (open/doing/done). `moveTask` hutumia `BoardID.create()` na `TaskID` branded.

### 2. memory-os — `groups/memory-os.ts`
- `PUT /memory/:namespace/:key` payload `{value: unknown}` → `Entry {id, namespace, key, value}`
- `GET /memory/:namespace/:key` → `Entry` (404 if missing) — `get`
- `GET /memory/:namespace` → `Entry[]` — `list`
- `DELETE /memory/:namespace/:key` → `boolean` — `forget`

**TUI tip:** Namespace = e.g. `tui.prefs`, `agent.memory`. List pane + put/forget actions.

### 3. ledger — `groups/ledger.ts`
- `POST /ledger` payload `{sessionID, providerID, modelID, inputTokens, outputTokens, cost}` → `Entry` (append-only)
- `GET /ledger` → `Entry[]`
- `GET /ledger/summary` → `{entries, inputTokens, outputTokens, cost}`

**TUI tip:** Footer cost/budget + sparkline ya tokens. Append-only, hakuna update/delete.

### 4. a2a — `groups/a2a.ts` — **ndiyo mawasiliano yetu**
- `POST /a2a` payload `{from, to, type, payload}` → `Message {id, from, to, type, payload, status:"pending"}`
- `GET /a2a/inbox/:agent` → `Message[]` (pending only)
- `POST /a2a/:id/ack` → `Message` (status → delivered, 404 if missing)

**Live test (via core service, sio HTTP):**
```ts
import { A2A } from "@apt5/core/a2a"
const bus = yield* A2A.Service
const inbox = yield* bus.inbox("claude") // pending
yield* bus.ack(id)
```

### 5. governance — `groups/governance.ts`
- `POST /governance/rules` payload `{pattern, effect: "allow"|"deny"|"approve"}` → `Rule {id, pattern, effect}`
- `GET /governance/rules` → `Rule[]`
- `POST /governance/evaluate` payload `{action}` → `{action, decision, ruleID?}` (writes audit row)

**TUI tip:** Policy editor + evaluate preview + audit timeline. `pattern` supports `*` suffix.

## Errors — `errors.ts`
- `WorkTaskNotFoundError` (404), `MemoryEntryNotFoundError` (404), `A2AMessageNotFoundError` (404) — zote `Schema.TaggedErrorClass` with `httpApiStatus:404`
- Handler pattern: service returns `undefined` → handler fails with `new XNotFoundError({…})` at boundary (core service stays HttpApi-free).

## Wiring — `server.ts`
- `InstanceHttpApi` `.addHttpApi(...)` 5 groups + `instanceApiRoutes` provides `workBoardHandlers` etc.
- `app = LayerNode.group([... WorkBoard.node, MemoryOS.node, Ledger.node, A2A.node, Governance.node])` — **fix @ ad8ef1e**: lazima nodes ziwe kwenye app, sio handlers pekee
- `RouteRequirements` stays `HttpRouter | Request<...>` — Observability last.

## Gates (usisahau)
- `cd upstream/packages/<pkg> && bun run typecheck` — CI heavy runner ina-judge (local RAM mdogo)
- `bun test --timeout 30000 test/<file>` — 5 core tests + provider-id + free-router zote pass
- Branch `≤3 words-hyphen`, conventional commits (`feat`, `fix`, `docs`), one PR per workstream, CI green

## Next
- Mimi (Spark): nasubiri CI green kwa `ad8ef1e`, kisha Joseph a-merge PR #5 → TUI ita-consume live.
- Wewe (Claude): scaffold TUI surfaces kwenye `packages/tui`/`ui`/`web` — ukihitaji field ya API niandikie `BOARD.md §7` au `A2A.send("claude","spark","collab.request", {...})` — sitachelewa.

Karibu — collaboration inaendelea, hatusimami!

— Spark
