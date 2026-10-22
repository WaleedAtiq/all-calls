# AllCalls.io — scroll-driven landing page

A static port of the AllCalls.io landing page (allcalls-next.vercel.app) built with
Vite, vanilla JS and GSAP (ScrollTrigger + SplitText).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## How it is put together

| Path | What it is |
| --- | --- |
| `reference/` | Markup and CSS captured from the original site: the pinned desktop section (with its two inline SVG phones), the nav, the footer, the stacked mobile sections, and the Chakra/emotion stylesheets. |
| `scripts/port-reference.mjs` | Assembles `index.html` and `src/vendor/reference.css` from `reference/`, stripping everything GSAP wrote at runtime so the page starts in its authored state. Re-run it if you edit the reference files. |
| `src/main.js` | The GSAP choreography, ported one-to-one from the original: nav intro, the pinned timeline (`end: +=2000%`, `scrub: 2`), the insurance-vertical icon loop, the toggle, the three steps, the laptop show-off and the "Let's start now" reveal. |
| `src/style.css` | Font variables and the ≥1366px switch between the desktop experience and the stacked mobile layout. |
| `public/assets/` | Images, the laptop SVG, the avatar PNGs and the SF Pro Text font from the original site. |

## Desktop vs mobile

Exactly like the original, the page renders one of two experiences:

- **≥ 1366px** — `.xp-desktop`: one section is pinned for 20 viewport heights of
  scroll while a single timeline drives every state (incoming call → quality
  calls with the five verticals → avatars → sold cards → on/off toggle → sign-up
  steps → laptop → start now).
- **< 1366px** — `.xp-mobile`: the stacked layout using the phone renders.

The switch is CSS (`display`) plus `gsap.matchMedia`, so resizing across the
breakpoint tears down and rebuilds the timeline cleanly.
