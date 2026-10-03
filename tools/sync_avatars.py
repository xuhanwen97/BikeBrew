#!/usr/bin/env python3
"""Copy avatars/avatars.js into index.html between the AVATARS:BEGIN/END markers."""
import re, textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
lib = (ROOT / "avatars" / "avatars.js").read_text()
page = (ROOT / "index.html").read_text()
pat = re.compile(r"(  /\* AVATARS:BEGIN[^\n]*\*/\n)[\s\S]*?(  /\* AVATARS:END \*/\n)")
new, n = pat.subn(lambda m: m[1] + textwrap.indent(lib, "  ") + m[2], page)
if n != 1:
    raise SystemExit("AVATARS markers not found in index.html")
(ROOT / "index.html").write_text(new)
print("index.html avatars", "unchanged" if new == page else "updated", "from avatars/avatars.js")
