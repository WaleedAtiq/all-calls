import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./style.css";

gsap.registerPlugin(ScrollTrigger);
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

/* ---------------------------------------------------------
   Phone states — one entry per section the phone passes through.
   x: horizontal offset (vw) from centre on desktop, scale: phone scale,
   glow: opacity of the blue halo, orbit: which floating layer to show.
   --------------------------------------------------------- */
const STATES = [
  { x:  24, scale: .80, glow: 1,  orbit: null,            tilt: -12 }, // 0 hero: incoming call
  { x:   4, scale: .95, glow: .35, orbit: ".orbit--icons",   tilt: 10 }, // 1 quality calls
  { x: -26, scale: .85, glow: .45, orbit: ".orbit--avatars", tilt: -10 }, // 2 instantly connect
  { x:   0, scale: 1.0, glow: 0,  orbit: null,            tilt: 0 },   // 3 leads list
  { x:  22, scale: .70, glow: .3, orbit: ".orbit--waves",   tilt: 12 },  // 4 on / off
];
const STEPS = STATES.length;

const screens  = gsap.utils.toArray(".screen");
const features = gsap.utils.toArray(".feature");
const dots     = gsap.utils.toArray(".dot");
const orbits   = gsap.utils.toArray(".orbit");

const vw = (n) => () => (isMobile() ? 0 : (window.innerWidth * n) / 100);
const sc = (n) => () => (isMobile() ? 1 : n);

/* ---------------------------------------------------------
   1. Intro (on load)
   --------------------------------------------------------- */
gsap.set(".phone-wrap", { x: vw(STATES[0].x), scale: sc(STATES[0].scale) });
gsap.set(".glow", { opacity: STATES[0].glow });
gsap.set(features, { opacity: 0, visibility: "hidden" });
gsap.set(features[0], { opacity: 1, visibility: "visible" });

gsap.timeline({ defaults: { ease: "power3.out" } })
  .from(".nav__pill", { y: -40, opacity: 0, duration: .8 })
  .from(features[0].querySelectorAll(".h, .lead, .btn"), { y: 40, opacity: 0, duration: .9, stagger: .1 }, "-=.4")
  .from(".phone", { y: 120, rotateY: -25, opacity: 0, duration: 1.2 }, "-=.9")
  .from(".glow", { scale: .4, opacity: 0, duration: 1.4 }, "<");

/* ---------------------------------------------------------
   2. Pinned, scrubbed story
   --------------------------------------------------------- */
const story = gsap.timeline({
  defaults: { ease: "power2.inOut" },
  scrollTrigger: {
    trigger: ".story",
    start: "top top",
    end: () => `+=${(STEPS - 1) * 120}%`,
    pin: ".story__pin",
    scrub: .7,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate(self) {
      const idx = Math.min(STEPS - 1, Math.round(self.progress * (STEPS - 1)));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    },
  },
});

const show = (el) => gsap.set(el, { visibility: "visible" });
const hide = (el) => gsap.set(el, { visibility: "hidden" });

for (let i = 0; i < STEPS - 1; i++) {
  const next = i + 1;
  const cur = STATES[i], to = STATES[next];
  const L = `s${i}`;
  story.addLabel(L);

  // Hold, then transition. Durations are "scroll units" — relative only.
  story.to({}, { duration: .6 }, L);

  // -- copy out
  story.to(features[i], { opacity: 0, duration: .4, onComplete: () => hide(features[i]), onReverseComplete: () => show(features[i]) }, L + "+=.6");
  story.to(features[i].querySelector(".feature__inner"), { y: -40, duration: .5 }, L + "+=.6");

  // -- orbit layer out
  if (cur.orbit) story.to(cur.orbit, { opacity: 0, scale: .8, duration: .4, onComplete: () => hide(cur.orbit), onReverseComplete: () => show(cur.orbit) }, L + "+=.6");

  // -- phone travels: tilt into the move, settle at the new position/scale
  story.to(".phone-wrap", { x: vw(to.x), scale: sc(to.scale), duration: 1.2 }, L + "+=.7");
  story.to(".phone", { rotateY: () => (isMobile() ? 0 : to.tilt), rotateZ: () => (isMobile() ? 0 : to.tilt / 4), duration: .6 }, L + "+=.7");
  story.to(".phone", { rotateY: 0, rotateZ: 0, duration: .6 }, L + "+=1.3");
  story.to(".glow", { opacity: to.glow, duration: 1 }, L + "+=.7");

  // -- screen crossfade mid-travel
  story.to(screens[i], { opacity: 0, duration: .35, onComplete: () => hide(screens[i]), onReverseComplete: () => show(screens[i]) }, L + "+=1.1");
  story.fromTo(screens[next], { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: .45, onStart: () => show(screens[next]), onReverseComplete: () => hide(screens[next]) }, L + "+=1.25");

  // -- screen specific flourishes
  if (next === 3) {
    story.from(".leads li", { y: 40, opacity: 0, stagger: .08, duration: .5 }, L + "+=1.4");
  }
  if (next === 4) {
    story.fromTo(".toggle__knob", { x: 0 }, { x: 40, duration: .4, ease: "back.out(2)" }, L + "+=1.9");
    story.to(".toggle", { backgroundColor: "#0066ff", duration: .4 }, L + "+=1.9");
    story.from(".orbit--waves i, .waves i", { scale: 0, opacity: 0, stagger: .05, duration: .6, ease: "power2.out" }, L + "+=1.6");
  }

  // -- orbit layer in
  if (to.orbit) story.fromTo(to.orbit, { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .5, onStart: () => show(to.orbit), onReverseComplete: () => hide(to.orbit) }, L + "+=1.5");

  // -- copy in
  story.fromTo(features[next], { opacity: 0 }, { opacity: 1, duration: .5, onStart: () => show(features[next]), onReverseComplete: () => hide(features[next]) }, L + "+=1.6");
  story.fromTo(features[next].querySelector(".feature__inner"), { y: 40 }, { y: 0, duration: .6 }, L + "+=1.6");
}
story.addLabel(`s${STEPS - 1}`);

story.to({}, { duration: .6 });

// idle float
gsap.to(".phone-wrap", { y: -10, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });

/* ---------------------------------------------------------
   3. Below the fold
   --------------------------------------------------------- */
gsap.from(".steps__title", { y: 50, opacity: 0, duration: .9, ease: "power3.out",
  scrollTrigger: { trigger: ".steps", start: "top 75%", once: true } });
gsap.from(".steps__list li", { x: -40, opacity: 0, stagger: .15, duration: .7, ease: "power3.out",
  scrollTrigger: { trigger: ".steps__list", start: "top 80%", once: true } });

gsap.from(".start__inner > *", { y: 40, opacity: 0, stagger: .15, duration: .9, ease: "power3.out",
  scrollTrigger: { trigger: ".start", start: "top 70%", once: true } });
gsap.fromTo(".start__bg", { scale: 1.2, opacity: .4 }, { scale: 1, opacity: 1, ease: "none",
  scrollTrigger: { trigger: ".start", start: "top bottom", end: "center center", scrub: true } });

gsap.from(".footer__card", { y: 40, opacity: 0, duration: .9, ease: "power3.out",
  scrollTrigger: { trigger: ".footer", start: "top 90%", once: true } });

let t;
window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 200); });
