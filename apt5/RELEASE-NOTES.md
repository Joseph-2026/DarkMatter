# Release Notes — apt-5-v1.0.0 (draft)

**Date:** 2026-09-23 — **main:** `ca2e7562520033e2a6bd70349b8c0c2420a02043` (PR #6 merge) — repo `Joseph-2026/DarkMatter`
Verified via `git log --oneline -15`, `gh pr list`, `gh pr view`, `gh run list`, `gh pr checks` on 2026-09-23.

## Shipped (per merged PR)

- **PR #1 — Rebrand v1** — merge `c5537e15b3cf14f3701767de1bb0d0e89280a1f1` (merged 2026-09-22T16:45:06Z, head `b5023fe96a97bfaeea69a1fdb9002df2faef8e74`). CI main push run `35756184618`: success, 2m57s. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35756184618
- **PR #2 — civilization layers round 1** — merge `4e1ff5c5e0dee1870adb692781fd21de89a9b168` (merged 2026-09-23T04:12:17Z, head `f49bdc71bee7f38231b02f582069cb7850c1fcb5`). CI main push run `35817381808`: success, 3m15s. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35817381808
- **PR #3 — free router** — merge `2ece9304658466288a5ee4fb34366b3b02b5821f` (merged 2026-09-23T04:50:31Z, head `211717acee7d460f51e91343be99aa264b61f679`). CI main push run `35819970733`: success, 2m19s. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35819970733
- **PR #4 — agent onboarding docs** — merge `c89e5d26b5bdb2f1fdebef300446160828e140ce` (merged 2026-09-23T06:51:19Z, head `dac69c83d9e0dedae6156a2a1eba92984f40615f`). CI main push run `35828725759`: success, 2m57s. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35828725759
- **PR #5 — instance httpapi, civilization domains** — merge `3c27b9654c23efde3b2f800d860c4c8e26d0778f` (merged 2026-09-23T07:26:30Z, head `84cb7536adb935005234cd5357c2e163350f5eaf`). CI main push run `35831724056`: success, 3m12s. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35831724056
- **PR #6 — protocol groups + server handlers + client regen** — merge `ca2e7562520033e2a6bd70349b8c0c2420a02043` (merged 2026-09-23T11:22:52Z, head `474bbfd901714274ddace40a20fd2d95dae9eb82`). Branch checks run `35853373939`: build-and-check pass (3m17s), secrets-guard pass (7s), smoke pass (49s). Main push run `35854198174`: success, 3m1s. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35854198174

## Pending (open PRs)

- **PR #7 — `feat(collab): phase010203 agent team + root agents guide`** — branch `agent-team` → `main`, head `d3f72c1a77d0f8b7979c8e5e64e1ac110ecad1fb`, opened 2026-09-23T11:24:12Z. URL: https://github.com/Joseph-2026/DarkMatter/pull/7
  - CI run `35854780284`: **pending** (`in_progress`, pull_request, 2026-09-23T11:29:00Z). `gh pr checks 7`: secrets-guard pass, build-and-check pending, smoke pending. URL: https://github.com/Joseph-2026/DarkMatter/actions/runs/35854780284
  - Prior run on same branch `35854330590`: success, 3m20s (superseded by new push).

## Blocked

- **Vendor round:** `upstream/packages/app/vendor/apt5-client-1.17.13-apt5.0.tgz` still pinned (verified via `ls upstream/packages/app/vendor/`). New protocol endpoints (PR #6) are not in the tarball; rebuild + app verification is a separate round — no PR open for it.
- **TUI surfaces:** WorkBoard kanban / Memory list / Ledger summary in `upstream/packages/{tui,ui,web,app,desktop}` — no open PR (only open PR is #7, collab docs). Consumes `API-FOR-TUI.md` + PR #5/#6 contracts.

## Next (release apt-5-v1.0.0 criteria)

1. Merge PR #7 only after run `35854780284` (or successor) concludes success.
2. Open + land vendor-round PR (rebuild tarball, app verification) — CI success required.
3. Open + land TUI/docs PR(s) against PR #5/#6 contracts — CI success required.
4. Tag `apt-5-v1.0.0` on a green `main` (push-run success).
