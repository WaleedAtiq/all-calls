import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import "./style.css";

gsap.registerPlugin(ScrollTrigger, SplitText);
if ("scrollRestoration" in history) history.scrollRestoration = "manual";


const q = (s) => document.querySelector(s);
const qa = (s) => gsap.utils.toArray(s);

/* ---------------------------------------------------------
   Nav intro (same as the reference)
   --------------------------------------------------------- */
gsap.set([".logo", ".nav-menu-item"], { scaleY: 0, transformOrigin: "bottom" });
gsap.to([".logo", ".nav-menu-item"], { scaleY: 1, stagger: 0.1, duration: 0.4, ease: "sine.inOut" });

/* Scale helper used by the reference for vw-based distances (1480px design width) */
const et = (e, t = 1480) => (e >= t ? t / e : e / t);

/* ---------------------------------------------------------
   Toggle switch inside the phone
   --------------------------------------------------------- */
let toggled = false;
function toggle() {
  if (toggled) {
    gsap.to(".toggle-switch-inner", { xPercent: 0 });
    gsap.to(".toggle-switch-bar", { backgroundColor: "rgb(112, 128, 144)", opacity: 0.5 });
  } else {
    gsap.to(".toggle-switch-inner", { xPercent: 80 });
    gsap.to(".toggle-switch-bar", { backgroundColor: "rgb(49, 197, 91)", opacity: 1 });
  }
  toggled = !toggled;
}
q(".toggle-switch")?.addEventListener("click", toggle);

/* ---------------------------------------------------------
   Desktop experience: one pinned section, scrubbed timeline
   (port of the reference's choreography)
   --------------------------------------------------------- */
const mm = gsap.matchMedia();
const dotsNav = q(".xp-progress");
let updateDots = () => {};

