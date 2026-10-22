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
| `src/main.js` | The GSAP choreography, ported from the original: nav intro, the pinned timeline (`end: +=2000%`), the insurance-vertical icon loop, the toggle, the three steps, the laptop show-off and the "Let's start now" reveal. Plus the additions listed below. |
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

## What was added on top of the original

- **Lenis smooth scrolling** (lerp 0.2), ticked by GSAP, with the timeline scrub at 0.8.
- **Hero intro**: the title characters rise in with a stagger, then the copy, the
  button, the phone and the glow.
- **Smoother eases**: the timeline default is `power2.inOut` instead of `sine.in`.
- **Idle float and mouse parallax** on the phone group, driven through CSS
  `translate` custom properties so they never fight GSAP's transforms.
- **Progress dots** (`.xp-progress`) with a label per state. They appear while the
  section is pinned, highlight the current state and jump to it on click.
- **Centred phone screens**: the logo, sign-up form, sold-card stack and toggle
  are centred inside the phone instead of being anchored 24% from the left.
- **No gap after the footer**: the laptop is reset to scale 1 once it has faded
  out, so its 10× size no longer stretches the page.
- **Mobile reveals**: headings, copy and images fade up as they enter.
