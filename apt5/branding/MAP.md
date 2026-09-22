# Branding map: opencode → APT-5 / DarkMatter

## Ushahidi wa ukubwa (2026-09-22, upstream@fe3f3a4)
- Files 2826 zina `opencode` (case-insensitive, bila node_modules/.git/bun.lock)
- Files 1385 zina scope `@opencode-ai`
- Packages 30 kwenye `upstream/packages/`

## Dry-run ya apply.sh (2026-09-22, --dry-run, excludes: node_modules/.git/*.lock/CHANGELOG*/LICENSE/CREDITS)
- scope `@opencode-ai/` → 1382 files
- configdir `.opencode` → 379 files
- flagprefix `OPENCODE_` → 473 files
- flagprefix-lower `opencode_config` → 0 files
- macdomain `ai.opencode.managed` → 3 files
- urls `opencode.ai` → 714 files
- tuiclient `"name": "opencode"` → 4 files
- theme-default `"opencode"` → 343 files
- Jumla hits 3298 (file moja inaweza kuguswa na rules nyingi)

## Touchpoints kamili (zilizothibitishwa kwa grep)
| # | Eneo | Mfano halisi | Tafsiri |
|---|------|---------------|---------|
| 1 | npm scope | `@opencode-ai/core` (package.json 30x + imports 1385 files) | → `@apt5/*` |
| 2 | Binary | `packages/opencode/bin/opencode`, `"opencode": "./bin/opencode"` | → `bin/apt-5` (+ alias `darkmatter`) |
| 3 | Config dir | `.opencode` (config.ts:439, paths.ts:29,35, tui.ts:171) | → `.apt5` |
| 4 | Flags/env | `Flag.OPENCODE_CONFIG_DIR`, `OPENCODE_DISABLE_TERMINAL_TITLE`, `OPENCODE_*` | → `APT5_*` |
| 5 | URLs | `opencode.ai` (docs, auth, server routes) | → `github.com/Joseph-2026/DarkMatter` (halisi, hakuna domain za kubuni) |
| 6 | TUI identity | `clientInfo: { name: "opencode" }` (tui/context/editor.ts:228) | → `"apt-5"` |
| 7 | Default theme | `"opencode"` (tui/context/theme.tsx 6x) | → `"darkmatter"` (theme mpya inakuja) |
| 8 | macOS domain | `ai.opencode.managed` (config/managed.ts:8) | → `dev.apt5.managed` |
| 9 | Product strings | `"opencode"` UI text, help, errors | → `apt-5` / `APT-5` (kwa context) |

## Nje ya scope v1 (kwa uaminifu)
- `bun.lock` + checksums: haziguswi (kuvunja install). Scope rename itashughulikiwa na `bun install --frozen-lockfile` mpya kwenye CI.
- `CHANGELOG*`: historia inabaki kama ilivyo (ukweli wa kihistoria).
- `LICENSE`/`CREDITS.md`: attribution inabaki (lazima la MIT).
- Tests/fixtures zenye strings za makusudi (e.g. redaction tests): zinabaki, zinathibitisha redaction inafanya kazi.

## Utaratibu wa apply
1. `apply.sh --dry-run` → orodha + hesabu (kama hapo juu, lazima ilingane)
2. `apply.sh --apply` → inabadilisha + log kwenye `apt5/branding/APPLIED.log`
3. CI: install + lint + typecheck + targeted tests — green ndio hatua inayofuata
