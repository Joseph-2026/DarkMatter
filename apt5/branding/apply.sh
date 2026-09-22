#!/usr/bin/env bash
# APT-5 branding codemod — re-runnable, dry-run default, logs everything.
# Usage: apply.sh [--dry-run|--apply]   (default: --dry-run)
# Runs from repo root: ./apt5/branding/apply.sh --dry-run
set -euo pipefail

MODE="${1:---dry-run}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET="$ROOT/upstream"
LOG="$ROOT/apt5/branding/APPLIED.log"

EXCLUDES=(--exclude-dir=node_modules --exclude-dir=.git --exclude=bun.lock --exclude="*.lock"
  --exclude=CHANGELOG.md --exclude=CHANGELOG* --exclude=LICENSE --exclude=CREDITS.md)

# rule | search | replace | case-flag
RULES=(
  "scope|@opencode-ai/|@apt5/|"
  "configdir|.opencode|.apt5|"
  "flagprefix|OPENCODE_|APT5_|"
  "flagprefix-lower|opencode_config|apt5_config|"
  "macdomain|ai.opencode.managed|dev.apt5.managed|"
  "urls|opencode.ai|github.com/Joseph-2026/DarkMatter|"
  "tuiclient|\"name\": \"opencode\"|\"name\": \"apt-5\"|"
  "theme-default|\"opencode\"|\"darkmatter\"|g:warn"
)

echo "MODE=$MODE TARGET=$TARGET"
total_files=0
for r in "${RULES[@]}"; do
  IFS='|' read -r name search replace _ <<< "$r"
  # count files (case-insensitive for product strings only via rule list; keep simple: fixed-string)
  n=$(grep -rlF "${EXCLUDES[@]}" "$search" "$TARGET" 2>/dev/null | wc -l || true)
  echo "rule=$name search=$search files=$n"
  total_files=$((total_files + n))
  if [[ "$MODE" == "--apply" ]]; then
    echo "## APPLY $name : $search -> $replace" >> "$LOG"
    grep -rlF "${EXCLUDES[@]}" "$search" "$TARGET" 2>/dev/null | while read -r f; do
      echo "$f" >> "$LOG"
      # perl fixed-string replace (handles slashes safely)
      SEARCH="$search" REPLACE="$replace" perl -pi -e 's/\Q$ENV{SEARCH}\E/$ENV{REPLACE}/g' "$f"
    done
  fi
done
echo "RULES_TOTAL_FILE_HITS=$total_files (files may match multiple rules)"
if [[ "$MODE" == "--apply" ]]; then
  # binary rename (keep backward-compat symlink)
  if [[ -f "$TARGET/packages/opencode/bin/opencode" && ! -f "$TARGET/packages/opencode/bin/apt-5" ]]; then
    mv "$TARGET/packages/opencode/bin/opencode" "$TARGET/packages/opencode/bin/apt-5"
    ln -s apt-5 "$TARGET/packages/opencode/bin/darkmatter"
    echo "## binary renamed + darkmatter symlink" >> "$LOG"
  fi
  echo "APPLY DONE — now run: build + tests + git diff --stat review"
fi
