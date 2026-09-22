# OpenResearch method (imewekwa kwenye mfumo wa kazi)

## Chanzo
- `alphaXiv/OpenResearch` — "Turn your coding agents into research agents" (MIT, 5.5k stars).
- Sio plugin ya opencode. Ni **Rust CLI (`orx`) + skills 12 za agent** (`SKILL.md` + `agent-skills/`):
  orx-agent-delegation, orx-compute, orx-create, orx-customize, orx-evidence,
  orx-experiment-tree, orx-figures, orx-git, orx-instances, orx-lit-review, orx-paper, orx-reports.
- Attribution: wazo na maneno ya methodology ni yao (MIT); kilicho hapa ni muhtasari + ramani ya matumizi.

## Cardinal rules (zimechukuliwa kama sheria za kazi ya DarkMatter)
1. **Usihariri node ambayo run imejibu.** Commit ikishathibitishwa na CI ni frozen —
   wazo jipya = branch mpya (child), sio kuhariri history.
2. **Run command + environment ni contract fixed.** CI workflow ndio contract yetu:
   node zote zinapimwa na checks zile zile. Usibadilishe command katikati ya round.
3. **Badilisha code, sio knobs.** Variant = branch + code tofauti, sio kubadilisha CI flags.
4. **Kua chini (stacked bushes), sio kando.** Round ndogo ya options kama siblings,
   kisha descend kwenye winner. Tawi `rebrand/apt-5` ndio round ya sasa; civilization
   layers zitadescend kutoka kwake baada ya merge (winner = CI green).

## Repair cap (inatumika)
- Run 2 mfululizo zinazojibu nothing kwenye node moja → simama, uliza mtumiaji.
- Kila CI failure mpya yenye taarifa mpya = swali jipya (sio relaunch kipofu).
- Gololi ~3 za regressed/failure mfululizo → stop, ripoti, subiri uamuzi.

## Ramani kwenye STARIS layers
- orx-experiment-tree → Layer 18 Evolution & Simulation (canary, promote/rollback) + Layer 06 Labor (rounds kama WorkItems)
- orx-evidence → Layer 08 Knowledge & Science (claims + evidence + replication) + Layer 16 Memory (provenance)
- orx-agent-delegation → Layer 17 Orchestration (bounded fan-out, leases) + Layer 06 hierarchy
- orx-git (worktrees, diff, freeze) → Layer 16 Memory & History + Layer 07 Property (ownership ya artifacts)
- orx-lit-review → Layer 08 (alphaXiv/OpenAlex/bioRxiv retrieval kabla ya web search kwa maswali ya kitaaluma)
- orx-reports → Layer 16 Archive + Layer 11 Communication (Notice Board)

## Kumbuka kwa agent (mimi)
- Kila turn iliyorun au kubadilisha experiments: muhtasari mfupi — node, ilijaribu nini, status, matokeo.
- `orx` binary yenyewe haijasakinishwa hapa (mashine 4GB; CLI ya Rust ni nyepesi lakini haihitajiki sasa).
  Skills 12 kwa matumizi ya kila siku ya mtumiaji zinaweza kusakinishwa na `orx install-skills` kwenye mashine yake akitaka.
