#!/usr/bin/env bash
# APT-5 identifier completion codemod — completes partial camelCase/PascalCase renames
# left behind by substring rules (e.g. `.opencodeComment` -> `.apt5Comment` while the
# declaration `opencodeComment` stayed). Completes the rename so declarations match.
# Usage: codemod-identifiers.sh <scope-dir>   (e.g. upstream/packages/app)
# Idempotent. Ends with residual check (exit 1 if any remain, minus allowlist).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCOPE="${1:?usage: codemod-identifiers.sh <scope-dir>}"
cd "$ROOT"

# camelCase: opencodeXxx -> apt5Xxx (word boundary before 'o' OR start; handles x.opencodeX too)
grep -rlE "(^|[^A-Za-z0-9_])opencode[A-Z]" --exclude-dir=node_modules --exclude-dir=.git "$SCOPE" 2>/dev/null \
  | while read -r f; do perl -pi -e 's/(^|[^A-Za-z0-9_])opencode([A-Z])/$1apt5$2/g' "$f"; echo "camel: $f"; done
# PascalCase / mid-word Capitals: OpencodeXxx -> Apt5Xxx (WslOpencodeCheck -> WslApt5Check)
grep -rlE "Opencode[A-Z]" --exclude-dir=node_modules --exclude-dir=.git "$SCOPE" 2>/dev/null \
  | while read -r f; do perl -pi -e 's/Opencode([A-Z])/Apt5$1/g' "$f"; echo "pascal: $f"; done

echo "== VERIFY residuals in $SCOPE (must be 0) =="
n1=$(grep -rE "(^|[^A-Za-z0-9_])opencode[A-Z]" --exclude-dir=node_modules --exclude-dir=.git "$SCOPE" 2>/dev/null | wc -l || true)
n2=$(grep -rE "Opencode[A-Z]" --exclude-dir=node_modules --exclude-dir=.git "$SCOPE" 2>/dev/null | wc -l || true)
echo "camel residuals=$n1 pascal residuals=$n2"
[ "$n1" = "0" ] && [ "$n2" = "0" ] && echo "IDENTIFIERS COMPLETE" || { echo "IDENTIFIERS REMAIN"; exit 1; }
