#!/usr/bin/env node
// Save every avatar in avatars/avatars.js as avatars/svg/<animal>.svg and rebuild the gallery
// at avatars/index.html. Run after adding or changing an animal:  node tools/render_avatars.js
const fs = require("fs");
const path = require("path");
const A = require("../avatars/avatars.js");

const root = path.join(__dirname, "..", "avatars");
const out = path.join(root, "svg");
fs.mkdirSync(out, { recursive: true });

const kinds = [...Object.keys(A.ANIMALS).sort(), "pacman"];
for (const kind of kinds) {
  // place -1: no medal; the kit colour comes from the animal's name so it's stable.
  const svg = A.draw({ name: kind, forms: [] }, -1, kind).replace(/^\s+/gm, "");
  fs.writeFileSync(path.join(out, `${kind}.svg`), svg + "\n");
}

const aliases = {};
for (const [word, kind] of Object.entries(A.ANIMAL_ALIASES)) (aliases[kind] = aliases[kind] || []).push(word);
const cards = kinds.map(kind => `    <figure>
      <img src="svg/${kind}.svg" alt="${kind}" width="130" height="132">
      <figcaption><strong>${kind === "pacman" ? "Pac-Man (no animal)" : kind}</strong>${aliases[kind] ? `<span>also: ${aliases[kind].sort().join(", ")}</span>` : ""}</figcaption>
    </figure>`).join("\n");

fs.writeFileSync(path.join(root, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bike &amp; Brews Avatars</title>
<style>
  :root { --bg: #e9edf0; --surface: #fff; --ink: #16191d; --muted: #5b6570; --amber: #c66f12; }
  @media (prefers-color-scheme: dark) { :root { --bg: #121519; --surface: #1b2026; --ink: #eef1f3; --muted: #9aa5af; --amber: #f0a040; color-scheme: dark; } }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 system-ui, sans-serif; }
  main { max-width: 1080px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { margin: 0; font: 400 34px/1.1 Georgia, serif; }
  p { color: var(--muted); max-width: 70ch; }
  code { background: var(--surface); padding: 1px 6px; border-radius: 6px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-top: 16px; }
  figure { margin: 0; background: var(--surface); border-radius: 14px; padding: 12px; text-align: center; }
  img { width: 100%; max-width: 130px; height: auto; }
  figcaption strong { display: block; text-transform: capitalize; }
  figcaption span { display: block; font-size: 12px; color: var(--muted); }
</style>
</head>
<body>
<main>
  <h1>Bike &amp; Brews avatars</h1>
  <p>Every animal the podium can draw (${kinds.length - 1}, plus Pac-Man for riders without one). Type any of these names, or the "also" spellings, in the Animal column of the Rider Names sheet. Each drawing is saved as <code>avatars/svg/&lt;animal&gt;.svg</code>; the drawing code lives in <code>avatars/avatars.js</code>.</p>
  <div class="grid">
${cards}
  </div>
</main>
</body>
</html>
`);
console.log(`Saved ${kinds.length} avatars to avatars/svg and rebuilt avatars/index.html`);
