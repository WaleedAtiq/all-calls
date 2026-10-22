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

## Assets

Everything in `public/assets/images/` comes from the original AllCalls.io site
(allcalls-next): the logo, the five iPhone renders, and the glow backgrounds.

The five renders have the phone frame at different positions and sizes, so each
one is wrapped in a `.layer` whose `--iw` / `--ix` / `--iy` custom properties
scale and offset the image until its frame sits exactly on the `.phone` box
(ratios measured from the PNGs: image width ÷ frame width, and the frame's
x/y offset ÷ frame width). Layer 0 (`iphone-12-sale`) is always visible and acts
as the phone body; the others crossfade on top of it, each with a solid black
screen backing so the base never bleeds through.

## Smooth scrolling

[Lenis](https://github.com/darkroomengineering/lenis) drives the scroll and is
ticked by GSAP, with `ScrollTrigger.update` wired to its scroll event. The pinned
timeline uses `scrub: 1`; each step is a hold followed by a ~2-unit transition
(see `HOLD` in `src/main.js`). Everything animated is transform/opacity only.
