#!/usr/bin/env bash
# Rebuilds the vendor APT-5 client tarball from the pinned upstream tarball.
# Same API surface (v1.17.13, proven compatible with the app), rebranded identifiers.
# - KEEPS: `export * as OpenCode` namespace (codegen template is source of truth),
#   `@opencode-ai/schema|protocol` imports (pinned old shapes, proven working),
#   wire values, exports map, dist layout.
# - RENAMES: OpenCodeEvent->Apt5Event, OpenCodeClient->Apt5Client (match app imports),
#   service command/state/username (behavioral rebrand), package name/version/repo.
# - ADDS: upstream LICENSE (MIT attribution inside the artifact).
# Idempotent. Ends with verification gates.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENDOR="$ROOT/upstream/packages/app/vendor"
IN_TGZ="$VENDOR/opencode-ai-client-1.17.13-v2.tgz"
OUT_NAME="apt5-client-1.17.13-apt5.0.tgz"
OUT_TGZ="$VENDOR/$OUT_NAME"
VERSION="1.17.13-apt5.0"

[ -f "$IN_TGZ" ] || { echo "missing input $IN_TGZ"; exit 1; }
work=$(mktemp -d); trap 'rm -rf "$work"' EXIT
tar xzf "$IN_TGZ" -C "$work"
P="$work/package"
R() { SEARCH="$2" REPLACE="$3" perl -pi -e 's/\Q$ENV{SEARCH}\E/$ENV{REPLACE}/g' "$P/$1"; }
G() { grep -rlF "$@" 2>/dev/null || true; }

echo "== package.json =="
R package.json '"@opencode-ai/client"' '"@apt5/client"'
R package.json '"version": "1.17.13"' '"version": "1.17.13-apt5.0"'
R package.json 'github.com/anomalyco/opencode.git' 'github.com/Joseph-2026/DarkMatter.git'
cp "$ROOT/upstream/LICENSE" "$P/LICENSE"

echo "== dist identifiers (exported names + behavioral rebrand) =="
sub() { G "$1" "$P/dist" | while read -r f; do SEARCH="$1" REPLACE="$2" perl -pi -e 's/\Q$ENV{SEARCH}\E/$ENV{REPLACE}/g' "$f"; done; }
sub "OpenCodeEvent" "Apt5Event"
sub "OpenCodeClient" "Apt5Client"
sub '["opencode", "serve", "--service"]' '["apt-5", "serve", "--service"]'
sub '"opencode", "service.json"' '"apt5", "service.json"'
sub 'username: "opencode"' 'username: "darkmatter"'

echo "== VERIFY =="
fail=0
must0() { n=$(grep -rnF "$1" "$P" 2>/dev/null | wc -l || true); echo "residual [$1] = $n"; [ "$n" = "0" ] || fail=1; }
mustHave() { n=$(grep -rnF "$1" "$P" 2>/dev/null | wc -l || true); echo "present [$1] = $n"; [ "$n" != "0" ] || fail=1; }
must0 "OpenCodeEvent"; must0 "OpenCodeClient"
must0 '["opencode", "serve"'; must0 'username: "opencode"'
must0 '"@opencode-ai/client"'
mustHave "Apt5Event"; mustHave "Apt5Client"
mustHave "export * as OpenCode"; mustHave "@opencode-ai/schema/"
mustHave '"version": "1.17.13-apt5.0"'
[ -f "$P/LICENSE" ] || { echo "LICENSE missing"; fail=1; }
[ "$fail" = "0" ] && echo "VENDOR REBUILD VERIFIED" || { echo "VENDOR REBUILD FAILED"; exit 1; }

echo "== repack =="
tar czf "$OUT_TGZ" -C "$work" package
ls -la "$OUT_TGZ"
