#!/usr/bin/env python3
"""Probe TUI navigation states (slash menu behavior). Read-only exploration.
Usage: python3 apt5/demo/probe-nav.py  (prints snapshots, exits)
"""
import os
import pty
import re
import select
import subprocess
import sys
import time

DH = "/home/blackhat/.apt5demo-home"
REPO = "/home/blackhat/DarkMatter/upstream/packages/opencode"


def clean(data):
    text = re.sub(r"\x1b\[[0-9;?]*[a-zA-Z]|\x1b[()][AB0]|\x1b[=>]|\x1b\].*?\x07", "", data)
    return [line for line in text.splitlines() if line.strip()]


def main():
    os.makedirs(DH, exist_ok=True)
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
                buf += chunk
            if proc.poll() is not None:
                break

    def snap(tag):
        lines = clean(buf.decode("utf-8", "replace"))
        print(f"--- {tag} ---", flush=True)
        print("\n".join(lines[-10:]), flush=True)
        print(flush=True)

    try:
        drain(90)
        snap("boot")
        os.write(master, b"/boards")
        drain(4)
        snap("typed-/boards")
        os.write(master, b"\x1b[B\r")
        drain(6)
        snap("down+enter")
        os.write(master, b"\x1b")
        drain(2)
        snap("esc")
    finally:
        try:
            proc.terminate()
        except OSError:
            pass
        os.close(master)
    print("PROBE DONE", flush=True)


if __name__ == "__main__":
    sys.exit(main())
