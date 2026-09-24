# VIDEO SCRIPT — "The Swarm Is Alive" (5 minutes)

Total runtime target: 4:30–5:00. Terminal + TUI only. No slides.

## Shot 0 — Cold open (0:00–0:20)

Terminal. One command:

```sh
bun test test/server/swarm-showcase.test.ts
```

Say: *"This is APT-5. In the next five minutes, a swarm of agents will plan,
build, review, sign, price, and govern itself — live, on this machine."*

## Shot 1 — Birth (0:20–1:00)

`[ACT 1]` prints. Narrate: *"A swarm is born with its own board. Every swarm
gets a kanban before it gets a task — coordination before computation."*
Cut to TUI `/boards`: the board exists.

## Shot 2 — Memory (1:00–1:40)

`[ACT 2]` prints. *"The researcher leaves discoveries in persistent memory —
not RAM, not a prompt trick. SQLite, indexed, namespaced."*
TUI `/memory`: entries listed.

## Shot 3 — Identities (1:40–2:30) — THE MONEY SHOT

`[ACT 3]` + `[ACT 4]` print. *"Two agents enroll with cryptographic identities.
The coder announces signed work — ed25519, verified on delivery."*
Then `[ACT 5]`: *"And here is a forged message dying at the gate: 401.
In our competitors' demos, that forgery would have succeeded silently."*
Pause. Let it land.

## Shot 4 — Money + Law (2:30–3:30)

`[ACT 6]` prints. *"Governance decides with a mandatory audit row. The ledger
prices every token — this entire demo cost a fraction of a cent on the free
tier, and the system proves it."* Show ledger summary + TUI cost footer.

## Shot 5 — Scale (3:30–4:20)

Quick cuts: `sdks/` — *"Twenty languages. Python, Go, Rust, Java, C#… every
enterprise stack calls the same civilization API."* Show CI matrix green.
*"And this demo? It runs green in CI on every commit. The show cannot rot."*

## Shot 6 — Close (4:20–4:50)

`[ACT 7]` prints. Look at camera: *"Models are rented. Civilization is owned.
APT-5 is open — come build the rest with us, or come acquire it before someone
else does."* End card: repo URL + release tag.
