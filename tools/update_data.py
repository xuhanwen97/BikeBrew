#!/usr/bin/env python3
"""Bake the latest drinks sheet into index.html.

Usage: python3 tools/update_data.py <sheet.txt>
Exit code 3 (prints UNCHANGED) when the page already has exactly these rows.

<sheet.txt> is the sheet's text as Google Drive exports it (a markdown table),
or a CSV/TSV export. The rows replace the JSON inside <script id="bb-data">.
"""
import csv, io, json, re, sys, time
from pathlib import Path

PAGE = Path(__file__).resolve().parent.parent / "index.html"


def table_rows(text):
    rows = []
    for line in text.splitlines():
        if not re.match(r"^\s*\|.*\|\s*$", line):
            if rows:
                break  # first table only
            continue
        if re.match(r"^\s*\|[\s:|-]+\|\s*$", line):
            continue
        cells = line.strip()[1:-1].replace("\\|", "\0").split("|")
        rows.append([re.sub(r"\\(.)", r"\1", c.replace("\0", "|").strip()) for c in cells])
    if rows:
        return rows
    delim = "\t" if text.count("\t") > text.count(",") / 2 else ","
    return list(csv.reader(io.StringIO(text), delimiter=delim))


def main(src):
    text = Path(src).read_text()
    rows = [r for r in table_rows(text) if any(c.strip() for c in r)]
    header = next((i for i, r in enumerate(rows) if any("name" in c.lower() for c in r)), None)
    if header is None:
        sys.exit("No header row with a Name column found.")
    rows = rows[header:]
    m = re.search(r"Table Range:\s*[A-Z]+(\d+):[A-Z]+(\d+)", text)
    if m and len(rows) - 1 < int(m[2]) - int(m[1]):
        print(f"WARNING: sheet has {int(m[2]) - int(m[1])} responses but only {len(rows) - 1} came through.")
    page = PAGE.read_text()
    current = re.search(r'<script type="application/json" id="bb-data">([\s\S]*?)</script>', page)
    try:
        if current and json.loads(current[1].replace("<\\/", "</"))["rows"] == rows:
            print(f"UNCHANGED: the page already has these {len(rows) - 1} responses.")
            sys.exit(3)
    except (ValueError, KeyError):
        pass
    blob = json.dumps({"updatedAt": int(time.time() * 1000), "rows": rows}, ensure_ascii=False, indent=0)
    blob = blob.replace("</", "<\\/")
    new, n = re.subn(r'(<script type="application/json" id="bb-data">)[\s\S]*?(</script>)',
                     lambda mm: mm[1] + "\n" + blob + "\n" + mm[2], page)
    if n != 1:
        sys.exit("Couldn't find the bb-data block in index.html.")
    PAGE.write_text(new)
    print(f"Baked {len(rows) - 1} responses into {PAGE.name}.")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__))
