#!/usr/bin/env python3
"""Record the APT-5 TUI product tour: boards, ledger, policy, memory, models.
No model keys needed (read-only surfaces against the seeded demo DB).
Usage: python3 apt5/demo/record-tour.py /path/out.cast
Isolated HOME at /home/blackhat/.apt5demo-home (seed it first with
apt5/demo/seed-showcase.py against a server using the same HOME).
"""
import os
import pty
import select
import subprocess
import sys
import time

DH = "/home/blackhat/.apt5demo-home"
REPO = "/home/blackhat/DarkMatter/upstream/packages/opencode"
CAST = sys.argv[1] if len(sys.argv) > 1 else "/home/blackhat/apt5tour.cast"
MAX_GAP = 2.0

STEPS = [
    ("Ask anything", None, 3),
    (None, "/boards", 3),
    (None, "\x1b[B\r", 6),
    (None, "\x1b", 2),
    (None, "/ledger", 3),
    (None, "\x1b[B\r", 6),
    (None, "\x1b", 2),
    (None, "/policy", 3),
    (None, "\x1b[B\r", 6),
    (None, "\x1b", 2),
    (None, "/memory", 3),
    (None, "\x1b[B\r", 6),
    (None, "\x1b", 2),
    (None, "/models", 3),
    (None, "\x1b[B\r", 6),
    (None, "\x1b", 2),
    (None, "q", 3),
]


def main():
    import json

    master, slave = pty.openpty()
    env = dict(
        os.environ,
        TERM="xterm-256color",
        COLUMNS="110",
        LINES="30",
        HOME=DH,
        XDG_CONFIG_HOME=DH + "/.config",
        XDG_DATA_HOME=DH + "/.local/share",
        XDG_STATE_HOME=DH + "/.local/state",
        XDG_CACHE_HOME=DH + "/.cache",
    )
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

    def drain(seconds):
        nonlocal buf
        end = time.time() + seconds
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
            if proc.poll() is not None:
                break

    try:
        for marker, keys, settle in STEPS:
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

    t0 = None
    acc = b""
    for t, chunk in events:
        acc += chunk
        if b"Ask anything" in acc:
            t0 = t
            break
    t0 = t0 or 0.0
    # Cap idle gaps so the GIF stays tight.
    out = []
    last = None
    offset = 0.0
    for t, chunk in events:
        if t < t0:
            continue
        t -= t0
        if last is not None and t - last > MAX_GAP:
            offset += (t - last) - MAX_GAP
        last = t
        out.append((t - offset, chunk))
    with open(CAST, "w") as handle:
        handle.write(json.dumps({
            "version": 2, "width": 110, "height": 30,
            "env": {"SHELL": "/bin/bash", "TERM": "xterm-256color"},
            "title": "APT-5 live product tour: boards, ledger, policy, memory, models",
        }) + "\n")
        for t, chunk in out:
            handle.write(json.dumps([round(t, 3), "o", chunk.decode("utf-8", "replace")]) + "\n")
    print(f"wrote {CAST}")


if __name__ == "__main__":
    sys.exit(main())
