# Bike & Brews

A Tour de France–style leaderboard for a drinking competition. The prizes are a bike and a brewery. Drinks get logged through a Google Form, and the page reads the form's response sheet.

Public page (no login): https://xuhanwen97.github.io/BikeBrew/ — served by GitHub Pages from this branch.
Also on claude.ai: https://claude.ai/artifact/1A8iqA15we3wFGWQZywv1M (viewers need a Claude login)

## The jerseys

| Jersey | Award | How it's computed |
|---|---|---|
| Yellow (Maillot Jaune) | Most total AU | Sum of alcohol units per rider |
| Green (Maillot Vert) | Highest average ABV | Volume-weighted: Σ(fl oz × ABV%) ÷ Σ fl oz |
| Polka dot (Maillot à Pois) | Toughest volume | Most total fl oz: Σ fl oz |
| White (Maillot Blanc) | Lowest average ABV | Volume-weighted, lowest wins |

**AU (alcohol units):** fluid ounces × ABV%.
`AU = fl oz × ABV%`. Example: a 12 oz beer at 5% = 60 AU.

## Architecture

```
Google Form ──► Google Sheet (responses) ──► Claude reads it ──► tools/update_data.py ──► index.html ──► republish
```

- **Single file:** `index.html` is a complete web page (styles, logic and data inline, no build step), served as-is by GitHub Pages. `.nojekyll` makes Pages serve it untouched.
- `tools/artifact_copy.py` writes the body-only copy that gets published to claude.ai.
- **Data is hard-coded** in the `<script type="application/json" id="bb-data">` block: the sheet's rows as JSON plus when they were pulled. The page needs no Google access, so it works for anyone with the link, on any device.
- **Refreshing:** ask Claude to refresh. It reads the sheet through Google Drive, saves the text to a file, runs `python3 tools/update_data.py <file>` to bake the rows into `index.html`, commits and pushes (GitHub Pages redeploys in about a minute) and republishes the claude.ai copy.
- `update_data.py` accepts Drive's markdown-table export or a CSV/TSV download of the sheet, and warns if fewer rows came through than the sheet holds.
- The page scores the rows in the browser and lists rows it couldn't count (missing name, unreadable volume or ABV) so they can be fixed in the sheet.

## Google Form setup

Recommended questions. Columns are matched by header name, so wording can vary:

| Question | Type | Notes |
|---|---|---|
| Name | Dropdown of riders | A dropdown avoids spelling splits ("Han" vs "han " already merge) |
| Drink | Short answer | Optional, for flavour |
| Volume (ml) | Dropdown or number | Also accepts `oz`/`L` in the header, or `330ml`, `12oz`, `pint`, `schooner`, `shot` in the answer |
| ABV (%) | Number | `5`, `5%` and `0.05` all read as 5% |
| Standard drinks | Number (optional) | If present, used as-is instead of computing |

## Build plan

1. **Data contract:** settle the form questions above and link the form to a sheet. ✅ parser is header-tolerant
2. **Scoring engine:** parse CSV / TSV / table text → per-rider totals → four jersey rankings with Tour-style gaps. ✅
3. **Themed UI:** race-poster masthead, coaster-wheel bike, jersey cards with leaders and top 5, GC table with jersey badges. ✅
4. **Refresh:** ask Claude to refresh; it bakes the latest sheet into the page and republishes. ✅
5. **Hosting:** GitHub Pages for the public link (Settings → Pages → Deploy from a branch → `claude/bike-brews-leaderboard-u6ptk2`, `/ (root)`), plus a claude.ai artifact. ✅
6. **Next ideas:**
   - Stages: group by day from the form timestamp, with stage winners.
   - Minimum-drinks threshold for green/white so one taster can't win the jersey.
   - Rider photos/avatars and a "lanterne rouge" for last place.
