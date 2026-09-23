#!/usr/bin/env bash
# Generates all 20 APT-5 client SDKs from the normalized spec.
# - Input: sdks/openapi.sdk.json (built by sdks/normalize.py from served openapi.json)
# - Output: sdks/<lang>/ (NOT committed except via manifest; CI regenerates + verifies)
# - Generator: openapi-generator-cli 7.14.0 (pinned). Needs: java + network (first run downloads nothing — jar path via $GENERATOR_JAR or /tmp/opencode/tools).
# Usage: ./sdks/generate.sh [lang...]   (default: all 20)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDKS="$ROOT/sdks"
JAR="${GENERATOR_JAR:-/tmp/opencode/tools/openapi-generator-cli.jar}"
SPEC="$SDKS/openapi.sdk.json"
export JAVA_OPTS="${JAVA_OPTS:--Xmx1G}"

LANGS=(
  python go rust java csharp ruby php swift5 kotlin javascript
  typescript-axios typescript-fetch c elixir scala-akka perl r lua powershell bash
)

[ -f "$JAR" ] || { echo "missing generator jar: $JAR (set GENERATOR_JAR)"; exit 1; }
[ -f "$SPEC" ] || { echo "missing spec: run python3 sdks/normalize.py first"; exit 1; }
[ $# -gt 0 ] && LANGS=("$@")

pass=0; fail=0; failed=""
for lang in "${LANGS[@]}"; do
  echo "=== $lang ==="
  rm -rf "$SDKS/$lang"
  extra=()
  case "$lang" in
    # Go: prefix enum members (upstream permission enums collide unprefixed).
    go) extra=(--additional-properties=enumClassPrefix=true) ;;
  esac
  if java -jar "$JAR" generate -g "$lang" -i "$SPEC" -o "$SDKS/$lang" \
    --skip-validate-spec --global-property apiTests=false,modelTests=false,apiDocs=false,modelDocs=false \
    "${extra[@]}" > "/tmp/sdkgen-$lang.log" 2>&1; then
    count=$(find "$SDKS/$lang" -type f | wc -l)
    echo "OK $lang ($count files)"
    pass=$((pass + 1))
  else
    echo "FAIL $lang (see /tmp/sdkgen-$lang.log)"
    fail=$((fail + 1))
    failed="$failed $lang"
  fi
done
echo "----"
echo "pass=$pass fail=$fail failed:[$failed ]"
[ "$fail" = "0" ]
