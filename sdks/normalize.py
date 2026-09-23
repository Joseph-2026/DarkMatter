#!/usr/bin/env python3
"""Normalize a COPY of the served OpenAPI for strict client generators.

Rules (semantically faithful — empty schema `{}` constrains nothing):
- `anyOf`/`oneOf` containing `{}`  -> the whole node becomes `{}` (matches anything).
- `allOf` containing `{}`           -> drop the empty members (all empty -> `{}`).
- `anyOf`/`oneOf` of one real schema + `{type: null}` members (OpenAPI 3.1
  nullable) -> the real schema plus `nullable: true` (OpenAPI 3.0 style that
  strict generators accept).

The served spec (sdks/openapi.json) is NEVER modified; output is
sdks/openapi.sdk.json, used only as codegen input. Regenerate with:
  python3 sdks/normalize.py
"""

import json
import sys

SRC = "sdks/openapi.json"
DST = "sdks/openapi.sdk.json"


def is_null(member):
    return isinstance(member, dict) and member.get("type") == "null"


def normalize(node):
    if isinstance(node, dict):
        for key in ("anyOf", "oneOf"):
            members = node.get(key)
            if isinstance(members, list) and any(m == {} for m in members):
                return {}
            if isinstance(members, list):
                real = [m for m in members if not is_null(m)]
                if real and len(real) < len(members) and len(members) > 1:
                    collapsed = normalize(real[0]) if len(real) == 1 else {key: [normalize(m) for m in real]}
                    rest = {k: normalize(v) for k, v in node.items() if k != key}
                    return {**collapsed, "nullable": True, **{k: v for k, v in rest.items() if k != "nullable"}}
        if isinstance(node.get("allOf"), list):
            kept = [m for m in node["allOf"] if m != {}]
            node = {**node, "allOf": kept or [{}]}
        return {k: normalize(v) for k, v in node.items()}
    if isinstance(node, list):
        return [normalize(v) for v in node]
    return node


def main():
    with open(SRC) as handle:
        document = json.load(handle)
    with open(DST, "w") as handle:
        json.dump(normalize(document), handle, indent=2)
        handle.write("\n")
    print(f"wrote {DST}")


if __name__ == "__main__":
    sys.exit(main())
