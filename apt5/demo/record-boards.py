import os, pty, select, subprocess, sys, time, json
DH = "/home/blackhat/.apt5demo-home"
REPO = "/home/blackhat/DarkMatter/upstream/packages/opencode"
CAST = sys.argv[1] if len(sys.argv) > 1 else "/home/blackhat/apt5boards.cast"
STEPS = [
    ("Ask anything", None, 3),
    (None, "/boards", 3),
    (None, "\x1b[B\r", 7),
    (None, "\x1b[B\r", 7),
    (None, "\x1b", 2),
    (None, "\x1b", 2),
    (None, "q", 3),
]
master, slave = pty.openpty()
env = dict(os.environ, TERM="xterm-256color", COLUMNS="110", LINES="30", HOME=DH,
    XDG_CONFIG_HOME=DH+"/.config", XDG_DATA_HOME=DH+"/.local/share",
    XDG_STATE_HOME=DH+"/.local/state", XDG_CACHE_HOME=DH+"/.cache")
proc = subprocess.Popen(["bun", "run", "src/index.ts"], cwd=REPO, stdin=slave,
    stdout=slave, stderr=slave, env=env, close_fds=True)
os.close(slave)
events, start, buf = [], time.time(), b""
def drain(s):
    global buf
    end = time.time() + s
    while time.time() < end:
        r, _, _ = select.select([master], [], [], 0.25)
        if r:
            try: c = os.read(master, 65536)
            except OSError: break
            if not c: break
            events.append((time.time()-start, c)); buf += c
        if proc.poll() is not None: break
try:
    for marker, keys, settle in STEPS:
        if marker:
            deadline = time.time() + 240
            while marker.encode() not in buf and time.time() < deadline: drain(2)
        if keys: os.write(master, keys.encode())
        drain(settle)
        if proc.poll() is not None: break
finally:
    try: proc.terminate()
    except OSError: pass
    os.close(master)
t0, acc = None, b""
for t, c in events:
    acc += c
    if b"Ask anything" in acc: t0 = t; break
t0 = t0 or 0.0
out, last, off = [], None, 0.0
for t, c in events:
    if t < t0: continue
    t -= t0
    if last is not None and t-last > 2.0: off += (t-last)-2.0
    last = t
    out.append((t-off, c))
with open(CAST, "w") as h:
    h.write(json.dumps({"version":2,"width":110,"height":30,"env":{"SHELL":"/bin/bash","TERM":"xterm-256color"},"title":"APT-5 boards"})+"\n")
    for t, c in out:
        h.write(json.dumps([round(t,3),"o",c.decode("utf-8","replace")])+"\n")
print("wrote", CAST)
