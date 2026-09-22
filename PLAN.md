# DarkMatter — APT-5 PLAN NZIMA

## 0. Vision
DarkMatter = opencode (MIT fork) + rebrand APT-5 + STARIS Civilization (Layers 03-18) + TUI kisasa.
Repo: https://github.com/Joseph-2026/DarkMatter
Specs: https://github.com/Joseph-2026/staris-agency-5 (agent-cv-2: civilaization 1229 lines, STREAMING 765 events, PDFs 106 pages, demo.png)

Brand: **APT-5**. Coding agent: **APT-5 Agent**. UI language: **English only** (kama Claude Code).
Key za majaribio via `OPENROUTER_API_KEY` env (usiweke key kwenye repo).

## 1. Sheria (non-negotiable)
- MIT: `LICENSE` ya anomalyco/opencode inabaki + copyright yao + yetu juu. Fork inaonyesha upstream.
- Contracts before complexity. Model output ≠ authorization.
- Kila high-impact: IDENTITY→AUTHORITY→POLICY→APPROVAL→LEASE→EXECUTION→VERIFICATION→EVIDENCE→AUDIT→RECONCILIATION.
- 10k+ = registered definitions lazy-loaded, sio simultaneous calls. Correctness = measured.

## 2. Structure target ya repo
```
DarkMatter/
  upstream/                # fork snapshot ya anomalyco/opencode@dev (read-only, synced)
  apt5/                    # rebrand + civilization extensions (yetu)
    branding/              # package name apt-5, binary, install, docs, themes
    tui/                   # DarkMatter modern TUI theme + layout + screens
    streaming/             # bus.py, renderer.py, openrouter.py, bridges (Codex/Claude)
    civilization/          # layers 03-18: law, governance, economy, labor, property,
                           # knowledge, education, culture, media, diplomacy, justice,
                           # lifecycle, security, memory, orchestration, evolution
    workboard/ noticeboard/ a2a/ onboarding/
    memory/ economy/ governance/
    registry/ factory/
  tests/ (unit/contract/integration/eval/load/security/chaos/governance)
  docs/ PLAN.md README.md
```

## 3. Phases (nzima)

### PHASE A — Fork clean (siku 1)
- [ ] A1 Fork anomalyco/opencode@dev → snapshot kwenye `upstream/` (git subtree au fork network). Record commit SHA.
- [ ] A2 `bun install` + `bun test` upstream inafanya kazi locally (baseline).
- [ ] A3 LICENSE + NOTICE: attribution file `CREDITS.md`.
- [ ] Gate: baseline green kabla ya kugusa chochote.

### PHASE B — Rebrand APT-5 non-breaking (siku 2-3)
- [ ] B1 `package.json`: name `apt-5`, bin `apt-5`, kisha alias `darkmatter`.
- [ ] B2 Install script + docs + `--version` inaonyesha APT-5.
- [ ] B3 Config dir `~/.apt5`, env `APT5_*`, migrate kutoka opencode bila kufuta user data.
- [ ] B4 Smoke: `apt-5 --help`, `apt-5 run "hello"`, tests za upstream bado pass.
- [ ] Gate: hakuna breaking change kwenye engine API.

### PHASE C — TUI kisasa DarkMatter (siku 4-6)
- [ ] C1 Theme mpya: dark neon (kama demo.png Claude Code v2.0.0) + light minimal option.
- [ ] C2 Layout: header (APT-5 + model + dir), prompt area, live pane (diff/tests), footer status (cost/trace/budget).
- [ ] C3 Screens: Work Board live, Notice Board, approvals (`Approval required: ... diff/scope/cost/expiry`), event tail, trace tree.
- [ ] C4 Keybinds + command palette + JSON mode (machine-readable bila UI text).
- [ ] Gate: screenshots + `apt-5 tui --snapshot` test.

### PHASE D — Streaming 765 events (siku 7-9)
- [ ] D1 `apt5/streaming/bus.py`: `StreamEvent(type,data,ui,icon,hidden)` — kila Codex notification / Claude hook inaingia hapa.
- [ ] D2 `renderer.py`: hutumia UI pekee. `openrouter.py`: OpenRouter SSE `chat/completions stream:true` → `model.stream.chunk` deltas.
- [ ] D3 Bridges: `CodexBridge`, `ClaudeBridge` → katalogi ya APT-5 (50 groups).
- [ ] D4 Normalize taxonomy: domain vs telemetry vs audit; version schemas; redact secrets.
- [ ] D5 Models verified: primary `nex-agi/nex-n2.5-mini:free` → `nvidia/nemotron-3-ultra` → `liquid/lfm-2.5` → `cohere/north-mini-code`, 429/403 auto-skip, FREE_CATALOG 21.
- [ ] Gate: `model.stream.chunk` live + event 1..765 sample test.

