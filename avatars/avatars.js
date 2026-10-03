// Bike & Brews avatar library: cartoon animals (and Pac-Man) in cycling kit, raising a beer.
//
// This file is the single source of truth. To add an animal: add an entry to ANIMALS (and any
// spellings to ANIMAL_ALIASES), run `node tools/render_avatars.js` to save its SVG and refresh the
// gallery, then `python3 tools/sync_avatars.py` to copy this file into index.html.
//
// Use:  BikeBrewsAvatars.draw({ name, forms: [] }, place, kind)  -> SVG string
//       place 0/1/2 = podium medal and kit (0 wears yellow); -1 = no medal.
//       kind = a key of ANIMALS, or "pacman".
const BikeBrewsAvatars = (() => {
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Cartoon animal avatars. The animal comes from the Rider Names sheet's Animal column;
// riders without one get an animal picked from their display name.
function hashName(str) {
  let h = 2166136261;
  for (const ch of String(str).toLowerCase()) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const KIT = ["#1f6fb5", "#d42a2a", "#1b8a4c", "#6d3fb2", "#e2701c", "#14808a", "#c2185b"];
const MEDAL = ["#f2c200", "#c9ced3", "#c98a4b"];
// base, light (muzzle/belly), dark (accents), inner ear, ear style, muzzle style, extras
const ANIMALS = {
  cat:     { base: "#f2a65a", light: "#fff4e6", dark: "#c46f2a", inner: "#f7b8c4", ear: "pointy", muzzle: "cat", extras: ["whiskers", "stripes"] },
  dog:     { base: "#c98b4f", light: "#f6e3c8", dark: "#6e4423", inner: "#6e4423", ear: "floppy", muzzle: "dog", extras: ["tongue"] },
  fox:     { base: "#e8732c", light: "#fff6ec", dark: "#2a1d15", inner: "#fff6ec", ear: "pointy", muzzle: "fox", extras: [] },
  wolf:    { base: "#8c949c", light: "#eef0f2", dark: "#3d4248", inner: "#5f666d", ear: "pointy", muzzle: "fox", extras: [] },
  bear:    { base: "#8a5a3b", light: "#d9b48f", dark: "#3b2416", inner: "#d9b48f", ear: "round", muzzle: "bear", extras: [] },
  panda:   { base: "#fbfbfb", light: "#fbfbfb", dark: "#1d1a16", inner: "#1d1a16", ear: "round", muzzle: "bear", extras: ["patches"], earFill: "#1d1a16" },
  koala:   { base: "#9aa3ab", light: "#e4e7ea", dark: "#2f3337", inner: "#f0e6ea", ear: "fluffy", muzzle: "koala", extras: [] },
  mouse:   { base: "#b9bec4", light: "#e9ebee", dark: "#4b5057", inner: "#f7b8c4", ear: "big", muzzle: "mouse", extras: ["whiskers"] },
  rabbit:  { base: "#f1ece4", light: "#ffffff", dark: "#6b5e52", inner: "#f7b8c4", ear: "long", muzzle: "rabbit", extras: ["whiskers"] },
  pig:     { base: "#f4a7b9", light: "#f9c9d4", dark: "#b8566f", inner: "#e27f98", ear: "pointy", muzzle: "pig", extras: [] },
  cow:     { base: "#fbfbfb", light: "#f7b8c4", dark: "#1d1a16", inner: "#f7b8c4", ear: "side", muzzle: "cow", extras: ["spots", "horns"] },
  lion:    { base: "#e0a446", light: "#fbe3b4", dark: "#6b3d16", inner: "#b5651d", ear: "round", muzzle: "cat", extras: ["mane", "whiskers"] },
  tiger:   { base: "#f08a24", light: "#fff6ec", dark: "#1d1a16", inner: "#fff6ec", ear: "round", muzzle: "cat", extras: ["tigerstripes", "whiskers"] },
  monkey:  { base: "#7b4f2c", light: "#e8c39e", dark: "#3b2416", inner: "#e8c39e", ear: "monkey", muzzle: "monkey", extras: [] },
  frog:    { base: "#6cc04a", light: "#c8eab3", dark: "#2e6a1d", inner: "#6cc04a", ear: "none", muzzle: "frog", extras: [] },
  owl:     { base: "#8d6e63", light: "#e9d8c4", dark: "#4e342e", inner: "#4e342e", ear: "tufts", muzzle: "owl", extras: [] },
  penguin: { base: "#2b2f36", light: "#ffffff", dark: "#1d1a16", inner: "#2b2f36", ear: "none", muzzle: "penguin", extras: [] },
  duck:    { base: "#ffd84d", light: "#fff3b8", dark: "#e2701c", inner: "#ffd84d", ear: "none", muzzle: "duck", extras: ["tuft"] },
  raccoon: { base: "#8f969c", light: "#eef0f2", dark: "#2b2f36", inner: "#2b2f36", ear: "pointy", muzzle: "fox", extras: ["mask"] },
  sheep:   { base: "#5a5048", light: "#f5f1ea", dark: "#2a241f", inner: "#f7b8c4", ear: "side", muzzle: "sheep", extras: ["wool"] },
  unicorn: { base: "#ffffff", light: "#ffe3f1", dark: "#7a4fb5", inner: "#f7b8c4", ear: "pointy", muzzle: "horse", extras: ["horn", "unimane"] },
  electricmouse: { label: "electric mouse", base: "#ffd93b", light: "#fff1a8", dark: "#1d1a16", inner: "#ffd93b", ear: "tipped", muzzle: "electric", extras: ["sparkcheeks", "bolttail"] },
  kangaroo: { base: "#c68642", light: "#ecc89a", dark: "#6e4423", inner: "#ecc89a", ear: "tall", muzzle: "dog", extras: ["joey"] },
  giraffe: { base: "#f2c14e", light: "#f8dc96", dark: "#9a5a26", inner: "#9a5a26", ear: "side", muzzle: "horse", extras: ["giraffespots", "ossicones"] },
  horse:   { base: "#9c6a3f", light: "#d8b48d", dark: "#3b2416", inner: "#3b2416", ear: "pointy", muzzle: "horse", extras: ["horsemane"] },
};
const ANIMAL_ALIASES = {
  kitty: "cat", kitten: "cat", puppy: "dog", pup: "dog", doggo: "dog", retriever: "dog", lab: "dog", labrador: "dog", corgi: "dog", pug: "dog",
  bunny: "rabbit", hare: "rabbit", grizzly: "bear", polar: "bear", piglet: "pig", hog: "pig", boar: "pig", bull: "cow", cattle: "cow",
  ape: "monkey", chimp: "monkey", gorilla: "monkey", toad: "frog", lamb: "sheep", ram: "sheep", pony: "horse", mice: "mouse", rat: "mouse",
  pikachu: "electricmouse", pika: "electricmouse", electric: "electricmouse", sparky: "electricmouse", roo: "kangaroo", wallaby: "kangaroo", joey: "kangaroo", giraffes: "giraffe", giraf: "giraffe", kitsune: "fox", husky: "wolf", trash: "raccoon", goose: "duck", chick: "duck",
};
// "Red Panda" -> panda, "Golden Retriever" -> dog, "Cats" -> cat. Unknown -> null.
function resolveAnimal(text) {
  const words = String(text || "").toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  for (const w of [...words].reverse()) {
    for (const v of [w, w.replace(/s$/, ""), w.replace(/es$/, "")]) {
      if (ANIMALS[v]) return v;
      if (ANIMAL_ALIASES[v]) return ANIMAL_ALIASES[v];
    }
  }
  return null;
}
// Riders with no animal (or one the page can't draw) get Pac-Man.
function animalFor(r) {
  const chosen = resolveAnimal(r.animal);
  return { kind: chosen || "pacman", typed: r.animal || "" };
}
const MEDAL_SVG = (place, o) => `<path d="M44 100 L48 116 L52 100" fill="none" stroke="#1d1a16" stroke-width="2"/><circle cx="48" cy="120" r="7" fill="${MEDAL[place]}" ${o}/><text x="48" y="123.5" text-anchor="middle" font-size="9" font-weight="700" fill="#1d1a16" font-family="Barlow Condensed, sans-serif">${place + 1}</text>`;
function pacmanSvg(r, place) {
  const o = 'stroke="#1d1a16" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  const kit = place === 0 ? "#f2c200" : KIT[hashName(r.name + "kit") % KIT.length];
  return `<svg class="avatar" viewBox="0 0 130 132" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="Pac-Man for ${esc(r.name)}">
    <path d="M16 132 C16 102 36 94 60 94 C84 94 104 102 104 132 Z" fill="${kit}" ${o}/>
    <path d="M52 95 L60 108 L68 95" fill="none" ${o}/><path d="M60 108 V132" ${o}/>
    <path d="M42 112 L36 132 M78 112 L84 132" stroke="#fff" stroke-width="3" opacity=".55"/>
    <path d="M60 58 L91 41 A35 35 0 1 0 91 75 Z" fill="#ffd400" ${o}/>
    <circle cx="58" cy="38" r="4.6" fill="#1d1a16"/>
    <circle cx="104" cy="58" r="4.5" fill="#ffb3a8" ${o}/><circle cx="121" cy="58" r="4.5" fill="#ffb3a8" ${o}/>
    ${place >= 0 ? MEDAL_SVG(place, o) : ""}
  </svg>`;
}
// Panda: flat kawaii style (solid black limbs and ears, thin outline on white, tilted eye
// patches, pink blush), waving with the beer in its raised paw.
function pandaSvg(r, place) {
  const ink = "#111111";
  const line = `stroke="${ink}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  const kit = place === 0 ? "#f2c200" : KIT[hashName(r.name + "kit") % KIT.length];
  const medal = place >= 0 ? `<path d="M56 92 L60 104 L64 92" fill="none" stroke="${ink}" stroke-width="1.6"/><circle cx="60" cy="108" r="6.5" fill="${MEDAL[place]}" ${line}/><text x="60" y="111.2" text-anchor="middle" font-size="8.5" font-weight="700" fill="${ink}" font-family="Barlow Condensed, sans-serif">${place + 1}</text>` : "";
  return `<svg class="avatar" viewBox="0 0 130 132" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="Cartoon panda for ${esc(r.name)}">
    <rect x="45" y="112" width="13" height="20" rx="6" fill="${ink}"/><rect x="66" y="112" width="13" height="20" rx="6" fill="${ink}"/>
    <ellipse cx="62" cy="105" rx="25" ry="22" fill="#fff" ${line}/>
    <path d="M40 92 C46 84 56 82 62 82 C70 82 80 84 86 92 C80 96 72 94 62 94 C52 94 44 96 40 92 Z" fill="${ink}"/>
    <path d="M84 88 C92 92 96 106 94 118 C93 122 86 122 86 118 C86 108 82 100 78 94 Z" fill="${ink}"/>
    <path d="M44 92 C36 84 26 70 20 56 C18 50 26 46 30 51 C36 62 44 74 52 86 Z" fill="${ink}"/>
    <g transform="rotate(-14 22 40)"><path d="M33 34 C40 34 40 48 33 48" fill="none" stroke="${ink}" stroke-width="2.6"/><rect x="12" y="28" width="21" height="27" rx="3" fill="#e9a23b" ${line}/><path d="M17 33 V50 M22.5 33 V50 M28 33 V50" stroke="#fff" stroke-width="1.5" opacity=".5"/><path d="M10 30 C10 23 16 21 19 24 C21 19 29 19 31 24 C37 22 38 29 35 31 Z" fill="#fffaf0" ${line}/></g>
    <circle cx="25" cy="54" r="6" fill="${ink}"/>
    <circle cx="38" cy="31" r="11" fill="${ink}"/><circle cx="88" cy="31" r="11" fill="${ink}"/>
    <ellipse cx="63" cy="56" rx="31" ry="27" fill="#fff" ${line}/>
    <path d="M50 81 L76 81 L63 93 Z" fill="${kit}" ${line}/>
    <ellipse cx="50" cy="57" rx="7.5" ry="10" transform="rotate(32 50 57)" fill="${ink}"/>
    <ellipse cx="76" cy="57" rx="7.5" ry="10" transform="rotate(-32 76 57)" fill="${ink}"/>
    <ellipse cx="51.5" cy="54.5" rx="2.6" ry="3" fill="#fff"/><ellipse cx="74.5" cy="54.5" rx="2.6" ry="3" fill="#fff"/>
    <ellipse cx="44" cy="68" rx="6" ry="4.6" fill="#f7a8b0"/><ellipse cx="82" cy="68" rx="6" ry="4.6" fill="#f7a8b0"/>
    <path d="M60.5 64 H65.5 C65.5 66.5 63 67.6 63 67.6 C63 67.6 60.5 66.5 60.5 64 Z" fill="${ink}"/>
    <path d="M57.5 69 Q60.2 72.4 63 69.4 Q65.8 72.4 68.5 69" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>
    ${medal}
  </svg>`;
}
function avatarSvg(r, place, kind) {
  if (kind === "pacman") return pacmanSvg(r, place);
  if (kind === "panda") return pandaSvg(r, place);
  const a = ANIMALS[kind];
  const kit = place === 0 ? "#f2c200" : KIT[hashName(r.name + "kit") % KIT.length];
  const o = 'stroke="#1d1a16" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  const x = (k) => a.extras.includes(k);
  const earFill = a.earFill || a.base;
  const ears = {
    pointy: `<path d="M35 46 L31 16 L55 34 Z" fill="${earFill}" ${o}/><path d="M85 46 L89 16 L65 34 Z" fill="${earFill}" ${o}/><path d="M38 40 L36 24 L49 34 Z" fill="${a.inner}"/><path d="M82 40 L84 24 L71 34 Z" fill="${a.inner}"/>`,
    round: `<circle cx="38" cy="36" r="11" fill="${earFill}" ${o}/><circle cx="82" cy="36" r="11" fill="${earFill}" ${o}/><circle cx="38" cy="36" r="5.5" fill="${a.inner}"/><circle cx="82" cy="36" r="5.5" fill="${a.inner}"/>`,
    fluffy: `<circle cx="34" cy="40" r="15" fill="${a.base}" ${o}/><circle cx="86" cy="40" r="15" fill="${a.base}" ${o}/><circle cx="34" cy="41" r="8" fill="${a.inner}"/><circle cx="86" cy="41" r="8" fill="${a.inner}"/>`,
    tipped: `<path d="M40 42 C30 30 26 14 24 4 C34 8 46 22 50 36 Z" fill="${a.base}" ${o}/><path d="M80 42 C90 30 94 14 96 4 C86 8 74 22 70 36 Z" fill="${a.base}" ${o}/><path d="M24 4 C27 10 29 15 31 20 C34 14 30 8 24 4 Z M96 4 C93 10 91 15 89 20 C86 14 90 8 96 4 Z" fill="${a.dark}" ${o}/>`,
    tall: `<path d="M40 44 C30 30 32 8 40 6 C48 8 50 30 48 40 Z" fill="${a.base}" ${o}/><path d="M80 44 C90 30 88 8 80 6 C72 8 70 30 72 40 Z" fill="${a.base}" ${o}/><path d="M41 36 C36 26 37 14 40 12 C44 14 45 26 45 34 Z" fill="${a.inner}"/><path d="M79 36 C84 26 83 14 80 12 C76 14 75 26 75 34 Z" fill="${a.inner}"/>`,
    big: `<circle cx="34" cy="34" r="15" fill="${a.base}" ${o}/><circle cx="86" cy="34" r="15" fill="${a.base}" ${o}/><circle cx="34" cy="34" r="9" fill="${a.inner}"/><circle cx="86" cy="34" r="9" fill="${a.inner}"/>`,
    long: `<ellipse cx="48" cy="14" rx="8" ry="22" fill="${a.base}" ${o}/><ellipse cx="72" cy="14" rx="8" ry="22" fill="${a.base}" ${o}/><ellipse cx="48" cy="16" rx="3.5" ry="15" fill="${a.inner}"/><ellipse cx="72" cy="16" rx="3.5" ry="15" fill="${a.inner}"/>`,
    floppy: "",
    side: `<ellipse cx="30" cy="52" rx="11" ry="6" transform="rotate(-20 30 52)" fill="${a.base}" ${o}/><ellipse cx="90" cy="52" rx="11" ry="6" transform="rotate(20 90 52)" fill="${a.base}" ${o}/>`,
    monkey: `<circle cx="32" cy="58" r="10" fill="${a.base}" ${o}/><circle cx="88" cy="58" r="10" fill="${a.base}" ${o}/><circle cx="32" cy="58" r="5" fill="${a.inner}"/><circle cx="88" cy="58" r="5" fill="${a.inner}"/>`,
    tufts: `<path d="M38 40 L34 22 L50 34 Z" fill="${a.dark}" ${o}/><path d="M82 40 L86 22 L70 34 Z" fill="${a.dark}" ${o}/>`,
    none: "",
  }[a.ear];
  const behind = (x("mane") ? [0, 40, 80, 120, 160, 200, 240, 280, 320].map(d => `<circle cx="${60 + 30 * Math.cos(d * Math.PI / 180)}" cy="${58 + 30 * Math.sin(d * Math.PI / 180)}" r="13" fill="${a.inner}" ${o}/>`).join("") : "")
    + (x("wool") ? [200, 230, 260, 290, 320, 350, 20].map(d => `<circle cx="${60 + 26 * Math.cos(d * Math.PI / 180)}" cy="${56 + 24 * Math.sin(d * Math.PI / 180)}" r="11" fill="${a.light}" ${o}/>`).join("") : "")
    + (x("unimane") ? `<path d="M84 34 C100 44 98 70 90 86 C86 70 84 56 78 46 Z" fill="#c89bf0" ${o}/><path d="M86 52 C96 60 96 74 92 82" fill="none" stroke="#7fd3f5" stroke-width="5"/>` : "")
    + (x("horsemane") ? `<path d="M84 34 C98 44 96 70 90 86 C86 70 84 56 78 46 Z" fill="${a.dark}" ${o}/>` : "");
  const head = a.muzzle === "horse"
    ? `<path d="M36 50 C36 28 84 28 84 50 C84 64 78 70 76 84 C72 92 48 92 44 84 C42 70 36 64 36 50 Z" fill="${a.base}" ${o}/>`
    : a.muzzle === "penguin"
    ? `<ellipse cx="60" cy="60" rx="27" ry="28" fill="${a.base}" ${o}/><path d="M60 44 C68 36 80 44 78 58 C76 72 66 82 60 84 C54 82 44 72 42 58 C40 44 52 36 60 44 Z" fill="${a.light}"/>`
    : `<ellipse cx="60" cy="60" rx="27" ry="28" fill="${a.base}" ${o}/>`;
  const floppy = a.ear === "floppy" ? `<path d="M37 40 C24 42 22 66 30 74 C36 70 40 56 42 46 Z" fill="${a.inner}" ${o}/><path d="M83 40 C96 42 98 66 90 74 C84 70 80 56 78 46 Z" fill="${a.inner}" ${o}/>` : "";
  const marks = (x("stripes") ? `<path d="M54 35 L56 43 M60 34 L60 43 M66 35 L64 43" stroke="${a.dark}" stroke-width="3" stroke-linecap="round"/>` : "")
    + (x("tigerstripes") ? `<path d="M52 34 L55 44 M60 33 L60 44 M68 34 L65 44 M34 56 L44 58 M35 64 L43 64 M86 56 L76 58 M85 64 L77 64" stroke="${a.dark}" stroke-width="3.2" stroke-linecap="round"/>` : "")
    + (x("giraffespots") ? `<path d="M42 44 l6 -3 l4 5 l-5 5 l-6 -2 Z M68 40 l7 -1 l2 6 l-6 4 l-4 -4 Z M74 56 l6 0 l1 6 l-6 2 Z M40 58 l5 -2 l3 5 l-5 3 Z M56 38 l5 -2 l3 4 l-4 4 l-4 -2 Z" fill="${a.dark}"/>` : "")
    + (x("spots") ? `<path d="M40 40 C46 34 54 38 50 46 C46 52 38 48 40 40 Z M72 44 C78 38 86 44 82 52 C78 56 70 52 72 44 Z" fill="${a.dark}"/>` : "")
    + (x("patches") ? `<ellipse cx="49" cy="58" rx="7" ry="9" transform="rotate(25 49 58)" fill="${a.dark}"/><ellipse cx="71" cy="58" rx="7" ry="9" transform="rotate(-25 71 58)" fill="${a.dark}"/>` : "")
    + (x("mask") ? `<path d="M36 56 C42 48 54 52 60 56 C66 52 78 48 84 56 C80 66 68 66 60 62 C52 66 40 66 36 56 Z" fill="${a.dark}"/>` : "");
  const light = a.muzzle === "penguin" || x("patches") || x("mask");
  const eyes = a.muzzle === "frog"
    ? `<circle cx="46" cy="38" r="10" fill="${a.base}" ${o}/><circle cx="74" cy="38" r="10" fill="${a.base}" ${o}/><circle cx="46" cy="38" r="6.5" fill="#fff"/><circle cx="74" cy="38" r="6.5" fill="#fff"/><circle cx="47" cy="39" r="3.4" fill="#1d1a16"/><circle cx="75" cy="39" r="3.4" fill="#1d1a16"/>`
    : a.muzzle === "owl"
    ? `<circle cx="49" cy="56" r="11" fill="${a.light}" ${o}/><circle cx="71" cy="56" r="11" fill="${a.light}" ${o}/><circle cx="49" cy="57" r="5" fill="#1d1a16"/><circle cx="71" cy="57" r="5" fill="#1d1a16"/><circle cx="50.5" cy="55.5" r="1.6" fill="#fff"/><circle cx="72.5" cy="55.5" r="1.6" fill="#fff"/>`
    : `<circle cx="50" cy="58" r="3.6" fill="${light ? "#fff" : "#1d1a16"}"/><circle cx="70" cy="58" r="3.6" fill="${light ? "#fff" : "#1d1a16"}"/>${light ? `<circle cx="50.6" cy="58.4" r="2" fill="#1d1a16"/><circle cx="70.6" cy="58.4" r="2" fill="#1d1a16"/>` : `<circle cx="51" cy="57" r="1.1" fill="#fff"/><circle cx="71" cy="57" r="1.1" fill="#fff"/>`}`;
  const smile = `<path d="M54 74 Q57 77.5 60 74 Q63 77.5 66 74" fill="none" ${o}/>`;
  const muzzle = {
    cat: `<circle cx="55" cy="70" r="6.5" fill="${a.light}"/><circle cx="65" cy="70" r="6.5" fill="${a.light}"/><path d="M56 64 H64 L60 69 Z" fill="#e8798f" ${o}/>${smile}`,
    fox: `<path d="M38 60 C46 64 54 66 60 76 C66 66 74 64 82 60 C80 76 70 86 60 86 C50 86 40 76 38 60 Z" fill="${a.light}"/><ellipse cx="60" cy="68" rx="5" ry="3.6" fill="#1d1a16"/>${smile}`,
    dog: `<ellipse cx="60" cy="71" rx="14" ry="11" fill="${a.light}" ${o}/><ellipse cx="60" cy="65" rx="5.5" ry="4" fill="#1d1a16"/><path d="M60 69 V73" ${o}/>${smile}${x("tongue") ? `<path d="M56 76 C56 84 64 84 64 76 Z" fill="#e8798f" ${o}/>` : ""}`,
    bear: `<ellipse cx="60" cy="70" rx="12" ry="9.5" fill="${a.light}" ${o}/><ellipse cx="60" cy="66" rx="5" ry="3.6" fill="#1d1a16"/>${smile}`,
    koala: `<ellipse cx="60" cy="66" rx="7" ry="9" fill="${a.dark}" ${o}/><path d="M54 78 Q60 82 66 78" fill="none" ${o}/>`,
    mouse: `<circle cx="60" cy="68" r="3.4" fill="#e8798f" ${o}/>${smile}`,
    rabbit: `<path d="M57 64 H63 L60 68 Z" fill="#e8798f" ${o}/><path d="M60 68 V72" ${o}/>${smile}<rect x="56.5" y="75" width="7" height="6" rx="1" fill="#fff" ${o}/>`,
    pig: `<ellipse cx="60" cy="69" rx="11" ry="8" fill="${a.light}" ${o}/><ellipse cx="56" cy="69" rx="2" ry="3" fill="${a.dark}"/><ellipse cx="64" cy="69" rx="2" ry="3" fill="${a.dark}"/><path d="M54 80 Q60 84 66 80" fill="none" ${o}/>`,
    cow: `<ellipse cx="60" cy="74" rx="17" ry="10" fill="${a.light}" ${o}/><ellipse cx="54" cy="73" rx="2.4" ry="3.2" fill="#b8566f"/><ellipse cx="66" cy="73" rx="2.4" ry="3.2" fill="#b8566f"/>`,
    monkey: `<path d="M60 52 C66 44 80 48 78 62 C78 76 68 84 60 84 C52 84 42 76 42 62 C40 48 54 44 60 52 Z" fill="${a.light}"/><ellipse cx="57" cy="68" rx="1.6" ry="2.2" fill="#1d1a16"/><ellipse cx="63" cy="68" rx="1.6" ry="2.2" fill="#1d1a16"/><path d="M52 75 Q60 82 68 75" fill="none" ${o}/>`,
    frog: `<path d="M42 70 Q60 86 78 70" fill="none" ${o}/><circle cx="44" cy="66" r="4" fill="#ff7b7b" opacity=".45"/><circle cx="76" cy="66" r="4" fill="#ff7b7b" opacity=".45"/>`,
    owl: `<path d="M55 64 L65 64 L60 74 Z" fill="#f2a33a" ${o}/><path d="M44 72 C50 82 70 82 76 72" fill="none" stroke="${a.light}" stroke-width="3"/>`,
    penguin: `<path d="M53 66 L67 66 L60 74 Z" fill="#f2a33a" ${o}/>`,
    duck: `<ellipse cx="60" cy="70" rx="15" ry="6.5" fill="#f28c28" ${o}/><path d="M47 70 H73" stroke="#1d1a16" stroke-width="1.6"/>`,
    sheep: `<ellipse cx="60" cy="68" rx="9" ry="7" fill="#3a332d"/><path d="M57 66 H63" stroke="#fff" stroke-width="1.6"/>`,
    electric: `<path d="M58.5 65 H61.5 L60 67 Z" fill="#1d1a16" ${o}/><path d="M53 71 Q60 80 67 71 Q60 74 53 71 Z" fill="#c2453b" ${o}/>`,
    horse: `<ellipse cx="60" cy="78" rx="15" ry="10" fill="${a.light}" ${o}/><ellipse cx="55" cy="78" rx="2" ry="3" fill="${a.dark}"/><ellipse cx="65" cy="78" rx="2" ry="3" fill="${a.dark}"/>`,
  }[a.muzzle];
  const top = (x("horns") ? `<path d="M42 36 C38 28 40 22 46 22 C44 28 46 32 48 34 Z M78 36 C82 28 80 22 74 22 C76 28 74 32 72 34 Z" fill="#f6e7c1" ${o}/>` : "")
    + (x("ossicones") ? `<path d="M50 34 L48 16 M70 34 L72 16" stroke="${a.base}" stroke-width="6" stroke-linecap="round"/><path d="M50 34 L48 16 M70 34 L72 16" stroke="#1d1a16" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0"/><circle cx="48" cy="15" r="5" fill="${a.dark}" ${o}/><circle cx="72" cy="15" r="5" fill="${a.dark}" ${o}/>` : "")
    + (x("horn") ? `<path d="M56 32 L60 6 L64 32 Z" fill="#ffd76a" ${o}/><path d="M57 26 L63 24 M58 19 L62 17" stroke="#c98d3e" stroke-width="1.6"/>` : "")
    + (x("tuft") ? `<path d="M56 34 C54 26 60 24 60 32 C62 24 68 26 64 34 Z" fill="${a.base}" ${o}/>` : "");
  const joey = x("joey") ? `<path d="M64 132 V116 C64 110 92 110 92 116 V132 Z" fill="${a.light}" ${o}/><circle cx="78" cy="110" r="8" fill="${a.base}" ${o}/><path d="M72 104 L70 94 L76 102 Z M84 104 L86 94 L80 102 Z" fill="${a.base}" ${o}/><circle cx="75.5" cy="109" r="1.6" fill="#1d1a16"/><circle cx="80.5" cy="109" r="1.6" fill="#1d1a16"/><ellipse cx="78" cy="113" rx="2" ry="1.4" fill="#1d1a16"/>` : "";
  const spark = x("sparkcheeks") ? `<circle cx="40" cy="69" r="6.5" fill="#e8463a" ${o}/><circle cx="80" cy="69" r="6.5" fill="#e8463a" ${o}/><path d="M30 64 L26 61 M29 70 L24 70 M90 64 L94 61 M91 70 L96 70" stroke="#ffb800" stroke-width="2" stroke-linecap="round"/>` : "";
  const tail = x("bolttail") ? `<path d="M30 118 L14 104 L22 100 L6 80 L12 78 L2 58 L26 80 L18 84 L34 100 L26 102 L38 112 Z" fill="${a.base}" ${o}/><path d="M30 118 L24 112 L32 110 Z" fill="#9a5a26"/>` : "";
  const whiskers = x("whiskers") ? `<path d="M44 68 L32 66 M44 72 L32 74 M76 68 L88 66 M76 72 L88 74" stroke="#1d1a16" stroke-width="1.4" stroke-linecap="round"/>` : "";
  const cheeks = ["frog", "owl", "penguin", "duck", "electric"].includes(a.muzzle) ? "" : `<circle cx="42" cy="68" r="4" fill="#ff7b7b" opacity=".35"/><circle cx="78" cy="68" r="4" fill="#ff7b7b" opacity=".35"/>`;
  return `<svg class="avatar" viewBox="0 0 130 132" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="Cartoon ${esc(a.label || kind)} for ${esc(r.name)}">
    ${tail}
    <path d="M16 132 C16 102 36 94 60 94 C84 94 104 102 104 132 Z" fill="${kit}" ${o}/>
    <path d="M52 95 L60 108 L68 95" fill="none" ${o}/><path d="M60 108 V132" ${o}/>
    <path d="M42 112 L36 132 M78 112 L84 132" stroke="#fff" stroke-width="3" opacity=".55"/>
    <rect x="52" y="80" width="16" height="16" fill="${a.base}" ${o}/>
    ${behind}${ears}${head}${floppy}${marks}${top}${cheeks}${eyes}${muzzle}${spark}${whiskers}${joey}
    ${place >= 0 ? MEDAL_SVG(place, o) : ""}
    <g transform="rotate(-12 108 96)"><path d="M118 88 C126 88 126 104 118 104" fill="none" stroke="#1d1a16" stroke-width="3"/><rect x="96" y="82" width="22" height="30" rx="3" fill="#e9a23b" ${o}/><path d="M101 88 V106 M107 88 V106 M113 88 V106" stroke="#fff" stroke-width="1.6" opacity=".45"/><path d="M94 84 C94 76 100 74 104 77 C106 72 114 72 116 77 C122 75 124 82 120 85 Z" fill="#fffaf0" ${o}/></g>
  </svg>`;
}
const labelFor = (kind) => kind === "pacman" ? "Pac-Man" : (ANIMALS[kind] && ANIMALS[kind].label) || kind;
return { labelFor, ANIMALS, ANIMAL_ALIASES, resolveAnimal, animalFor, draw: avatarSvg, hashName };
})();
if (typeof module !== "undefined") module.exports = BikeBrewsAvatars;
