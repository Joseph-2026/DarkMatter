# APT-5 Client SDKs — 20 languages

Generated clients for the APT-5 civilization API (186 paths, incl. work-board,
memory, ledger, a2a, governance), produced from the live server OpenAPI with
`openapi-generator-cli` 7.14.0 (pinned).

## Layout

| Path | What | Committed? |
|---|---|---|
| `sdks/openapi.json` | Served spec snapshot (`bun dev generate` in `upstream/packages/opencode`) | yes |
| `sdks/openapi.sdk.json` | Normalized copy for strict generators (see `normalize.py`) | yes |
| `sdks/normalize.py` | Semantically-faithful normalizer (empty-schema + 3.1-nullable collapse) | yes |
| `sdks/generate.sh` | Matrix driver, all 20 languages, skips docs/tests artifacts | yes |
| `sdks/manifest.py` → `manifest.json` | Per-language proof (files, bytes, markers, verify tier) | manifest yes |
| `sdks/<lang>/` | Generated output (python, go, rust, java, csharp, ruby, php, swift5, kotlin, javascript, typescript-axios, typescript-fetch, c, elixir, scala-akka, perl, r, lua, powershell, bash) | **no** (see below) |

Generated trees are NOT committed (python alone is 18MB/3209 files; ×20 would
2–3× the repo). CI (`sdk-matrix` job) regenerates all 20 on every PR and asserts:
each language present + non-empty, civilization markers found, python compiles.
Release artifacts attach the matrix to GitHub releases.

## Regenerate

```sh
cd upstream/packages/opencode && bun dev generate > ../../../sdks/openapi.json
python3 sdks/normalize.py
GENERATOR_JAR=/path/openapi-generator-cli.jar ./sdks/generate.sh   # or subset: ./sdks/generate.sh python go
python3 sdks/manifest.py
```

## Verify tiers

- `COMPILE_OK` — generated code compiles with a local toolchain (python, php so far).
- `GEN_ONLY` — generation succeeded; no local toolchain. CI asserts presence + markers.
- `dart` is generator-blocked (openapi-generator 7.14.0 `dart`/`dart-dio` crash with
  `ClassCastException` on pre-existing `experimental` routes) — replaced by `c` in
  the matrix; fix belongs upstream or via spec-side hardening (tracked).
- `go` compiles past enums (`enumClassPrefix=true`) but hits an upstream recursive
  `SessionStatus` model (`invalid recursive type`) — recorded in manifest detail.
- The served spec (`openapi.json`) is never modified for generators — only the `.sdk.json` copy.