### PHASE E — Model + Tool Gateway + Security (siku 10-12)
- [ ] E1 Tool Gateway: schema→identity→capability→approval→limits→sandbox→validate→audit.
- [ ] E2 Builtins: file/code/test/web + permission matrix per role.
- [ ] E3 SandboxExecutor abstraction (OS/container, sio subprocess param).
- [ ] E4 Durable approvals + revalidate on resume. Threats: injection/abuse/exfil/Sybil/collusion/exhaustion/supply-chain.
- [ ] Gate: policy tests + sandbox escape tests pass.

### PHASE F — Civilization core: Work/Notice/A2A/Onboarding (siku 13-16)
- [ ] F1 Work Board: WorkItem durable WORK-771 (objective/owner/acceptance/deps/budget/deadline/policy/idempotency/artifacts/status), machine CREATED→...→COMPLETED, lease+heartbeat+fencing.
- [ ] F2 Task/Run/Attempt split + reconciler + partitioned queues + backpressure.
- [ ] F3 Notice Board NOTICE N-1042 (Draft→Review→Authorize→Publish→Expire/Archive), emergency fast path + post-review.
- [ ] F4 A2A MSG-8831 typed envelopes + ACK/NACK + replay/expiry/rate limits.
- [ ] F5 Onboarding Chat → intent → WorkItems + approvals (risk HIGH → research/code/test/security + 50k STC).
- [ ] F6 Roles 5: researcher/coder/tester/reviewer/coordinator + elect_manager.
- [ ] Gate: `API ya malipo` end-to-end (research→code→test→review→artifact+audit).

### PHASE G — Memory/Economy/Governance/Justice (siku 17-20)
- [ ] G1 Memory OS 6 domains + CollectiveMemory + Claim lifecycle + contradictions linked + evidence grades.
- [ ] G2 Reputation gold/silver/bronze/probation = signal tu. Budget.spend/earn + Ledger + Treasury + escrow.
- [ ] G3 Lifecycle REGISTERED→...→REBORN, retirement preserves history, rebirth revalidates (secrets hazirithiwi).
- [ ] G4 Elections/councils + Court complaint→appeal + sanctions proportional.
- [ ] Gate: treasury crisis + election + retirement/rebirth scenarios pass.

### PHASE H — Registry 10k + Factory + Evolution (siku 21-24)
- [ ] H1 Registry metadata + lazy load + capability index. Factory pipeline → canary → promote/rollback.
- [ ] H2 Digital twin + adversarial + canary + evolution firewall.
- [ ] H3 24 scenarios lab + 100 engineering questions checklist.
- [ ] Gate: registry 10k load test (metadata, sio live calls) + scheduler stress.

### PHASE I — Hardening + Release (siku 25-28)
- [ ] I1 Tests zote: unit/contract/integration/property/simulation/adversarial/chaos/governance/eval.
- [ ] I2 Metrics + acceptance gates za v7 (kila layer/event/action/WorkItem/claim/evolution).
- [ ] I3 Docs + install one-liner `curl ... darkmatter/install | bash` + desktop/IDE notes.
- [ ] I4 Tag `apt-5-v1.0.0`, release notes, upstream sync plan (monthly).
- [ ] Gate: `staris doctor` style `apt-5 doctor` green + demo video.

## 4. Risks → Mitigation
- Upstream drift (opencode dev hubadilika haraka) → `upstream/` pinned SHA + monthly sync branch.
- TUI rewrite kuvunja → theme/layout juu ya components, sio rewrite; snapshot tests.
- Event explosion 765 → normalize, sio subsystems 765; telemetry ≠ domain.
- Cost/latency → budgets, quotas, fallback models, backpressure, canary.
- Security → least privilege, tenant-aware, audit immutable, human approvals.

## 5. Nini nataka kutoka kwako kabla ya build
1. `anza BUILD PHASE A+B` (fork + rebrand salama) — au unataka phases zote kwa mpigo?
2. TUI style: dark neon (demo.png) kama default? 
3. Binary: `apt-5` primary + `darkmatter` alias — sawa?
