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

**Qualifying:** a rider needs at least 3 counted drinks to hold a jersey or a place in the General Classification. Until then they're listed below a "Not yet qualified" line, flagged with their count (e.g. 2/3).

**Yellow jersey podium:** at the top of the page, the top three qualified riders on total AU stand on a 2-1-3 podium as cartoon animals in cycling kit (the leader in yellow). Each rider's animal comes from the **Animal** column of the Rider Names sheet (free text: "Red Panda" → panda, "Golden Retriever" → dog). Drawable: cat, dog, fox, wolf, bear, panda, koala, mouse, rabbit, pig, cow, lion, tiger, monkey, frog, owl, penguin, duck, raccoon, sheep, giraffe, kangaroo, horse, unicorn, and an original "electric mouse" (type Pikachu). Riders with no animal, or one the page can't draw, appear as Pac-Man; undrawable animals are also flagged under the standings.

**Avatar library (`avatars/`):** `avatars/avatars.js` holds every animal's drawing and is the one place to edit. `node tools/render_avatars.js` saves each one as `avatars/svg/<animal>.svg` and rebuilds the gallery at `avatars/index.html` (on the public site: https://xuhanwen97.github.io/BikeBrew/avatars/). `python3 tools/sync_avatars.py` copies the library into `index.html`. To add an animal: add an `ANIMALS` entry (base/light/dark colours, ear and muzzle style, extras) plus any spellings in `ANIMAL_ALIASES`, then run both commands.

**Stage wins:** each stop is a stage, won by the rider with the most AU at that stop (ties share it). Any rider can win a stage; the count shows next to their name in the General Classification.

**Non-alcoholic drinks:** anything under 0.4% ABV is left out of every stat (AU, drinks, volume, average ABV). It still appears in All entries and the rider's Drinks list, greyed out.

## Architecture

```
Google Form ──► Google Sheet (responses) ──► Claude reads it ──► tools/update_data.py ──► index.html ──► republish
```

- **Single file:** `index.html` is a complete web page (styles, logic and data inline, no build step), served as-is by GitHub Pages. `.nojekyll` makes Pages serve it untouched.
- `tools/artifact_copy.py` writes the body-only copy that gets published to claude.ai.
- **Data is hard-coded** in the `<script type="application/json" id="bb-data">` block: the sheet's rows as JSON plus when they were pulled. The page needs no Google access, so it works for anyone with the link, on any device.
- **Refreshing:** tap **Refresh leaderboard** on the private control page (https://claude.ai/artifact/NZxmMPfr5Bk7k5tgzqGV23, `tools/control.html`), the owner-only **Refresh from sheet** button on the claude.ai leaderboard, or ask Claude in chat. The button sends a message to the Claude session that has Google Drive access (`session_01CLEBZndnurbRn8e2YeQjTd`, via the Claude Code Remote connector); it follows `tools/REFRESH.md` and reports back on the control page.
- **What a refresh does:** It reads the sheet through Google Drive, saves the text to a file, runs `python3 tools/update_data.py <file>` to bake the rows into `index.html`, commits and pushes (GitHub Pages redeploys in about a minute) and republishes the claude.ai copy.
- `update_data.py` accepts Drive's markdown-table export or a CSV/TSV download of the sheet, and warns if fewer rows came through than the sheet holds.
- The page scores the rows in the browser and lists rows it couldn't count (missing name, unreadable volume or ABV) so they can be fixed in the sheet.
- **Display names:** the [Rider Names sheet](https://docs.google.com/spreadsheets/d/10ar6o290JM09kW4Q1JN7Huq1y5BuSH5xOySc84neheQ/edit) maps each form name to a display name, plus an optional Animal column for the podium avatars. The page groups riders by display name (several form names can map to one person) and shows the form name(s) under it. Form names missing from that sheet are flagged under the standings.
- Two tabs: **Standings** (jerseys + General Classification) and **All entries** (every sheet row, newest first, with each row's AU). Link straight to the second tab with `#entries`.

## Google Form setup

Recommended questions. Columns are matched by header name, so wording can vary:

| Question | Type | Notes |
|---|---|---|
| Name | Dropdown of riders | A dropdown avoids spelling splits ("Han" vs "han " already merge) |
| Drink | Short answer | Optional, for flavour |
| Volume (ml) | Dropdown or number | Also accepts `oz`/`L` in the header, or `330ml`, `12oz`, `pint`, `schooner`, `shot` in the answer |
| ABV (%) | Number | Read as a percentage as typed: `5` and `5%` are 5%. Under 0.4% isn't counted |
| Standard drinks | Number (optional) | If present, used as-is instead of computing |

## Build plan

1. **Data contract:** settle the form questions above and link the form to a sheet. ✅ parser is header-tolerant
2. **Scoring engine:** parse CSV / TSV / table text → per-rider totals → four jersey rankings with Tour-style gaps. ✅
3. **Themed UI:** race-poster masthead, coaster-wheel bike, jersey cards with leaders and top 5, GC table with jersey badges. ✅
4. **Refresh:** ask Claude to refresh; it bakes the latest sheet into the page and republishes. ✅
5. **Hosting:** GitHub Pages for the public link (Settings → Pages → Deploy from a branch → `claude/bike-brews-leaderboard-u6ptk2`, `/ (root)`), plus a claude.ai artifact. ✅
6. **Next ideas:**
   - A "lanterne rouge" for last place.
