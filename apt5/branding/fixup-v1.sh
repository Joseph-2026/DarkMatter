#!/usr/bin/env bash
# APT-5 branding fixup v1 — repairs semantic positions blanket rules must not change.
# - Provider/config/API identifiers stay "opencode" (wire + user-config compat).
# - Theme default stays "opencode" until the DarkMatter theme file lands (TUI phase).
# - Package identity: name apt-5, bins apt-5 + darkmatter, workspace deps apt-5.
# Idempotent. Ends with verification gates (exit 1 on violation).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
T="$ROOT/upstream"
P() { SEARCH="$2" REPLACE="$3" perl -pi -e 's/\Q$ENV{SEARCH}\E/$ENV{REPLACE}/g' "$T/$1"; }

echo "== A. provider/config identifiers -> opencode =="
P packages/opencode/src/provider/transform.ts 'providerID === "darkmatter"' 'providerID === "opencode"'
P packages/opencode/src/provider/transform.ts 'providerID.startsWith("darkmatter")' 'providerID.startsWith("opencode")'
P packages/opencode/src/provider/provider.ts 'provider?.["darkmatter"]' 'provider?.["opencode"]'
P packages/opencode/src/provider/provider.ts 'providerID.startsWith("darkmatter")' 'providerID.startsWith("opencode")'
P packages/opencode/src/cli/cmd/run/footer.command.tsx 'providerID !== "darkmatter"' 'providerID !== "opencode"'
P packages/opencode/src/cli/cmd/models.ts 'startsWith("darkmatter")' 'startsWith("opencode")'
P packages/opencode/src/cli/cmd/providers.ts 'provider === "darkmatter"' 'provider === "opencode"'
P packages/opencode/src/acp/service.ts 'ID.make("darkmatter")' 'ID.make("opencode")'
P packages/opencode/src/server/routes/instance/httpapi/api.ts 'HttpApi.make("darkmatter")' 'HttpApi.make("opencode")'
P specs/v2/provider-model.md 'schema.make("darkmatter")' 'schema.make("opencode")'

echo "== B. theme default -> opencode (until darkmatter theme lands) =="
P packages/tui/src/context/theme.tsx '"darkmatter"' '"opencode"'

echo "== C. package identity =="
P packages/opencode/package.json '"darkmatter": "./bin/opencode"' '"apt-5": "./bin/apt-5", "darkmatter": "./bin/apt-5"'
P packages/web/package.json '"darkmatter": "workspace:*"' '"apt-5": "workspace:*"'

echo "== VERIFY (must all be 0) =="
fail=0
chk() { n=$(grep -rnF "$2" --exclude-dir=node_modules "$T/$1" 2>/dev/null | wc -l || true); echo "$1 :: $2 -> $n"; [ "$n" = "0" ] || fail=1; }
chk packages/opencode/src/provider/transform.ts 'providerID === "darkmatter"'
chk packages/opencode/src/provider/transform.ts 'providerID.startsWith("darkmatter")'
chk packages/opencode/src/provider/provider.ts 'provider?.["darkmatter"]'
chk packages/opencode/src/cli/cmd/run/footer.command.tsx 'providerID !== "darkmatter"'
chk packages/opencode/src/cli/cmd/models.ts 'startsWith("darkmatter")'
chk packages/opencode/src/cli/cmd/providers.ts 'provider === "darkmatter"'
chk packages/opencode/src/acp/service.ts 'ID.make("darkmatter")'
chk packages/opencode/src/server/routes/instance/httpapi/api.ts 'HttpApi.make("darkmatter")'
chk packages/tui/src/context/theme.tsx '"darkmatter"'
chk packages/opencode/package.json '"darkmatter": "workspace'
chk packages/web/package.json '"darkmatter": "workspace'
chk packages/opencode/package.json './bin/opencode'
[ "$fail" = "0" ] && echo "FIXUP V1 VERIFIED" || { echo "FIXUP V1 FAILED"; exit 1; }
