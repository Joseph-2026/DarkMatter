# DarkMatter / APT-5 — PLAN NZIMA (opencode CLI fork)

## 0. Ground truth
- Upstream: `anomalyco/opencode` branch `dev` — CLI-native coding agent (Bun + Turbo + packages/, TUI, server, SDK, IDE/desktop clients).
- CLI inakuja tayari na muunganiko wa providers 75+ (Models.dev) + Zen + LSP + multi-session + share + MCP + skills/rules/agents.
- **Hatutajenga providers upya.** Tutatumia yaliyopo + tunaongeza OpenRouter free router (primary→fallbacks) kwa test.
- Brand: APT-5, UI English only. Key ya test ni env var `OPENROUTER_API_KEY` **pekee** — kamwe isiingie repo (`.env`, logs, docs zote zimegitignore).
- MIT: LICENSE + attribution ya upstream inabaki. Hii ni fork halali.
- Repos: specs https://github.com/Joseph-2026/staris-agency-5 | kazi https://github.com/Joseph-2026/DarkMatter

## 1. Fork strategy (usiharibu core)
```
DarkMatter/
  upstream/          # snapshot read-only ya anomalyco/opencode@dev + SHA record (SYNC.md)
  apt5/              # kazi yetu yote — rebrand, TUI, streaming, civilization
    branding/ tui/ streaming/ providers/ civilization/
    workboard/ noticeboard/ a2a/ onboarding/ memory/ economy/ governance/
    registry/ factory/
  tests/ docs/ scripts/
```
- [ ] 1.1 Snapshot upstream (shallow→full), record SHA/date kwenye `SYNC.md`.
- [ ] 1.2 Baseline: `bun install` + `bun test` upstream green **kabla** ya kugusa chochote.
- [ ] 1.3 Upstream sync monthly kwenye branch `sync/upstream-YYYY-MM`, merge baada ya tests.
- Gate: baseline green ndio rebrand inaruhusiwa.

## 2. Rebrand APT-5 (non-breaking, siku 1-2)
- [ ] 2.1 `package.json`: name `apt-5`, bin `apt-5` (+alias `darkmatter`), version `5.0.0-apt`.
- [ ] 2.2 Install script + docs + `--help/--version` zinaonyesha APT-5.
- [ ] 2.3 Config: `~/.apt5` + env `APT5_*`, migration kutoka opencode bila kufuta user data.
- [ ] 2.4 Smoke: `apt-5 --help`, `apt-5 run "ping"`, `apt-5 doctor`.
- Gate: tests za upstream bado green, engine API haijabadilika.

## 3. Providers (tumia yaliyopo + OpenRouter test)
- [ ] 3.1 Weka providers zote za upstream kama zilivyo (Models.dev, Zen, Copilot/ChatGPT login flows).
- [ ] 3.2 Ongeza `apt5/providers/openrouter.ts`: router primary `nex-agi/nex-n2.5-mini:free`
      → `nvidia/nemotron-3-ultra-550b-a55b:free` → `liquid/lfm-2.5-2.6b:free` → `cohere/north-mini-code:free`,
      429/403 auto-skip, FREE_CATALOG 21. **VERIFIED 2026-09-22: primary inajibu `pong`, /models 200.**
- [ ] 3.3 Key **env only**: `.env.example` na `OPENROUTER_API_KEY=` tupu. CI hutumia secrets, sio repo.
- [ ] 3.4 Fallback: provider outage → gateway inachagua fallback, trace ina-record switch, eval ina-check drift.
- Gate: `apt-5 run` na free key inafanya kazi bila key kuingia git (`git log -p | grep sk-or` lazima tupu).

## 4. TUI kisasa DarkMatter (siku 3-5)
Reference: `demo.png` (Claude Code v2.0.0 header + prompt + footer).
- [ ] 4.1 Theme `darkmatter-neon` (default) + `darkmatter-minimal` (light): header (APT-5 + model + dir), prompt, live diff/tests pane, footer (cost/trace/budget).
- [ ] 4.2 Screens: Work Board live (WorkItem states), Notice Board (notices), approvals
      (`Approval required: <action> <diff/scope/cost/expiry>` + approve/deny), `event tail`, `trace show --tree`.
- [ ] 4.3 Keybinds + command palette + Tab build/plan + JSON mode (machine-readable).
- [ ] 4.4 `apt-5 tui --snapshot` screenshot tests.
- Gate: theme juu ya components zilizopo — **hakuna rewrite ya TUI engine**.

## 5. Streaming → 765 events (siku 6-8)
Kutoka STREAMING.md (APT-5 mapping: Codex notification / Claude hook → bus).
- [ ] 5.1 `apt5/streaming/bus.ts`: `StreamEvent{type,data,ui,icon,hidden}`.
- [ ] 5.2 `renderer.ts` (UI pekee) + `openrouter.ts` (SSE `chat/completions stream:true` → `model.stream.chunk`).
- [ ] 5.3 Bridges: Codex App-Server notifications + Claude hooks → katalogi APT-5 (50 groups).
- [ ] 5.4 Normalize: domain vs telemetry vs audit; version schemas; redact secrets; CloudEvents-compatible envelope
      (`specversion,type,source,id,time,subject,tenant/run/task/agent/attempt/trace/causation/idempotency`).
