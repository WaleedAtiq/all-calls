import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "./style.css";

gsap.registerPlugin(ScrollTrigger);
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

/* ---------------------------------------------------------
   Smooth scrolling (Lenis) driven by GSAP's ticker
   --------------------------------------------------------- */
const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = a.getAttribute("href");
    if (target.length > 1 && document.querySelector(target)) { e.preventDefault(); lenis.scrollTo(target, { offset: -20 }); }
  });
});

const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

/* ---------------------------------------------------------
   Phone states — one per section the phone passes through.
   x: offset from centre (vw, 0 on mobile), scale: phone scale,
   glow / mobileGlow: halo opacities, tilt: rotateY while travelling.
   --------------------------------------------------------- */
const STATES = [
  { x:  24, y:  0, scale: .85, glow: .55, mobileGlow: 0,   tilt: -10 }, // 0 hero: incoming call
  { x:   4, y:  0, scale: 1.0, glow: .25, mobileGlow: 0,   tilt:   8 }, // 1 quality calls (icons baked in)
  { x: -26, y:  0, scale: .90, glow: .40, mobileGlow: 0,   tilt:  -8 }, // 2 instantly connect (avatars baked in)
  { x:   0, y: 140, scale: 1.05, glow: 0, mobileGlow: .35, tilt:   0 }, // 3 leads list (sits lower, cropped by the fold)
  { x:  22, y:  0, scale: .80, glow: .20, mobileGlow: 0,   tilt:   8 }, // 4 on / off (rings baked in)
];
const STEPS = STATES.length;

const layers   = gsap.utils.toArray(".layer");
const features = gsap.utils.toArray(".feature");
const dots     = gsap.utils.toArray(".dot");

const vw = (n) => () => (isMobile() ? 0 : (window.innerWidth * n) / 100);
const sc = (n) => () => (isMobile() ? 1 : n);
const py = (n) => () => (isMobile() ? 0 : n);
const show = (el) => gsap.set(el, { visibility: "visible" });
const hide = (el) => gsap.set(el, { visibility: "hidden" });

/* ---------------------------------------------------------
   1. Intro (on load)
   --------------------------------------------------------- */
gsap.set(".phone-wrap", { x: vw(STATES[0].x), y: py(STATES[0].y), scale: sc(STATES[0].scale), force3D: true });
gsap.set(".glow--circle", { opacity: STATES[0].glow });
gsap.set(features, { opacity: 0, visibility: "hidden" });
gsap.set(features[0], { opacity: 1, visibility: "visible" });

gsap.timeline({ defaults: { ease: "power3.out" } })
  .from(".nav__pill", { y: -40, opacity: 0, duration: .8 })
  .from(features[0].querySelectorAll(".h, .lead, .btn"), { y: 40, opacity: 0, duration: .9, stagger: .1 }, "-=.4")
  .from(".phone", { y: 90, rotateY: -18, opacity: 0, duration: 1.3, force3D: true }, "-=.9")
  .from(".glow--circle", { scale: .6, opacity: 0, duration: 1.6 }, "<");

/* ---------------------------------------------------------
   2. Pinned, scrubbed story
   --------------------------------------------------------- */
const story = gsap.timeline({
  defaults: { ease: "power2.inOut" },
  scrollTrigger: {
    trigger: ".story",
    start: "top top",
    end: () => `+=${(STEPS - 1) * 140}%`,   // 1.4 viewport heights of scroll per step
    pin: ".story__pin",
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate(self) {
      const idx = Math.min(STEPS - 1, Math.round(self.progress * (STEPS - 1)));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    },
  },
});

for (let i = 0; i < STEPS - 1; i++) {
  const next = i + 1;
  const to = STATES[next];
  const L = `s${i}`;
  story.addLabel(L);

  // Durations are relative scroll units: HOLD of stillness, then a ~2.1-unit transition.
  const HOLD = 1.3, T = L + `+=${HOLD}`;
  story.to({}, { duration: HOLD }, L);

  // copy out
  story.to(features[i].querySelector(".feature__inner"), { y: -30, opacity: 0, duration: .6, ease: "power2.in",
    onComplete: () => hide(features[i]), onReverseComplete: () => show(features[i]) }, T);

  // phone travels; tilt into the move and settle
  story.to(".phone-wrap", { x: vw(to.x), y: py(to.y), scale: sc(to.scale), duration: 2, ease: "power2.inOut" }, T + "+.1");
  story.to(".phone", { rotateY: () => (isMobile() ? 0 : to.tilt), duration: 1, ease: "power2.out" }, T + "+.1");
  story.to(".phone", { rotateY: 0, duration: 1, ease: "power2.inOut" }, T + "+1.1");
  story.to(".glow--circle", { opacity: to.glow, duration: 1.6 }, T + "+.1");
  story.to(".glow--mobile", { opacity: to.mobileGlow, duration: 1.6 }, T + "+.1");

  // screen crossfade mid-travel: next fades in on top, previous overlay releases after
  story.to(layers[next], { opacity: 1, duration: 1, ease: "power1.inOut" }, T + "+.6");
  if (i > 0) story.to(layers[i], { opacity: 0, duration: .5 }, T + "+1.4");

  // copy in
  story.fromTo(features[next].querySelector(".feature__inner"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: "power2.out",
    onStart: () => { show(features[next]); gsap.set(features[next], { opacity: 1 }); }, onReverseComplete: () => hide(features[next]) }, T + "+1.3");
}
story.addLabel(`s${STEPS - 1}`);
story.to({}, { duration: 1.3 });

// idle float on the wrapper's parent so it never fights the scroll tweens
gsap.to(".phone-anchor", { y: -8, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });

/* ---------------------------------------------------------
   3. Below the fold
   --------------------------------------------------------- */
gsap.from(".steps__title", { y: 50, opacity: 0, duration: .9, ease: "power3.out",
  scrollTrigger: { trigger: ".steps", start: "top 75%", once: true } });
gsap.from(".steps__list li", { x: -40, opacity: 0, stagger: .15, duration: .7, ease: "power3.out",
  scrollTrigger: { trigger: ".steps__list", start: "top 80%", once: true } });

gsap.from(".start__inner > *", { y: 40, opacity: 0, stagger: .15, duration: .9, ease: "power3.out",
  scrollTrigger: { trigger: ".start", start: "top 70%", once: true } });
gsap.fromTo(".start__bg", { scale: 1.15, opacity: .5 }, { scale: 1, opacity: 1, ease: "none",
  scrollTrigger: { trigger: ".start", start: "top bottom", end: "center center", scrub: true } });

gsap.from(".footer__card", { y: 40, opacity: 0, duration: .9, ease: "power3.out",
  scrollTrigger: { trigger: ".footer", start: "top 90%", once: true } });

let t;
window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 200); });
