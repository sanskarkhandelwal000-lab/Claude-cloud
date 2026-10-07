# DANDIYAARA — Navratri After Dark

Launch print and social designs for **NEISH presents DANDIYAARA**, held on Saturday 17 October 2026 from 4 PM at Magique, Bengaluru.

## Deliverables (`exports/`)

| File | Use |
|---|---|
| `01_Poster_A4_Print_2480x3508.png` / `08_Poster_A4_Print.pdf` | Main poster, A4 at 300 dpi (also scales to A3) |
| `02_Poster_Instagram_Feed_2160x2700.png` | Instagram / Facebook feed post, 4:5 |
| `03_Poster_Instagram_Story_2160x3840.png` | Stories / Reels cover, 9:16, text kept inside the safe zones |
| `04_Intro_Teaser_Instagram_2160x2700.png` | Intro / teaser post ("save the night"), to post before the full reveal |
| `05_`, `06_Flyer_A5_*`, `07_Flyer_A5_Print_FrontBack.pdf` | A5 two-sided flyer, 300 dpi |

## Design system

- **Concept:** a top-down view of a garba circle. Dandiya sticks form the rays, mirror-work (abhla) and lotus petals form the rings, and a crescent moon sits at the centre for "After Dark". The 4 PM start becomes the line *"from golden hour, till after dark"*.
- **Type:** Cinzel Decorative Black for the title, in gold foil to match the reference. Cinzel is used for headings, Bodoni Moda for numerals, Jost for small caps and Pinyon Script for the script accents.
- **Colour:** midnight `#0A0611`, wine `#5C0F35`, rani pink `#FF2D7A`, marigold `#FFB72B`, and a gold foil gradient running from `#FFF1C1` to `#C08A2C`.
- **Texture:** bandhani dot field, toran on the poster top edge, lens bokeh, film grain and a vignette.

## Before printing, replace or confirm

- The QR placeholder on the flyer back.
- "LIMITED PASSES / BOOK NOW / LINK IN BIO". Add the real ticketing link or handle.
- The "DHOL" pillar and the four "What awaits" items on the flyer back. These are copy suggestions; keep only what is actually happening.
- Venue spelling: **Magique**.

## Editing and re-rendering

The designs are HTML/SVG in `src/`, and Chromium renders them to exact pixel sizes. To edit copy, change the text in the HTML, then run:

```bash
NODE_PATH=$(npm root -g) node render.js src/poster.html exports/01_Poster_A4_Print_2480x3508.png 1240 1754 2480 a4
# formats: poster.html#a4 | #feed (1240x1550) | #story (1240x2205); flyer.html#front | #back (1240x1759 -> 1748px); teaser.html (1240x1550)
```

To finish the files in Photoshop, place the PNGs as Smart Objects.
