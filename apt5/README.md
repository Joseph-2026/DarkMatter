# apt5/ — kazi yetu yote (upstream/ ni read-only snapshot)

## Kanuni
- Hakuna kuhariri `upstream/` kwa mkono. Mabadiliko yote ni scripts zinazoweza kurudiwa
  (re-runnable) + zinazo-log kila kitu — ili upstream mpya ikija, tunapiga script tena.
- Kila script: `--dry-run` default (inaonyesha kitakachobadilika), `--apply` ndio inabadilisha.
- Baada ya kila apply: build + targeted tests + `git diff --stat` review. Green ndio push.

## Muundo
```
apt5/
  branding/    # rebrand opencode → APT-5 (MAP.md + apply.sh)
  tui/         # DarkMatter theme + layout (awamu inayofuata)
  streaming/   # bus/renderer/openrouter + bridges (awamu inayofuata)
  providers/   # OpenRouter free router (awamu inayofuata)
  civilization/# layers 03-18 kama real systems (awamu inayofuata)
```
