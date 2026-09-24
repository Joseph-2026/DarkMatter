#!/usr/bin/env bash
# Builds a NEW-surface @apt5/client vendor tarball from packages/client SOURCE.
# (Phase A: pipeline only — does NOT flip the app pin; app keeps the pinned
# v1.17.13 tarball until the Phase B import migration lands.)
#
# Why source, not compiled dist: the app toolchain (bun/vite) resolves TS
# source exactly like workspace packages do (proof: @apt5/client resolves to
# ./src/*.ts for sdk/opencode today). Compiled emit is blocked by a
# pre-existing upstream wall (contract.ts inferred type exceeds TS7056
# serialization), which is not ours to break.
# - KEEPS: `export * as OpenCode` namespace (codegen template, as before),
#   wire values, Apt5Event/Apt5Client names (already ours in source).
# - OMITS: legacy empty stubs (service.js/api.js — nothing imports them) and
#   the old contract.js re-export (no equivalent module exists).
# - Externals (@apt5/*, effect) resolve from the app's node_modules at flip
#   time (Phase B adds @apt5/protocol to app deps).
# Idempotent. Ends with verification gates.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLIENT="$ROOT/upstream/packages/client"
VENDOR="$ROOT/upstream/packages/app/vendor"
VERSION="1.18.32-apt5.0"
OUT_NAME="apt5-client-1.18.32-apt5.0.tgz"
OUT_TGZ="$VENDOR/$OUT_NAME"

work=$(mktemp -d); trap 'rm -rf "$work"' EXIT
P="$work/package"
mkdir -p "$P"
cp -r "$CLIENT/src" "$P/src"
cp "$ROOT/upstream/LICENSE" "$P/LICENSE"

cat > "$P/package.json" <<EOF
{
  "\$schema": "https://json.schemastore.org/package.json",
  "name": "@apt5/client",
  "version": "$VERSION",
  "type": "module",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Joseph-2026/DarkMatter.git",
    "directory": "packages/client"
  },
  "publishConfig": {
    "access": "public"
  },
  "files": [
    "src"
  ],
  "exports": {
    ".": "./src/index.ts",
    "./promise": "./src/index.ts",
    "./effect": "./src/effect.ts"
  }
}
EOF

tar czf "$OUT_TGZ" -C "$work" package
echo "wrote $OUT_TGZ ($(du -h "$OUT_TGZ" | cut -f1))"

echo "== VERIFY =="
tar tzf "$OUT_TGZ" | grep -E "src/index.ts|src/effect.ts|package.json|LICENSE" || exit 1
tmp2=$(mktemp -d); trap 'rm -rf "$tmp2" "$work"' EXIT
tar xzf "$OUT_TGZ" -C "$tmp2"
grep -rl "workboards\|Workboards" "$tmp2/package/src/generated/" | head -n 2 || { echo "NO-CIV in tarball"; exit 1; }
grep -q "\"version\": \"$VERSION\"" "$tmp2/package/package.json" || exit 1
grep -q "OpenCode" "$tmp2/package/src/generated/index.ts" || { echo "NAMESPACE-KEPT check"; exit 1; }
echo "VENDOR BUILD VERIFIED"
