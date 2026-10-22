# AllCalls.io — scroll-driven landing page (one pinned phone)

Vite + vanilla JS + [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).
A rebuild of the sections on allcalls-next.vercel.app where the five separate
phone images are replaced by **one phone** that stays pinned while you scroll.
Each scroll step slides the phone to a new position, tilts it, crossfades the
screen inside it, and swaps the copy beside it.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Files

| File | What it does |
| --- | --- |
| `index.html` | Nav, the pinned `.story` section (phone + 5 `.screen`s + 5 `.feature` copy blocks + orbit layers), 3 steps, "Let's start now", footer. |
| `src/style.css` | Design tokens (black, Figtree 900 uppercase headings, blue→cyan gradient), CSS phone frame, every mock screen, responsive rules under 900px. |
| `src/main.js` | GSAP: load intro, the pinned scrubbed story timeline, below-the-fold reveals. |

## The phone states

`STATES` in `src/main.js` drives everything. One entry per step:

| # | Screen | Phone position | Copy |
| --- | --- | --- | --- |
| 0 | Incoming call | right, 80% | "Your next sale is just a call away" + CTA |
| 1 | Dark + floating insurance icons | centre | "Delivering quality calls across the industry" |
| 2 | Incoming call + client avatars | left | "Instantly connect with new clients on demand." |
| 3 | Leads list ("Policy Sold") | centre, 100% | caption above |
| 4 | Logo + on/off toggle + wave rings | right, 70% | "Turn on the app… / Turn it off…" |

`x` is the horizontal offset in vw (0 on mobile), `scale` the phone scale,
`glow` the halo opacity, `orbit` an optional layer that floats outside the
phone, `tilt` the rotateY used while the phone travels.

To add a step: add a `.screen[data-screen=N]`, a `.feature[data-feature=N]`,
a `.dot`, and an entry in `STATES`. The pin length and timeline adapt.

## Swapping in real assets

- **Logo**: `#logo-mark` is an inline SVG approximation. Replace the `<symbol>`
  in `index.html` with the real mark, or drop an `<img>` into `.logo`.
- **Screens**: each `.screen` is plain HTML/CSS. To use exported images
  instead, put them in `public/screens/` and replace a screen's inner markup
  with `<img src="/screens/x.png">` plus `object-fit: cover`.
- **Background glows**: `.glow` and `.start__bg` are CSS radial gradients;
  swap for the original `glow-circle.png` / `start-bg.png` if you prefer.
