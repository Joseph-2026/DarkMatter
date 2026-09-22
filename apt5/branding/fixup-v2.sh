#!/usr/bin/env bash
# APT-5 branding fixup v2 — provider/integration/API-namespace IDs stay "opencode".
# Rationale (wire compat): these IDs live in user configs, stored sessions, API
# payloads and the provider catalog type. Renaming them breaks compat without benefit.
# Rebrand-legit strings (auth username, user-agent, tmp/state paths, X-Title, config
# dirs) are NOT touched here. Idempotent. Ends with verification gates.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
T="$ROOT/upstream"
P() { SEARCH="$2" REPLACE="$3" perl -pi -e 's/\Q$ENV{SEARCH}\E/$ENV{REPLACE}/g' "$T/$1"; }
# NOTE: P uses fixed-string replace via perl \Q...\E.

echo "== A. src: provider plugin identity back to opencode =="
P packages/core/src/plugin/provider/opencode.ts 'integrationID: Integration.ID.make("darkmatter")' 'integrationID: Integration.ID.make("opencode")'
P packages/core/src/plugin/provider/opencode.ts 'id: "darkmatter"' 'id: "opencode"'

echo "== B. src+test: ProviderV2.ID.apt5 -> .opencode =="
grep -rl "ProviderV2.ID.apt5" --exclude-dir=node_modules "$T" 2>/dev/null | while read -r f; do
  SEARCH="ProviderV2.ID.apt5" REPLACE="ProviderV2.ID.opencode" perl -pi -e 's/\Q$ENV{SEARCH}\E/$ENV{REPLACE}/g' "$f"; echo "idfix: $f"; done

echo "== C. tests: API namespace + integration IDs back to opencode =="
P packages/codemode/test/openapi.test.ts 'tools.apt5.' 'tools.opencode.'
P packages/codemode/test/openapi.test.ts 'namespace: "darkmatter"' 'namespace: "opencode"'
P packages/core/test/plugin/provider-opencode.test.ts 'Integration.ID.make("darkmatter")' 'Integration.ID.make("opencode")'
P packages/core/test/plugin/provider-opencode.test.ts 'integrationID: "darkmatter"' 'integrationID: "opencode"'

echo "== D. story fixture id =="
P packages/app/src/components/dialog-select-model-unpaid-v2.stories.tsx 'provider: { id: "darkmatter"' 'provider: { id: "opencode"'

echo "== VERIFY (must all be 0) =="
fail=0
chk0() { n=$(grep -rnF "$1" --exclude-dir=node_modules "$T/$2" 2>/dev/null | wc -l || true); echo "$2 :: [$1] -> $n"; [ "$n" = "0" ] || fail=1; }
chk0 "ProviderV2.ID.apt5" "upstream"
chk0 "tools.apt5." "upstream/packages/codemode/test"
chk0 'Integration.ID.make("darkmatter")' "upstream/packages/core/src/plugin/provider/opencode.ts"
chk0 'Integration.ID.make("darkmatter")' "upstream/packages/core/test/plugin/provider-opencode.test.ts"
chk0 'id: "darkmatter"' "upstream/packages/core/src/plugin/provider/opencode.ts"
[ "$fail" = "0" ] && echo "FIXUP V2 VERIFIED" || { echo "FIXUP V2 FAILED"; exit 1; }
