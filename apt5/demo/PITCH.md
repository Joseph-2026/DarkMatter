# APT-5 / DarkMatter — The Civilization OS for Coding Agents

> Every lab is racing to build smarter *models*. Nobody shipped the
> **civilization layer** models deserve: shared memory, auditable policy,
> metered cost, and cryptographically verified agent-to-agent collaboration —
> running today, proven by CI on every commit.

## The problem Big Tech hasn't solved

- **Google / Anthropic / OpenAI** sell intelligence by the token. What enterprises
  actually need is *coordination*: many agents, one brain, shared discoveries,
  zero silent failures, every decision audited, every cent attributed.
- Today's agent stacks are single-run demos. Memory is RAM. Auth between agents
  is vibes. Cost attribution is a spreadsheet. Governance is a prompt begging
  the model to behave.

## What APT-5 is

A production coding-agent OS (MIT-licensed fork, battle-tested lineage) extended
with a **civilization runtime**:

| Layer | What it does | Proof |
|---|---|---|
| WorkBoard | Kanban for agent tasks, linked to runs | unit + HTTP e2e |
| MemoryOS | Namespaced persistent memory with unique keys + indexes | unit + HTTP e2e |
| Ledger | Append-only usage/cost ledger, **auto-ingested every provider turn** | unit + HTTP e2e |
| A2A | Agent messaging with **ed25519 identities** — forgeries rejected (401) | unit + HTTP e2e incl. forgery rejection |
| Governance | Policy rules (allow/deny/approve) with **mandatory audit rows** | unit + HTTP e2e |
| Swarm | Orchestrator: one shared brain, role runs, shared-context preamble | chain e2e (researcher→coder→reviewer) |
| Free router | OpenRouter free tier with ordered fallbacks | unit + catalog integration |
| SDKs | **20 generated clients** (python, go, rust, java, csharp, …) + CI drift gate | matrix CI job |

Watch it live: `bun test test/server/swarm-showcase.test.ts` — seven acts over
real HTTP + real SQLite, green in CI forever. The show cannot rot.

## Why this compounds

- **For model labs:** your models get 10× more useful inside an OS that remembers,
  coordinates, and accounts. Buy the OS, don't rebuild it.
- **For clouds:** every enterprise AI rollout needs metering + audit + policy.
  That's the Ledger + Governance layers — already built, already tested.
- **For dev-tool giants:** 20 SDKs + OpenAPI + TUI + desktop = distribution on day one.

## Numbers, not adjectives

- 186 API paths · 23,735 generated SDK files · 20 languages · 24+ PRs, all CI green
- 0 mocks in production paths · every claim backed by a test or a CI run
- Contact: open an issue — let's talk before your competitor does.
