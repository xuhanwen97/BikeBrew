# Bike & Brews

A Tour de France–style leaderboard for a drinking competition. The prizes are a bike and a brewery. Drinks get logged through a Google Form, and the page reads the form's response sheet.

Live page: https://claude.ai/artifact/1A8iqA15we3wFGWQZywv1M (private until shared from the page's Share menu)

## The jerseys

| Jersey | Award | How it's computed |
|---|---|---|
| Yellow (Maillot Jaune) | Most total AU | Sum of standard drinks per rider |
| Green (Maillot Vert) | Highest average ABV | Volume-weighted: Σ(ABV × ml) / Σ ml |
| Polka dot (Maillot à Pois) | Toughest volume | Most total litres consumed |
| White (Maillot Blanc) | Lowest average ABV | Volume-weighted, lowest wins |

**AU (standard drinks):** 1 AU = 10 g of pure alcohol (the Australian standard drink).
`AU = litres × ABV% × 0.789`. Example: a 375 ml can at 4.8% = 1.42 AU.

## Architecture

```
Google Form ──► Google Sheet (responses) ──► Leaderboard page
                                              ├─ "Refresh leaderboard" button re-reads the sheet
                                              ├─ parse rows → score per rider → rank the 4 jerseys
                                              └─ render jersey cards + General Classification table
```

- **Single file:** `index.html` holds the page, styles and logic, with no build step.
- **Reading the sheet:**
  - On claude.ai the page reads the sheet through the viewer's **Google Drive** connector (`read_file_content`). Each viewer needs Drive connected and access to the sheet.
  - Hosted anywhere else (e.g. GitHub Pages), it falls back to the public CSV endpoint `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv`. That only works when the sheet is shared as "Anyone with the link can view".
- **Sheet setting:** the sheet link is stored in the page's shared database (`config/sheet`), so it's set once for everyone. Only editors can change it. Other viewers' choice is saved in their own browser.
- **Example data** appears until a sheet is connected, marked "Example data".

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
4. **Refresh:** a tap-handle button re-reads the sheet on demand and shows the last-updated time. ✅
5. **Hosting:** published as a claude.ai artifact. ✅ Share it from the page's Share menu.
6. **Next ideas:**
   - Stages: group by day from the form timestamp, with stage winners.
   - Minimum-drinks threshold for green/white so one taster can't win the jersey.
   - Auto-refresh every few minutes during the event.
   - Rider photos/avatars and a "lanterne rouge" for last place.
