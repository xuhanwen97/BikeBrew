# Refreshing the leaderboard

The procedure Claude follows when asked to refresh: in chat, or when the organiser taps a
refresh button (control page or claude.ai leaderboard). The buttons call the Claude Code
Remote connector's `send_message` to session `session_01CLEBZndnurbRn8e2YeQjTd`, the session that has the
Google Drive connector. (A routine can't be used: routine runs start fresh sessions, and
connectors can't be attached to routines in this organisation, so they can't read the sheet.)

| Thing | Where |
|---|---|
| Drinks sheet | Google Drive file `1RxgUCudXWTEWxoq7LoU9xiT1dIJfdhRePCnjvECsto0` |
| Rider Names sheet (form name → display name, optional Animal column) | Google Drive file `10ar6o290JM09kW4Q1JN7Huq1y5BuSH5xOySc84neheQ` |
| Public leaderboard | https://xuhanwen97.github.io/BikeBrew/ (GitHub Pages, this branch) |
| claude.ai leaderboard | https://claude.ai/artifact/1A8iqA15we3wFGWQZywv1M |
| Control page (private) | https://claude.ai/artifact/NZxmMPfr5Bk7k5tgzqGV23 |
| Branch | `claude/bike-brews-leaderboard-u6ptk2` |

## Steps

1. **Repo.** Work in `/home/user/BikeBrew`. If it's missing (fresh container), clone
   `https://github.com/xuhanwen97/BikeBrew` on the branch above. `git pull` first.
2. **Read both sheets** with the Google Drive `read_file_content` tool: the drinks sheet
   and the Rider Names sheet.
3. **Save them.** Write each `fileContent` to `<scratchpad>/sheet.txt` and
   `<scratchpad>/names.txt`. Only the `Table Range` line and the markdown table matter;
   copy the table rows exactly.
4. **Bake.** `python3 tools/update_data.py <scratchpad>/sheet.txt --names <scratchpad>/names.txt`
   - Prints `UNCHANGED` (exit 3): nothing new. Skip to step 7 with the summary
     "No new drinks (N responses)".
   - Prints `WARNING ... only N came through`: Drive truncated the sheet. Don't publish
     partial data; tell the user.
5. **Check** the standings render: open `index.html` in Playwright (Chromium at
   `/opt/pw-browsers/chromium`) and read `#status` and the four jersey leaders.
6. **Publish.**
   - `python3 tools/artifact_copy.py <scratchpad>/bikebrews-artifact.html`, then publish
     that file with the Artifact tool, `url` = the claude.ai leaderboard.
   - `git commit -am "Refresh standings: N responses through <latest time>"` and
     `git push -u origin claude/bike-brews-leaderboard-u6ptk2`. Pages redeploys in about a minute.
7. **Report back to the control page** with `ArtifactData` on the control page URL:
   `set` collection `control`, doc `status`,
   data `{"at": <now, epoch ms>, "summary": "<one line, e.g. 3 new drinks · 39 responses through 2:51 PM>"}`.
   Pass the doc's current `version` as `if_version` (read it first with `get`).
8. **Reply** in one short line: what changed (new drinks, jersey changes, rows still not counted,
   form names missing from the Rider Names sheet). Claude can't edit the names sheet
   (no Sheets editor connector), so new form names are flagged on the page for the organiser to add.
