#!/usr/bin/env python3
"""Seed showcase content via the live APT-5 HTTP API. No secrets involved.
Usage: python3 apt5/demo/seed-showcase.py [base-url]
"""
import json
import sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4099"
HEADERS = {"x-opencode-directory": "/tmp", "content-type": "application/json"}


def call(method, path, body=None):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers=HEADERS,
        method=method,
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        raw = response.read().decode() or "null"
        return response.status, json.loads(raw)


def main():
    status, swarm = call("POST", "/swarm", {"name": "Showcase"})
    assert status == 200, swarm
    board = swarm["boardID"]
    print("swarm:", swarm["id"], "board:", board)

    tasks = []
    for title in ["Research calculator structure", "Build calculator", "Review calculator"]:
        status, task = call("POST", f"/work-board/{board}/tasks", {"title": title, "priority": 0})
        assert status == 200, task
        tasks.append(task)
    print("tasks:", len(tasks))

    status, _ = call("POST", f"/work-board/tasks/{tasks[0]['id']}/move", {"status": "done"})
    assert status == 200, "move failed"

    status, _ = call("PUT", f"/memory/swarm:{swarm['id']}/stack", {"value": {"runtime": "bun", "tests": "green"}})
    assert status == 200, "memory put failed"

    status, _ = call("POST", "/governance/rules", {"pattern": "deploy.*", "effect": "approve"})
    assert status == 200, "rule failed"

    status, _ = call(
        "POST",
        "/ledger",
        {
            "sessionID": "ses_showcase",
            "providerID": "openrouter",
            "modelID": "nex-agi/nex-n2.5-mini:free",
            "inputTokens": 1200,
            "outputTokens": 300,
            "cost": 0.0,
        },
    )
    assert status == 200, "ledger failed"

    status, summary = call("GET", "/ledger/summary")
    print("ledger:", summary)
    print("SEEDED OK")


if __name__ == "__main__":
    main()
