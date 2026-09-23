#!/usr/bin/env python3
"""Build sdks/manifest.json: per-language proof of generation + verification.

Run AFTER ./sdks/generate.sh completes. Scans sdks/<lang>/ for file count,
bytes, civilization endpoint markers, and toolchain compile checks where
available (python compileall, go build, ruby -c sample, php -l sample).
Writes sdks/manifest.json. Exit non-zero if any language dir is missing/empty.
"""

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SDKS = os.path.join(ROOT, "sdks")
GENERATOR = "openapi-generator-cli 7.14.0"

LANGS = [
    "python", "go", "rust", "java", "csharp", "ruby", "php", "swift", "kotlin",
    "javascript", "typescript-axios", "typescript-fetch", "dart", "elixir",
    "scala", "perl", "r", "lua", "powershell", "bash",
]

CIV_MARKERS = ["workboard", "work-board", "ledger", "governance"]


def run(cmd, cwd=None, timeout=300):
    try:
        proc = subprocess.run(cmd, cwd=cwd, capture_output=True, timeout=timeout)
        return proc.returncode == 0, (proc.stderr.decode()[-300:] if proc.returncode else "")
    except Exception as exc:
        return False, str(exc)[:200]


def contains_marker(root):
    found = []
    for dirpath, _, filenames in os.walk(root):
        for name in filenames:
            if not name.endswith((".py", ".go", ".rb", ".php", ".ts", ".js", ".java")):
                continue
            try:
                with open(os.path.join(dirpath, name), errors="ignore") as handle:
                    text = handle.read(200000).lower()
            except OSError:
                continue
            for marker in CIV_MARKERS:
                if marker in text and marker not in found:
                    found.append(marker)
            if len(found) == len(CIV_MARKERS):
                return found
    return found


def verify(lang, root):
    if lang == "python":
        ok, err = run([sys.executable, "-m", "compileall", "-q", os.path.join(root, "apt5_client")])
        return ("COMPILE_OK" if ok else "COMPILE_FAIL", err)
    if lang == "go":
        ok, err = run(["go", "build", "./..."], cwd=root, timeout=600)
        return ("COMPILE_OK" if ok else "COMPILE_FAIL", err)
    if lang == "ruby":
        ok, err = run(["ruby", "-c", "lib/apt5_client/version.rb"], cwd=root)
        return ("COMPILE_OK" if ok else ("GEN_ONLY" if "no such file" in err.lower() else "COMPILE_FAIL"), err)
    if lang == "php":
        ok, err = run(["php", "-l", "lib/Configuration.php"], cwd=root)
        return ("COMPILE_OK" if ok else ("GEN_ONLY" if "no such file" in err.lower() else "COMPILE_FAIL"), err)
    return ("GEN_ONLY", "no local toolchain")


def main():
    manifest = {"generator": GENERATOR, "spec": "sdks/openapi.sdk.json", "languages": {}}
    failed = []
    for lang in LANGS:
        root = os.path.join(SDKS, lang)
        entry = {"status": "MISSING", "files": 0, "bytes": 0, "markers": [], "verify": "NONE"}
        if os.path.isdir(root):
            total_files, total_bytes = 0, 0
            for dirpath, _, filenames in os.walk(root):
                for name in filenames:
                    total_files += 1
                    try:
                        total_bytes += os.path.getsize(os.path.join(dirpath, name))
                    except OSError:
                        pass
            entry["files"] = total_files
            entry["bytes"] = total_bytes
            entry["markers"] = contains_marker(root)
            status, detail = ("EMPTY", "") if total_files == 0 else verify(lang, root)
            entry["status"] = "OK" if total_files > 0 and detail == "" and status in ("COMPILE_OK", "GEN_ONLY") else status
            if status == "COMPILE_FAIL":
                entry["status"] = "COMPILE_FAIL"
            entry["verify"] = status
            entry["detail"] = detail
            if total_files == 0:
                failed.append(lang)
        else:
            failed.append(lang)
        manifest["languages"][lang] = entry
    with open(os.path.join(SDKS, "manifest.json"), "w") as handle:
        json.dump(manifest, handle, indent=2)
        handle.write("\n")
    print(f"wrote sdks/manifest.json ({len(LANGS) - len(failed)}/{len(LANGS)} present)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
