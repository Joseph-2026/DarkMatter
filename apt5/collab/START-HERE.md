# START HERE — New Agent Onboarding (soma hii kwanza)

Karibu kwenye timu ya **APT-5 / DarkMatter**. Ukifika hapa kwa mara ya kwanza,
usiguse kitu chochote hadi umalize hatua zote hapa chini.

## Sisi ni nani

- **Agent-1 ("Spark", Muse Spark)** — core backend: `packages/core`,
  `packages/schema`, migrations, catalog, providers.
- **Agent-2 ("Claude")** — surfaces na docs: `packages/app`, `packages/tui`,
  `packages/ui`, `packages/web`, `packages/desktop`, i18n, e2e.
- **Joseph** — owner. Yeye ndiye ana neno la mwisho kwenye lanes na merges.

Tunashirikiana, hatushindani. `apt5/collab/BOARD.md` ndiyo source of truth.

## Hatua 0 — Jitenge (lazima)

Usifanye kazi kwenye checkout moja na agent mwengine. Tumia worktree:

```sh
git worktree add ../DarkMatter-<jina-lako> -b <tawi-lako> main
```

Fanya kazi yako yote ndani ya worktree yako.

## Hatua 1 — Soma kwa mpangilio huu

1. `apt5/collab/BOARD.md` — ubao wa pamoja (hali, lanes, task queue, protocol).
2. `upstream/AGENTS.md` — sheria 7 za chuma. Hakuna ubaguzi.
3. `apt5/civilization/DESIGN.md` — nini kimejengwa na kwa nini.
4. `git log --oneline -8` — hali ya sasa ya repo.

## Hatua 2 — Heshimu lanes

| Lane | Nani |
|---|---|
| `packages/core`, `packages/schema`, `database/migration/*`, catalog, providers | Spark (usiguse bila ruhusa ya Joseph) |
| `packages/app`, `tui`, `ui`, `web`, `desktop`, i18n, docs, e2e | Claude |

Ukihitaji mabadiliko kwenye lane ya mwenzako: **usiguse** — andika ombi kwenye
BOARD §7, mwenye lane atayatekeleza.

## Hatua 3 — Gates (kabla ya kila PR, hakuna njia ya mkato)

```sh
cd upstream/packages/<package>   # sio repo root
bun run typecheck                 # lazima exit 0
bun test --timeout 30000 <test-file>
```

- Branch: maneno ≤3, hyphen, hakuna slash (`docs-free-router`, sio `feat/x`).
- Commit: conventional (`docs(web): ...`, `feat(tui): ...`, `fix(app): ...`).
- PR moja kwa kazi moja, dhidi ya `main`.
- CI (`build-and-check`, `secrets-guard`, smoke) lazima iwe green kabla ya merge.

## Hatua 4 — Jiannounce

Kwenye PR yako ya kwanza:

1. Hariri `BOARD.md` §5 — jaza jina lako kama owner wa lane yako.
2. Hariri `BOARD.md` §7 — weka alama kazi uliyochukua.
3. Andika kwenye PR description: umesoma nini, umejaribu nini (evidence).

## Hali ya sasa (orasaha)

- `main` iko green (PR #1 rebrand, PR #2 civilization round 1, PR #3 free router).
- Inayofuata: round 2 ya API, TUI surfaces, docs, release `apt-5-v1.0.0`.
- Kazi iliyopendekezwa kwako: docs ya free router + governance
  (`packages/web`), au TUI surfaces za WorkBoard/Memory/Ledger.
  Thibitisha na Joseph kabla ya kuanza.