- [ ] 5.5 Safe streaming: activity deltas, kamwe chain-of-thought private.
- Gate: live chunks + sample ya events 1..765 + `staris-agency-5/STREAMING.md` kama taxonomy reference (sio subsystems 765).

## 6. Civilization kama extensions (siku 9-16, layer kwa layer — sio core rewrite)
Kila layer: schema + state machine + events + policy boundary + service interface + tests. Hakuna direct DB mutation cross-layer.
- [ ] 6.1 Constitution/Policy: root + `authorize(agent,action,policy,approval)`; model output ≠ permission.
- [ ] 6.2 Work Board: WorkItem durable WORK-771 (acceptance/budget/deadline/policy/idempotency/artifacts),
      `CREATED→QUEUED→LEASED→RUNNING→VERIFYING→COMPLETED` (+BLOCKED/RETRY/CANCELLED/FAILED/RECOVERING),
      Task/Run/Attempt split, lease+heartbeat+fencing, partitioned queues + backpressure + reconciler.
- [ ] 6.3 A2A: typed envelope MSG-8831 (sender/receiver/capability/correlation/causation/expiry/auth/payload) + ACK/NACK.
- [ ] 6.4 Notice Board N-1042 (Draft→Review→Authorize→Publish→Expire/Archive) + emergency fast path + post-review.
- [ ] 6.5 Onboarding Chat → structured intent → WorkItems + approvals (HIGH risk → research/code/test/security + 50k STC).
- [ ] 6.6 Roles 5 (researcher/coder/tester/reviewer/coordinator, budgets) + `elect_manager`.
- [ ] 6.7 Memory OS 6 domains + CollectiveMemory (provenance/confidence/retention) + Claims lifecycle
      (contradictions linked, evidence grades) + Reputation (signal tu, sio permission).
- [ ] 6.8 Economy: Ledger source of record, Budget.spend/earn, Treasury, tax versioned, escrow→settlement, idempotency.
- [ ] 6.9 Lifecycle: `REGISTERED→PROBATION→ACTIVE→DORMANT→SUSPENDED→RETIRED→REBIRTH_PENDING→REBORN`;
      retirement huhifadhi history, rebirth revalidates (secrets hazirithiwi).
- [ ] 6.10 Governance/Justice: elections (eligibility/quorum/Sybil/delegation/audit), Court complaint→appeal, sanctions proportional.
- [ ] 6.11 Registry 10k (metadata lazy load + capability index) + Factory (reuse→generate→validate→evaluate→canary→promote/rollback).
- [ ] 6.12 Evolution: digital twin → adversarial → canary → rollback + firewall (agent hajipe permission).
- Gate kila layer: schema tests + illegal-transition rejection (Appendix D) + CLI projection (`work inspect`, `event tail`, `trace show`).

## 7. Testing + acceptance (siku 17-20)
- [ ] 7.1 Unit/contract/integration/property/simulation/adversarial (injection/abuse/Sybil/collusion/exfil)/chaos
      (worker crash, duplicate, queue delay, model timeout, DB failover, stream lag)/governance/eval.
- [ ] 7.2 24 scenarios lab (payment API, outage, election, retirement/rebirth, misinformation, treasury crisis, worker storm…).
- [ ] 7.3 100 engineering questions (v6.1 App C) kama traceability checklist.
- [ ] 7.4 Acceptance za v7: kila layer na purpose/objects/state/examples/failure; kila event na CLI projection;
      kila high-impact na auth+audit; kila WorkItem inspectable+recoverable; kila claim na provenance;
      kila evolution na rollback; scale vs concurrency kutenganishwa; cost/scale kama measured targets.
- [ ] 7.5 `apt-5 doctor` green + `git log -p | grep -E "sk-or|OPENROUTER_API_KEY=.+"` tupu (hakuna key).
- Gate: coverage ya critical paths + regression suite green.

## 8. Release + key rotation (siku 21)
- [ ] 8.1 Docs + install one-liner + migration guide kutoka opencode.
- [ ] 8.2 Tag `apt-5-v1.0.0` + release notes (fork attribution + changes).
- [ ] 8.3 **Security: REVOKE key ya test mara tu baada ya verification** (tayari ime-expose hapa chat),
      weka mpya kwenye env/CI secrets pekee. Mimi sitahifadhi key kwenye disk/repo.
- [ ] 8.4 Upstream sync plan (monthly) + roadmap Layers 03-18 zilizobaki.
- Gate: install safi kwenye mashine mpya + `apt-5 run` na key mpya.

## 9. Kanuni za kazi repo hii
1. `upstream/` ni read-only — kazi yote kwenye `apt5/`.
2. Kila commit ndogo + message wazi; kila PR na tests.
3. Hakuna secrets kwenye git — `.env` + API keys kwenye env/CI pekee.
4. Kila transition na actor/policy/timestamp/evidence/audit.
5. Tenant-aware kila mahali; control plane inalindwa dhidi ya storms.
