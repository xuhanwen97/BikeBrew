#!/usr/bin/env python3
"""Write the claude.ai artifact version of index.html (body content only; the
artifact host adds its own <html>/<head>). Usage: python3 tools/artifact_copy.py <out.html>"""
import re, sys
from pathlib import Path

src = (Path(__file__).resolve().parent.parent / "index.html").read_text()
head = re.search(r"<head>(.*?)</head>", src, re.S)[1]
head = re.sub(r'<meta (charset|name="viewport")[^>]*>\s*', "", head).strip()
body = re.search(r"<body>(.*)</body>", src, re.S)[1].strip()
Path(sys.argv[1]).write_text(head + "\n\n" + body + "\n")
