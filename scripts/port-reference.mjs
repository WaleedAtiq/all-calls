// Assembles index.html + src/vendor/reference.css from the markup/CSS captured
// from allcalls-next.vercel.app (see reference/). Run: node scripts/port-reference.mjs
import fs from "node:fs";
const read = (f) => fs.readFileSync(new URL("../reference/" + f, import.meta.url), "utf8");

/** Strip everything GSAP/SplitText wrote at runtime so the page starts in its authored state. */
function clean(html) {
  return html
    .replace(/\s+style="[^"]*"/g, "")
    .replace(/<([a-z]+)([^>]*?)\sdata-svg-origin="[^"]*"([^>]*)>/g, (m, tag, a, b) => `<${tag}${(a + b).replace(/\stransform="[^"]*"/, "")}>`)
    .replace(/class="([^"]*)"/g, (m, c) => `class="${c.split(/\s+/).filter((t) => t && !["center", "end-place", "gradient-text"].includes(t)).join(" ")}"`)
    .replace(/src="images\//g, 'src="/assets/images/');
}

let section = clean(read("section.html"));
// Rebuild the hero copy that SplitText had chopped into chars/words
section = section.replace(/(<h2 class="chakra-heading heading__sale-section[^"]*">)[\s\S]*?(<\/h2>)/, "$1Your Next Sale is <br> Just a Call Away$2");
section = section.replace(/(<div class="sub-text__sale-section[^"]*">)[\s\S]*?(<\/div><div class="buy-now-btn__sale-section)/,
  '$1<div class="css-0">Instantly Connect with new clients on demand. Flexible,</div><div class="css-0">affordable, and tailored to your success.</div>$2');

const nav = clean(read("nav.html"));
const footer = clean(read("footer.html"));
const mb = clean(read("mobile-body.html"));
const mStart = mb.indexOf('<div class="css-1mlpazb"');
const mEnd = mb.indexOf("<footer");
const mobile = mb.slice(mStart, mEnd);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AllCalls.io — Your next sale is just a call away</title>
    <meta name="description" content="Instantly connect with new clients on demand. Flexible, affordable, and tailored to your success." />
    <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/SF-Pro-Text-Regular.woff2" crossorigin />
    <link rel="stylesheet" href="/src/vendor/reference.css" />
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body class="chakra-ui-light">
    <div class="css-79elbk">
      ${nav}
      <div class="xp-progressbar" aria-hidden="true"><i></i></div>
      <!-- Desktop (>= 1366px): one pinned section, every state driven by the scroll timeline -->
      <div class="xp-desktop">
        ${section}
        <div class="xp-scroll-hint" aria-hidden="true"><span>Scroll</span><i></i></div>
        <nav class="xp-progress" aria-label="Sections">
          <button data-label="hero"><span>Your next sale</span></button>
          <button data-label="second-variation"><span>Quality calls</span></button>
          <button data-label="replacing-iphone"><span>New clients</span></button>
          <button data-label="sold-cards"><span>Policies sold</span></button>
          <button data-label="toggle"><span>On / off</span></button>
          <button data-label="sign-up-flow-in"><span>3 steps</span></button>
          <button data-label="laptop-showoff"><span>Any device</span></button>
          <button data-label="start-now-variation"><span>Start now</span></button>
        </nav>
      </div>
      <!-- Below 1366px: the stacked layout with the phone renders -->
      <div class="xp-mobile">
        ${mobile}
      </div>
      ${footer}
    </div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;
fs.writeFileSync(new URL("../index.html", import.meta.url), html);

const css = ["/* ---- global stylesheet from the reference build ---- */", read("global.css"),
  "/* ---- Chakra/emotion rules captured at >=1366px ---- */", read("emotion.css"),
  "/* ---- Chakra/emotion rules captured at 1200px (mobile components) ---- */", read("mobile-emotion.css")].join("\n\n");
fs.writeFileSync(new URL("../src/vendor/reference.css", import.meta.url), css);
console.log("index.html", html.length, "reference.css", css.length, "mobile part", mobile.length);
