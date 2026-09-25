#!/usr/bin/env python3
"""Record the APT-5 TUI live: civilization tour + one real agentic task.
Captures pty output with timestamps, writes asciicast v2 (rebased to first
prompt paint), ready for `agg` -> GIF. No model keys are read or printed.
Usage: python3 apt5/demo/record-tui.py /tmp/apt5demo.cast
"""
import json
import os
import pty
import select
import subprocess
import sys
import time

CAST = sys.argv[1] if len(sys.argv) > 1 else "/tmp/apt5demo.cast"
REPO = "/home/blackhat/DarkMatter/upstream/packages/opencode"
DEMODIR = "/tmp/apt5demo"
os.makedirs(DEMODIR, exist_ok=True)

AGENT_TASK = "Write hi.py that prints hi apt5, then run it with python3. Be brief."

SCRIPT = [
    # (wait_for_marker_or_None, keys_to_send, settle_seconds)
    ("Ask anything", None, 2),                       # booted, discard earlier output
    (None, "/boards\r", 6),                          # open boards dialog
    (None, "\x1b", 3),                               # esc back
    (None, "/ledger\r", 5),                          # ledger summary
    (None, "\x1b", 3),
    (None, AGENT_TASK + "\r", 150),                  # REAL agentic session (bounded)
    (None, "\x1b", 2),
    (None, "q", 3),                                  # quit
]


def main():
    master, slave = pty.openpty()
    env = dict(os.environ, TERM="xterm-256color", COLUMNS="110", LINES="30")
    proc = subprocess.Popen(
        ["bun", "run", "src/index.ts"],
        cwd=REPO,
        stdin=slave,
        stdout=slave,
        stderr=slave,
        env=env,
        close_fds=True,
    )
    os.close(slave)
    events = []
    start = time.time()
    buf = b""

    def drain(timeout):
        nonlocal buf
        end = time.time() + timeout
        while time.time() < end:
            ready, _, _ = select.select([master], [], [], 0.25)
            if ready:
                try:
                    chunk = os.read(master, 65536)
                except OSError:
                    break
                if not chunk:
                    break
                events.append((time.time() - start, chunk))
                buf += chunk

    try:
        for marker, keys, settle in SCRIPT:
            if marker:
                deadline = time.time() + 240
                while marker.encode() not in buf and time.time() < deadline:
                    drain(2)
                if marker.encode() not in buf:
                    print(f"TIMEOUT waiting for {marker!r}", flush=True)
                    break
            if keys:
                os.write(master, keys.encode())
            drain(settle)
            if proc.poll() is not None:
                break
    finally:
        try:
            proc.terminate()
        except OSError:
            pass
        os.close(master)

    # Rebase timestamps to first marker paint so the GIF starts at the show.
    t0 = None
    out = []
    acc = b""
    for t, chunk in events:
        acc += chunk
        if t0 is None and b"Ask anything" in acc:
            t0 = t
    t0 = t0 or 0.0
    with open(CAST, "w") as handle:
        handle.write(json.dumps({
            "version": 2, "width": 110, "height": 30,
            "env": {"SHELL": "/bin/bash", "TERM": "xterm-256color"},
            "title": "APT-5 live: swarm civilization + real agent session",
        }) + "\n")
        for t, chunk in events:
            if t < t0:
                continue
            handle.write(json.dumps([round(t - t0, 3), "o", chunk.decode("utf-8", "replace")]) + "\n")
    print(f"wrote {CAST} ({len(events)} chunks)")


if __name__ == "__main__":
    main()
