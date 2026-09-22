# Hardware profile & policy (kusoma kila mara kabla ya kazi nzito)

## Mashine ya dev (2026-09-22 readings)
- Lenovo N22, RAM 3.7Gi total, free ~1.4–1.9Gi, swap 3.8Gi (tumika ~1.7Gi = pressure)
- CPU 2 cores, load ilionekana 18+ wakati wa `bun test` full — **usirudie locally**
- Disk 161G, free ~53G (sawa)
- Background processes za kuzingatia: MCP servers (~40MB kila moja), Xorg/XFCE, huenda `opencode` ya mtumiaji (~650MB)

## Sera (lazima)
1. **Kazi nzito zote kwenye GitHub Actions** (runners 16GB): `bun install`, `typecheck` (turbo),
   full `bun test`, builds, snapshot imports. Local: edit + `git` + scoped checks pekee.
2. Kabla ya command nzito yoyote locally: `free -h` + `uptime`. Kama available < 1Gi au load > 6 → **simama**, hamishia CI.
3. Usianzishe processes kubwa sambamba (bun install + tests + TUI). Moja kwa wakati.
4. Usihifadhi duplicates kubwa: `/tmp` safishwa baada ya matumizi (`/tmp/opencode-upstream` 221MB ilifutwa).
5. `node_modules` (2.5GB) inabaki local-only — imegitignore, haipushwi.

## Product: APT-5 lazima ikimbie vizuri kwenye 4GB RAM (bila kupunguza uwezo)
- Lazy loading: registry 10k+ ni metadata records, sio processes; AgentSpec inaload kwa mahitaji.
- Bounded concurrency: worker pools + quotas + leases (tayari kwenye civilization design) — sio threads zisizo na kikomo.
- Streaming, sio buffering: SSE chunks → renderer moja kwa moja; compaction kama checkpoint.
- Storage: SQLite local + retention policies; event retention na trace store zina mipaka ya ukubwa.
- Single binary, hakuna Electron-heavy extras kwa CLI path.
- CI lazima ijumuishe `memory-budget` check siku zijazo (RSS ya `apt-5 run` kwenye task ya sampuli < 500MB).
