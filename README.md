# The Petrodollar Paradox — ₹95.96 = $1

An interactive web explainer on why the Indian rupee keeps falling even as the US prints trillions of dollars. Covers the petrodollar system, how USD printing actually works, and the six factors that move the rupee.

**Live site:** [sinhaankur.github.io/Petrodollar-Paradox](https://sinhaankur.github.io/Petrodollar-Paradox/)

## What's inside

- **Hero** — the headline rate and the puzzle that frames the story
- **Timeline reel** — interactive 2000 → 2026 chart of US M2 vs USD/INR
- **How USD printing works** — the 4-step mechanism (QE → bank lending → carry trade → reversal)
- **Six factors** — Fed policy, oil, FII flows, DXY, current account, RBI intervention
- **The three layers** — dollar as world plumbing, the petrodollar engine, why India sits at the wrong end
- **The Globe** — the petrodollar system mapped onto real geography. A 2D SVG world map (default) with animated oil/dollar/recycling flow arcs and 14 curated countries, plus an opt-in **3D globe** (drag to rotate, scroll to zoom, tap a country). Toggle 2D/3D; filter by flow type.
- **Four forces firing now** — oil dependency, Iran conflict, capital flight, strong dollar
- **Value simulator** — move sliders for oil, DXY, FII, Fed rate, RBI defense; see the projected USD/INR, a contribution breakdown, and the formula
- **Cross-currency scoreboard** — how 15 other currencies respond to the same forces
- **Changing the world order** — a de-dollarization simulator (oil pricing, reserves, payment rails, time horizon)
- **The Way Out** — a solutions engine: toggle real policy/structural levers (oil de-dollarization, rupee invoicing, export growth, sticky FDI, reserve buffers, gold) and watch how far they could stabilize the rupee, with a contribution breakdown and verdict
- **Impact chain** — how rupee weakness reaches households, firms, and reserves
- **The one upside** — IT/pharma exporters quietly benefit
- **Share as a reel** — auto-built 30s portrait video summarising the story, narrated in your chosen language (browser TTS, or Sarvam AI with a key)
- **References & data** — every figure with its source and last-verified date

## Stack

Pure HTML / CSS / vanilla JS. No build step. The base page has no dependencies beyond Google Fonts.

The only optional dependency is [Three.js](https://threejs.org/) for the 3D globe — it's **lazy-loaded from a CDN (ES-module build) only when the user opts into the 3D view**, so the default page stays dependency-free and fast. If WebGL is unavailable, the 3D view falls back to the always-on 2D map.

### Accessibility

- Visible keyboard focus (`:focus-visible`) on all interactive controls
- Full `prefers-reduced-motion` support: CSS animations/transitions and SMIL SVG animations are disabled, the hero counters snap to their final value, and the globe stops auto-rotating and animating flows
- Interactive map markers are keyboard-navigable (Tab + Enter/Space)
- Multilingual: 10 languages (English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi) selectable from the navbar. The navigation, every section label, headline, and lede is translated via a `data-i18n` dictionary; the longer body prose (card copy, factor write-ups, references) stays in English by design, and any string a dictionary happens to miss falls back to English gracefully. Translations for the non-English languages are a machine-assisted first pass — a native-speaker proofread of the financial phrasing is recommended, especially for Tamil, Telugu, Malayalam and Punjabi. The `scripts/merge-translations.js` one-off documents how the dictionaries were populated.

## Deploy to GitHub Pages

1. Push to GitHub: `git push origin main`
2. On GitHub: `Settings → Pages → Build and deployment`
3. Source: **Deploy from a branch**, Branch: **main**, Folder: **/ (root)**
4. Save. Site goes live at `https://<user>.github.io/Indian-Rupees/` within a minute or two.

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Files

- `index.html` — page structure and content
- `styles.css` — design system, colors, layout
- `script.js` — counter animations, timeline reel, simulators, globe, i18n
- `assets/` — Open Graph share image (`og-image.png` / `.svg`)
- `scripts/merge-translations.js` — one-off that documents how the i18n dictionaries were populated
- `.nojekyll` — tells GitHub Pages to skip Jekyll processing

---

Educational explainer. Not investment advice. Data referenced as of May 14, 2026.
