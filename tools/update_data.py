#!/usr/bin/env python3
"""Bake the latest drinks sheet into index.html.

Usage: python3 tools/update_data.py <sheet.txt> [--names <names.txt>]
Exit code 3 (prints UNCHANGED) when the page already has exactly these rows.

<sheet.txt> is the sheet's text as Google Drive exports it (a markdown table),
or a CSV/TSV export. The rows replace the JSON inside <script id="bb-data">.
<names.txt> is the "Bikes & Brews Rider Names" sheet (Form name -> Display name),
in the same formats; without it the names already in the page are kept.
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


def read_names(src):
    rows = [r for r in table_rows(Path(src).read_text()) if any(c.strip() for c in r)]
    header = next((i for i, r in enumerate(rows)
                   if any("form" in c.lower() for c in r) and any("display" in c.lower() for c in r)), None)
    if header is None:
        sys.exit("Names sheet needs 'Form name' and 'Display name' columns.")
    h = [c.lower() for c in rows[header]]
    i_form = next(i for i, c in enumerate(h) if "form" in c)
    i_disp = next(i for i, c in enumerate(h) if "display" in c)
    out = []
    for r in rows[header + 1:]:
        form = r[i_form].strip() if i_form < len(r) else ""
        disp = r[i_disp].strip() if i_disp < len(r) else ""
        if form:
            out.append([form, disp or form])
    return out


def main(src, names_src=None):
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
        old = json.loads(current[1].replace("<\\/", "</")) if current else {}
    except ValueError:
        old = {}
    names = read_names(names_src) if names_src else old.get("names", [])
    if old.get("rows") == rows and old.get("names", []) == names:
        print(f"UNCHANGED: the page already has these {len(rows) - 1} responses and {len(names)} names.")
        sys.exit(3)
    blob = json.dumps({"updatedAt": int(time.time() * 1000), "rows": rows, "names": names}, ensure_ascii=False, indent=0)
    blob = blob.replace("</", "<\\/")
    new, n = re.subn(r'(<script type="application/json" id="bb-data">)[\s\S]*?(</script>)',
                     lambda mm: mm[1] + "\n" + blob + "\n" + mm[2], page)
    if n != 1:
        sys.exit("Couldn't find the bb-data block in index.html.")
    PAGE.write_text(new)
    print(f"Baked {len(rows) - 1} responses and {len(names)} names into {PAGE.name}.")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    names_src = None
    if "--names" in args:
        i = args.index("--names")
        names_src = args[i + 1]
        del args[i:i + 2]
    main(args[0], names_src)