mm.add(
  {
    isDesktop: "(min-width: 1366px)",
    lg: "(max-width: 1367px)",
    xl: "(max-width: 1601px)",
    xxl: "(max-width: 1921px)",
  },
  (ctx) => {
    const { isDesktop, lg, xl, xxl } = ctx.conditions;
    if (!isDesktop) return;

    const size = lg && xl && xxl ? "lg" : !lg && xl && xxl ? "xl" : "xxl";
    const vw = window.innerWidth, vh = window.innerHeight;

    const split = new SplitText(".heading__sale-section", { type: "chars,words" });
    const subSplits = qa(".sub-text__sale-section div").map((el) => new SplitText(el, { type: "chars,words" }));
    const subWords = subSplits.map((s) => s.words);

    const PHONE = ".phone", V2 = ".iphone-v2", H2 = ".heading-2", H1 = ".heading-1", H3 = ".heading-3", H4 = ".heading-4", H5 = ".heading-5";
    const h5divs = qa(`${H5} div`);
    const AVATARS = ".instantly-avatars .instantly-avatar";
    const V2BOX = ".phone-v2-box", AVBOX = ".avatar-box", CIRCLE = ".circle-box";
    const SOLD = ".sold-card-container .sold-card";
    const steps = qa(".heading-step");
    const LAPTOP = ".laptop", STARTNOW = ".start-now";
    const TOGGLE = ".sign-up__toggle-switch-wrapper", LOGO = ".sign-up__logo-wrapper", FORM = ".sign-up__form-wrapper", SIGNCARDS = ".sign-up__sold-card-container";
    const icons = qa(".phone-icons > g");
    const iconHeadings = qa(".icon-heading");
    const AFTER = ".iPhone-2-after-responding-icons", INTERN = ".iPhone-2-intern-circles", MASK = ".iPhone-2-front-mask";

    let Z = `${50 * et(vw)}vw`, O = "210px";
    if (size === "xxl") { Z = `${60 * et(vw)}vw`; O = "170px"; }

    gsap.to(AVATARS, { opacity: 0, scale: 0 });

    // Hero intro: title characters rise in, then the copy and the button
    gsap.set(H1, { opacity: 1 });
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(split.chars, { yPercent: 110, opacity: 0, duration: 0.9, stagger: { each: 0.025, from: "start" } })
      .from(subWords.flat(), { y: 16, opacity: 0, duration: 0.6, stagger: 0.02 }, "-=0.5")
      .from(".buy-now-btn__sale-section", { y: 24, opacity: 0, duration: 0.6 }, "-=0.35")
      .from(".iphone-v1", { y: 80, opacity: 0, duration: 1.2, ease: "power2.out" }, 0.2)
      .from(CIRCLE, { opacity: 0, duration: 1.4 }, 0.3);

    // Idle float + mouse parallax on the phone group (CSS `translate`, see style.css)
    const group = q(".css-fsp7c9");
    const float = gsap.to(group, { "--float": -10, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    const px = gsap.quickTo(group, "--px", { duration: 0.8, ease: "power2.out" });
    const py = gsap.quickTo(group, "--py", { duration: 0.8, ease: "power2.out" });
    const onMove = (e) => { px(((e.clientX / vw) - 0.5) * 18); py(((e.clientY / vh) - 0.5) * 12); };
    window.addEventListener("mousemove", onMove);

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: {
        trigger: ".container__sale-section",
        start: "1px top",
        end: "+=2000%",
        pin: true,
        scrub: 0.5,
        toggleActions: "play none reverse none",
        onUpdate: (self) => updateDots(self.progress),
        onToggle: (self) => dotsNav?.classList.toggle("is-visible", self.isActive),
      },
    });

    gsap.set(H2, { x: 400 });
    gsap.set(iconHeadings, { y: -50 });

    // Insurance verticals: each icon moves to the centre with its label
    const verticals = [
      [1, ".heading-auto-insurance", "auto-insurance"],
      [2, ".heading-medicare", "medicare"],
      [3, ".heading-u65-health", "u65-health"],
      [4, ".heading-life-insurance", "life-insurance"],
      [5, ".heading-aca-health", "aca-health"],
    ];
    const iconsTl = gsap.timeline();
    verticals.forEach(([i, heading, label], n) => {
      const prev = n > 0 ? icons[verticals[n - 1][0]] : null;
      iconsTl
        .to(icons[i], {
          delay: 1, duration: 3,
          onStart: () => { prev?.classList.remove("center"); icons[i].classList.add("center"); },
          onReverseComplete: () => { prev?.classList.add("center"); icons[i].classList.remove("center"); },
        }, label)
        .to(heading, { opacity: 1, y: 0, delay: 1, duration: 3 }, label)
        .to(heading, { opacity: 0 });
    });

    const gradientOn = (el) => el?.classList.add("gradient-text");
    const gradientOff = (el) => el?.classList.remove("gradient-text");

    tl
      // answer the call, hero copy leaves
      .to(PHONE, { rotate: 22.5, yPercent: -30 }, "second-step")
      .to(".iPhone-1-respond-btn-check", { xPercent: 245 })
      .to(split.chars, { x: -600, opacity: 0, duration: 5 }, "first-heading")
      .to(subWords, { x: -600, opacity: 0, duration: 5 }, "first-heading")
      .to(".buy-now-btn__sale-section", { x: -600, opacity: 0, duration: 5 }, "first-heading")
      // delivering quality calls
      .to(H2, { x: 0, opacity: 1, duration: 5 }, "second-variation")
      .to(PHONE, { rotate: 0, y: 0, duration: 5 }, "second-variation")
      .to(".iPhone1-new-client-heading", { opacity: 0, y: -200, duration: 5 }, "second-variation")
      .to(".iPhone-1-respond-btns-with-bg", { opacity: 0, duration: 5 }, "second-variation")
      .to(PHONE, { scale: 1.15, xPercent: -100, duration: 5 }, "second-variation")
      .to(CIRCLE, { scale: 0, opacity: 0, duration: 5 }, "second-variation")
      .to(icons, { opacity: 1, stagger: 0.4 })
      .add(iconsTl)
      .to(icons, { opacity: 0, stagger: 0.4 })
      .to(H2, { x: 400, opacity: 0, delay: 2, duration: 3 })
      // swap to the second phone, avatars fly in
      .to(PHONE, { scale: 1, delay: 2, x: -450, duration: 3 }, "moving-variation")
      .to([".iphone-v1", CIRCLE], { opacity: 0, duration: 2 }, "replacing-iphone")
      .to(V2, { opacity: 1 }, "replacing-iphone")
      .to(AVATARS, { opacity: 1, scale: 1, delay: "random(0, 2)" })
      .to(H3, { xPercent: 80, opacity: 1, duration: 3 }, "-=2")
      .to(V2BOX, { x: `${28 * et(vw)}vw`, delay: 2, duration: 5 }, "third-variation")
      .to(AVBOX, {
        x: `${28 * et(vw)}vw`, delay: 2, duration: 5,
        onStart: () => q(".instantly-avatars")?.classList.add("end-place"),
        onReverseComplete: () => q(".instantly-avatars")?.classList.remove("end-place"),
      }, "third-variation")
      .to(H3, { xPercent: 200, scale: 0, opacity: 0, delay: 2, duration: 5 }, "third-variation")
      .to(AVATARS, { opacity: 0, delay: "random(0,2)", stagger: 0.2 })
      .to([AVBOX, AFTER, INTERN, MASK], { opacity: 0, delay: 2, duration: 3 }, "fourth-variation")
      // sold cards
      .to(V2BOX, { scale: 1.6, y: `${5 * et(vh)}vw`, transformOrigin: "top", duration: 4 })
      .to(H4, { opacity: 1 })
      .to(SOLD, { x: `${27 * et(vw)}vw`, stagger: 0.2, transformOrigin: "bottom", opacity: 1, duration: 4 }, "sold-cards")
      .to(SOLD, { x: `${35 * et(vw)}vw`, delay: "random(1,3)", opacity: 0, duration: 4 })
      .to(H4, { opacity: 0 })
      // toggle on / off
      .addLabel("toggle")
      .to(V2BOX, { scale: 1, y: 0, x: Z, duration: 3 })
      .to([TOGGLE, LOGO], { opacity: 1, delay: 1 })
      .to(TOGGLE, { delay: 1, onStart: toggle, onReverseComplete: toggle })
      .to(`${H5} div`, { xPercent: 1, yPercent: -40, stagger: 0.2, opacity: 1, duration: 3 })
      .to(TOGGLE, { opacity: 0, delay: 4, duration: 3 }, "sign-up-flow")
      .to(h5divs, { x: -100, opacity: 0, delay: 4, duration: 3 }, "sign-up-flow")
      // three steps
      .to(steps, { x: -100, opacity: 0 })
      .to(steps[0], { opacity: 1, x: 0, duration: 3 })
      .to(steps[1], { opacity: 1, x: 0, delay: 2, duration: 3, onStart: () => gradientOn(steps[1]) }, "sign-up-flow-in")
      .to(FORM, { opacity: 1, delay: 2, duration: 3 }, "sign-up-flow-in")
      .to(FORM, { opacity: 0, delay: 5, duration: 2 })
      .to(steps[2], {
        opacity: 1, x: 0, delay: 2, duration: 3,
        onStart: () => { gradientOff(steps[1]); gradientOn(steps[2]); },
        onReverseComplete: () => { gradientOff(steps[2]); gradientOn(steps[1]); },
      }, "insurance-flow")
      .to(SIGNCARDS, { opacity: 1, delay: 2, duration: 3 }, "insurance-flow")
      .to(V2, { zIndex: 3 })
      .to(SIGNCARDS, { opacity: 0, delay: 5, duration: 3 })
      .to(LOGO, { opacity: 0, delay: 2, duration: 3 }, "start-taking-calls")
      .to(steps[3], {
        opacity: 1, x: 0, delay: 2, duration: 3,
        onStart: () => { gradientOff(steps[2]); gradientOn(steps[3]); },
        onReverseComplete: () => { gradientOff(steps[3]); gradientOn(steps[2]); },
      }, "start-taking-calls")
      .to([AFTER, INTERN, MASK], { opacity: 1, stagger: 0.2, delay: 2, duration: 3 }, "start-taking-calls")
      .to(steps, { stagger: 0.5, opacity: 0, x: -100, delay: 6, duration: 4 })
      // laptop show-off
      .to(V2BOX, { x: "55vw", y: O, scale: 0.6, rotate: -16, duration: 4, delay: 2 }, "laptop-showoff")
      .to(LAPTOP, { opacity: 1, duration: 3, delay: 2 }, "laptop-showoff")
      .to(PHONE, { x: "-78vw", duration: 3, delay: 2 }, "laptop-showoff")
      .to(".floating-sold-card", { opacity: 1, stagger: 0.4, duration: 3 })
      .to(V2BOX, { opacity: 0, delay: 3, duration: 3 })
      // let's start now
      .to(PHONE, { opacity: 0, delay: 1, duration: 4 }, "start-now-variation")
      .to(LAPTOP, { scale: 10, delay: 1, duration: 10 }, "start-now-variation")
      .to(LAPTOP, { opacity: 0 })
      // the 10x laptop would otherwise keep stretching the page below the footer
      .set(LAPTOP, { scale: 1 })
      .to(STARTNOW, { opacity: 1, duration: 3 }, "-=1")
      .to(STARTNOW, { delay: 5 });

    // Progress dots: one per timeline label, click to jump there
    const dots = qa(".xp-progress button");
    const st = tl.scrollTrigger;
    const labelProgress = (name) => (name === "hero" ? 0 : (tl.labels[name] ?? 0) / tl.duration());
    const positions = dots.map((d) => labelProgress(d.dataset.label));
    updateDots = (p) => {
      let active = 0;
      positions.forEach((pos, i) => { if (p >= pos - 0.01) active = i; });
      dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
    };
    dots.forEach((d, i) => d.addEventListener("click", () => window.scrollTo({ top: st.start + (st.end - st.start) * positions[i] + 2, behavior: "smooth" })));

    return () => {
      intro.kill();
      float.kill();
      window.removeEventListener("mousemove", onMove);
      gsap.set(group, { clearProps: "--px,--py,--float" });
      split.revert();
      subSplits.forEach((s) => s.revert());
      icons.forEach((g) => g.classList.remove("center"));
      q(".instantly-avatars")?.classList.remove("end-place");
      steps.forEach((s) => s.classList.remove("gradient-text"));
      toggled = false;
    };
  }
);

/* ---------------------------------------------------------
   Below 1366px: stacked layout with gentle reveals
   --------------------------------------------------------- */
mm.add("(max-width: 1365px)", () => {
  qa(".xp-mobile .chakra-container").forEach((block) => {
    const text = block.querySelectorAll("h2, p, button");
    const media = block.querySelectorAll("img");
    if (text.length) gsap.from(text, { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: block, start: "top 82%", once: true } });
    if (media.length) gsap.from(media, { scale: 0.94, opacity: 0, duration: 1, ease: "power2.out",
      scrollTrigger: { trigger: block, start: "top 82%", once: true } });
  });
});
