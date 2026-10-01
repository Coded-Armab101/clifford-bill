# Design Skill: Award-Winning Creative Agency Website
## Extracted from "The First The Last" (Nuxt 3 Production Build)

---

## 1. Design System

### Color Palette
```css
:root {
  --color-black: #232323;
  --color-white: #fff;
  --color-grey: #f8f8f8;
  --color-pink: #fcd5d7;
  --color-red: red;
  --gradient: linear-gradient(var(--color-white), var(--color-pink));
}
```

### Font System (TWK Lausanne)
| Weight | CSS Variable | Usage |
|--------|-------------|-------|
| 250 | `--font-250` | Display headings (pr-h3-250, pr-h5-250, pr-h7-250) |
| 300 | `--font-300` | Body text, headings (pr-h1-300 through pr-h9-300) |
| 400 | `--font-400` | Default body text |
| 500 | `--font-500` | Medium emphasis |
| 700 | `--font-700` | Bold headings, hero titles |

### Typography Scale
| Class | Desktop | Mobile |
|-------|---------|--------|
| `.h1` | 13.68vw | 76px |
| `.h2` | 5.21vw | 45px |
| `.h3` | 2.64vw | 28px |
| `.h4` | 1.39vw | 16px |
| `.p1-400/.p1-700` | 0.97vw | 14px |
| `.p2-400` | 0.76vw | 11px |
| `.button-400` | 1.67vw | 24px |

### Spacing System (rem-based, desktop viewport 1440px)
```css
:root {
  --120: 8.57rem;
  --90: 6.43rem;
  --80: 5.71rem;
  --72: 5.14rem;
  --56: 4rem;
  --48: 3.43rem;
  --32: 2.29rem;
  --24: 1.71rem;
  --20: 1.43rem;
  --16: 1.14rem;
  --12: 0.86rem;
  --8: 0.57rem;
  --4: 0.29rem;
}
```

### Transitions
```css
--transition: 0.5s cubic-bezier(0.32, 0, 0.12, 1);
--transition-fast: 0.3s cubic-bezier(0.32, 0, 0.12, 1);
--transition-slow: 0.8s cubic-bezier(0.32, 0, 0.12, 1);
```

### Z-Index Stack
```css
--z-menu: 999;
--z-header: 1000;
--z-popup: 2000;
--z-preloader: 9999;
--z-chatbot-button: 1998;
--z-chatbot-popup: 1999;
```

### Border Radius
```css
--radius-24: 1.71rem; /* 24px on mobile */
```

---

## 2. Layout Patterns

### Container System
```css
._container {
  padding-left: 1.11vw;
  padding-right: 1.11vw;
}
._container-inner {
  padding-left: 3.89vw;
  padding-right: 3.89vw;
}
/* Mobile: 16px padding for both */
```

### Responsive Breakpoint
- Desktop: > 1025px (base design at 1440px)
- Mobile: <= 1025px (design at 375px)
- Viewport CSS variable: `--viewport: 1440` (desktop) / `--viewport: 375` (mobile)

### Grid Patterns
```css
/* Brands grid: 4 columns */
.brands-items {
  display: grid;
  grid-template-columns: repeat(4, 10.42vw);
  justify-content: space-between;
}
/* Mobile: 2 columns */
@media (max-width: 1025px) {
  grid-template-columns: repeat(2, 150px);
}
```

---

## 3. Component Patterns

### 3.1 The First The Last Agency Common Link (animated underline)
```html
<a class="common-link">
  <span class="common-link__text">
    <span class="common-link__text-txt">Text</span>
    <span class="common-link__text-line"></span>
  </span>
</a>
```
- Line animates from width: 0 to width: 100% on hover
- Active state: line always visible
- Variants: `_white`, `_grey`, `_pink`, `_showLine`, `_withArrow`, `_withArrowSmall`

### 3.2 The First The Last Agency Common Tip (floating tags)
```html
<div class="common-tip p1-400" style="background:#F5CC53;">
  <span>Creative Digital Agency</span>
</div>
```
- Used as floating decorative elements on heroes
- Multiple colors: yellow (#F5CC53), pink (#F49FC5), green (#34B550), lavender (#CBBEDC), lime (#F2FBE0)

### 3.3 The First The Last Agency Preloader
- Full-screen fixed overlay with z-index: 9999
- Gradient background (white to pink)
- Percentage counter at bottom
- Site name centered
- Animated tags floating around
- Content fades in after load

### 3.4 The First The Last Agency Header
```css
.header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: var(--z-header);
  padding: var(--16) 0;
}
.header.background {
  background-color: var(--color-white);
  height: 3.33vw;
}
.header.hide {
  transform: translateY(-105%);
}
```
- Logo centered
- Nav items separated by commas
- "Let's Connect" CTA on right
- Mobile: hamburger menu with animated X button

### 3.5 The First The Last Agency Mobile Menu
- Full viewport overlay (100vh)
- Gradient background (pink tint)
- Centered nav links
- Social links at bottom
- Scrolling logo ticker at very bottom
- Animated entrance tags

### 3.6 The First The Last Agency Main Hero
- Full viewport height
- Large title: "Success Designed Differently"
- Gradient overlay (50% opacity)
- Floating tip tags positioned absolutely
- Video body below title
- Icon spacer between title words

### 3.7 The First The Last Agency Values Section (scroll-triggered)
- 300vh tall container with sticky inner
- Text content fades in/out based on scroll position
- Floating tags positioned absolutely
- Large "360 Agency" text at bottom with gradient fade

### 3.8 The First The Last Agency Work Section
- **Desktop:** 400vh runway + `position:sticky` full-viewport scroller; whole item strip translates vertically (`y = -(stripHeight - viewportHeight)`) so projects glide seamlessly past ("joined together")
- Oversized pink heading (21.04vw, font-700) scrolls away as you enter
- Per-item parallax photo + floating metadata (count/year/name/about/services/pagination)
- **Mobile:** full-width stacked cards, each with full-width photo, gradient legibility layer, name/services at bottom

### 3.9 The First The Last Agency Services Section (3D cards)
- Cards stacked with perspective transforms
- `transform: translateZ(-1.39vw) rotateX(-5deg)`
- Hover reveals description
- Color-coded backgrounds (pink gradient scale)
- Numbered indicators (01-07)

### 3.10 The First The Last Agency Contact Section
- Dark background (black)
- Large city names as typographic elements
- Circular photo of team member
- Gradient overlay at bottom
- Blinking cursor animation

### 3.11 The First The Last Agency Footer
- Gradient background (reversed)
- 4-column layout on desktop
- Social links with comma separators
- Scrolling logo ticker at bottom
- Copyright line

### 3.12 The First The Last Agency Contact Popup
- Full-screen fixed overlay
- Multi-step form (5 steps)
- Pagination indicator
- Back button (top left)
- Close button (top right)
- Gradient background

### 3.13 The First The Last Agency Video Component
- Custom play/pause controls
- Volume slider (vertical)
- Timeline scrubber
- Duration display
- Cursor text on hover
- Responsive: video scales on mobile

---

## 4. Animation Patterns

### GSAP/ScrollTrigger Setup
```javascript
// Scroll-triggered animations
ScrollTrigger.create({
  trigger: element,
  start: "top bottom",
  end: "bottom top",
  animation: gsapTimeline,
  toggleActions: "play reverse play reverse"
});

// Scrub animations (parallax)
ScrollTrigger.create({
  trigger: element,
  start: "top bottom",
  end: "bottom top",
  animation: gsap.to(element, { scaleTo: 1.05 }),
  scrub: true
});
```

### Lenis Smooth Scroll
```javascript
// Required setup
html.lenis, html.lenis body {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-stopped {
  overflow: hidden;
}
```

### Animation Classes
```css
.should-animate {
  will-change: transform, opacity;
}
.should-parallax {
  overflow: hidden;
  will-change: transform;
}
.should-parallax > img {
  transform: scale(1.2);
  will-change: transform;
}
.js-anim-scale, .js-anim-scale-wrap {
  height: 100%;
  overflow: hidden;
  will-change: transform;
}
```

### Text Animation Pattern
```javascript
// Split text into lines, animate each
function animateText(selector, options) {
  const element = gsap.utils.toArray(selector);
  const tl = gsap.timeline();
  const splitText = new SplitText(element, { type: "lines" });
  
  tl.from(splitText.lines, {
    yPercent: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ...options
  });
  
  return tl;
}
```

### Scale Animation Pattern
```javascript
// Image scale on scroll
document.querySelectorAll(".js-anim-scale").forEach(el => {
  const media = el.querySelector(".common-media");
  
  // Media scale animation
  ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    animation: gsap.from(media, {
      duration: 2,
      scaleFrom: 1.1,
      delay: 0.016
    }),
    toggleActions: "play reverse play reverse"
  });
  
  // Wrapper scale (scrub)
  ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    animation: gsap.to(el, { scaleTo: 1.05 }),
    scrub: true
  });
});
```

---

## 5. Interaction Patterns

### Custom Cursor
- Video sections show "Expand Video" cursor text
- Cursor follows mouse position
- Opacity transitions on hover

### Menu Toggle
- Button with animated lines (X animation)
- Lines rotate 45deg and scale on open
- Transition: `var(--transition)`

### Link Underlines
- Underline slides in from left (width: 0 -> 100%)
- On active route: line always visible
- On hover: line appears
- On `_showLine` variant: line disappears on hover

### Form Interactions
- Labels animate left when focused
- Custom select dropdowns with plus icon rotation
- Radio buttons with custom circles
- File upload with drag-and-drop

---

## 6. Responsive Design Rules

### Desktop (1440px base)
- All spacing uses vw units
- Font sizes use vw
- Container padding: 1.11vw
- Inner container: 3.89vw

### Mobile (375px base)
- All sizes convert to px
- Fixed font sizes
- Fixed padding: 16px
- Grid columns reduce (4 -> 2)
- Some elements hidden/shown
- Menu becomes hamburger
- Horizontal scroll for works

### Desktop-Only Elements
```css
@media (max-width: 1025px) {
  .is-desktop { display: none; }
}
.is-mobile { display: none; }
@media (max-width: 1025px) {
  .is-mobile { display: block; }
}
```

---

## 7. Page Structure

### Home Page
1. Header (fixed, hides on scroll down, logo→small-mark swap)
2. Mobile Menu (overlay)
3. Preloader (overlay + counter + tags + Lottie)
4. Main Hero (title + video, gradient scroll layer, Lottie logo in title)
5. Values Section (scroll-triggered sticky stage, crossfade, 360° Agency wordmark)
6. Tags Section (drifting keyword cloud)
7. About Section (parallax image + reveals)
8. Works Section (desktop sticky reel / mobile stacked cards)
9. Brands Section (awards grid)
10. Community Section (photo wall + TFTL lettering)
11. Services Section (3D cards)
12. Contact Section (dark + typographic cities)
13. Footer

### Contact Page
1. Header
2. Contact Hero
3. Contact Form (popup)

### Work Page
1. Header
2. Work Hero
3. Project Grid
4. Footer

### About Page
1. Header
2. About Hero
3. Mission Section
4. Team Section
5. Footer

### Services Page
1. Header
2. Services Hero
3. Service List
4. Footer

---

## 8. SVG Patterns

### Logo (Full)
- Width: 12.08vw (desktop) / 174px (mobile)
- Colors: black, grey, white, pink variants

### Logo (Small)
- Width: 2.29vw (desktop) / 33px (mobile)
- Header: 3.26vw (desktop) / 27px (mobile)

### Icons
- Arrow right: 0.625vw (desktop) / 9px (mobile)
- Close: 0.97vw (desktop) / 14px (mobile)
- Plus: 1.11vw (desktop) / 16px (mobile)
- Chevron: 0.83vw (desktop) / 10px (mobile)

---

## 9. Performance Patterns

### Image Handling
```css
.wrap-image {
  height: 100%;
  width: 100%;
}
.inner-img {
  object-fit: cover;
  object-position: center;
  user-select: none;
}
```

### Video Handling
```html
<video
  loop autoplay muted
  preload="metadata"
  playsinline
  disablePictureInPicture
>
```

### Animation Performance
- Use `will-change: transform, opacity` sparingly
- Use `transform: translateZ(0)` for GPU acceleration
- Use `overflow: hidden` on scale containers
- GSAP handles most optimization

---

## 10. Key Takeaways

### Design Principles
1. **Typography-driven**: Large, bold type is the primary design element
2. **Minimal color palette**: Black, white, grey, pink with gradient
3. **Whitespace-heavy**: Generous spacing throughout
4. **Motion-first**: Every element has scroll-triggered animation
5. **Premium feel**: Custom cursor, smooth scroll, 3D card effects

### Technical Stack
- Framework: Nuxt 3 (Vue 3.5.12)
- Build: Vite
- Animation: GSAP + ScrollTrigger
- Smooth Scroll: Lenis
- Carousel: Swiper
- CSS: Scoped Vue styles + CSS custom properties
- Fonts: TWK Lausanne (250-700 weights)

### What Makes It Award-Winning
1. **Seamless transitions** between sections
2. **3D perspective cards** for services
3. **Custom cursor** interactions
4. **Preloader** with animated tags
5. **Scroll-triggered typography** animations
6. **Sticky sections** with content swapping
7. **Parallax effects** on images
8. **Consistent design system** across all pages

---

## A. Animation Orchestration (The "How It All Runs")

Every section has an animation controller class. On the home page there are two
mount/unlock hooks fired by Nuxt transitions:

```javascript
// Registered on page mount (from the extracted MainPage component)
FC({
  firstSectionAnim()  { new oC(".main-page").firstSectionAnim() },   // hero + preloader
  otherSectionsAnim() { new oC(".main-page").otherSectionsAnim() }   // everything below
})

// otherSectionsAnim() dispatches, in order:
animateValuesNew();
animateAbout();
animateWorks();       // desktop sticky scroller
animateWorksMob();    // mobile stacked list
animateServices();    // 3D cards + stagger
animateTags();        // floating keyword tags
animateCases();
animateContacts();
```

Each `animate` method follows the same pattern:

1. **Guard** — check the section exists in the DOM, otherwise `return`.
2. **Wait** — `await z()` (a tick) so the route component is fully mounted
   before querying elements.
3. **Create ScrollTriggers** — `ScrollTrigger.create({ trigger, scrub: true,
   start, end, animation })` so animation progress is tied to scroll position.
4. **Compose** — small helper animators are combined with `.add(..., position)`
   and `.add(..., 0)` to run in parallel.

Helper animators extracted from the build:

| Helper | Effect |
|--------|--------|
| `MA(el, {yPercentFrom, yPercentTo, scaleFrom})` | Parallax: image/content slides vertically + scales while scrolling |
| `G(el)` | Fade-in with `yPercent: 50` rise (entrance) |
| `Y(el)` | Fade-up entrance (`yPercent` rise, opacity 0→1) |
| `IA(el, {yFrom, delayClipPath})` | "Reveal" entrance (used for tags, tips) |
| `iC(el, {scaleFrom})` | Image scale-in reveal (`scaleFrom: 1.1`) |

> `z` resolves a single requestAnimationFrame; `W("desktop")` returns true when
> viewport > 1025px. Everything below the fold is delayed until the preloader +
> hero first-frame animation finishes (the `firstSectionAnim()` unlock).

---

## B. Section-by-Section: How Each Was Achieved

### B.1 The First The Last Agency Preloader

**Design skill:** turn a required load delay into a branded moment with a fake
percentage counter, floating tags, and a Lottie logo.

- **Step 1 — Full-screen fixed overlay:** `.preloader{position:fixed;inset:0;z-index:var(--z-preloader)}` (9999).
- **Step 2 — Gradient wash:** `.preloader__gradient` covers the overlay with `var(--gradient)` (white→pink linear-gradient).
- **Step 3 — Center sitename:** `.preloader__sitename` is absolutely centered (`left:50%;top:50%;translate(-50%,-50%)`) at `61.875vw` wide so the tracking logo fills the screen edge-to-edge on desktop (100% on mobile).
- **Step 4 — Percentage counter:** `.preloader__percent` sits at `bottom: var(--32)`, centered with `translate(-50%)`; the number is driven by a fake loader that increments to 100 over ~1s.
- **Step 5 — Floating tags:** `.preloader__tag1..6` are absolutely positioned with lazy `left/top` values (e.g. tag1 at 30%/35%, tag2 at 50%/30%); each holds a `.common-tip` pill with a solid background color (yellow, magenta, green, lavender, red, lime) and text like "We spread", "Development", "Design", "2025".
- **Step 6 — Tags pop in with clip-path:** `IA(tags, {delayClipPath:0})` animates the reveal using a clip-path wipe.
- **Step 7 — Teardown:** when the counter hits 100 the overlay fades out and content is revealed from below; afterwards Headers' first-frame hero animation can begin.

### B.2 The First The Last Agency Header

**Design skill:** fixed nav that condenses the full logo to a small mark after
scrolling past 30% of the hero, and hides entirely when scrolling down.

- **Step 1 — Fixed bar:** `.header{position:fixed;top:0;width:100%;z-index:var(--z-header);padding:var(--16) 0}`. Background logo + center nav + right CTAs laid out flex.
- **Step 2 — Hide on scroll-down:** a `ScrollTrigger` bound to the header element (`start:"top top"`, `end:"bottom top"`) adds class `.hide` (`transform: translateY(-105%)`) when scrolling down, removes it when scrolling back up (`onLeaveBack`).
- **Step 3 — Logo swap:** on init, all `.header .svg-logo path` set to opacity 1 and `.svg-logosmall` to 0. On scroll past `window.innerHeight * 0.3`, a paused timeline runs: full-logo paths fade `opacity→0` staggered `{from:"end",each:.01}`, then the small icon fades `opacity→1`. Reversed on scroll-back.
- **Step 4 — Blur/background state:** once scrolled, the bar gets a white background via `.header.background`.

### B.3 The First The Last Agency Mobile Menu

**Design skill:** the hamburger becomes an "X", links stagger in, and a marquee
ticker lives at the bottom of the overlay.

- **Step 1 — Overlay:** fixed `100vh`, gradient background (pink tint), `z-index` above header but below preloader.
- **Step 2 — Button morph:** menu button's three lines rotate/scale into an X using `var(--transition)`.
- **Step 3 — Link stagger:** nav links animate in with a per-item delay from the same entrance helper (`Y`/`IA`).
- **Step 4 — Marquee:** the scrolling logo ticker at the bottom is a continuously translated strip (see Footer ticker).

### B.4 The First The Last Agency Main Hero

**Design skill:** a typography-first hero with word-by-word mask reveal and a
Lottie logo embedded inside the headline.

- **Step 1 — Layout:** `.main-hero` splits into two blocks — `__head` (padding-top `13.89vw`, `overflow:hidden`) and `__body` (`height:100vh;overflow:hidden`).
- **Step 2 — Massive headline:** `.main-hero__title{font-size:7.57vw;line-height:79%;letter-spacing:-0.04em;white-space:nowrap}` — "Success Designed Differently" as `white-space:nowrap`.
- **Step 3 — Gradient wash over head:** `.main-hero__head-gradient` is an absolute layer with `background:var(--gradient);opacity:.5`.
- **Step 4 — Lottie logo in the title:** `.main-hero__title-icon` (6.18vw, `align-self:flex-end`) sits inside the heading between words. On mount the element animates `width:0→6.18vw`, then `onComplete` fires `loadAnimation({path:"/lottie/logo.json", renderer:"svg"})` at 1.5x speed.
- **Step 5 — Title masked reveal:** `gsap.from(".main-hero__title-word",{yPercent:110,opacity:0,duration:1.5,delay:.3,stagger:.1})` inside `overflow:hidden` parent → words slide up out of a mask.
- **Step 6 — Floating tips:** `.main-hero__head-tip-1..5` are absolutely positioned; each contains a `.common-tip` pill; all 5 are entrance-animated together with `IA(tips,{yFrom:300})`.
- **Step 7 — Scroll response:** `ScrollTrigger` on `__head` (`start:"top top",end:"30% top",scrub`) fades the gradient layer `opacity:.5→1` as you scroll into the video.
- **Step 8 — Video body:** `.main-hero__body` holds the hero video (custom controls component) at `100vh`.

### B.5 The First The Last Agency Values Section

**Design skill:** multiple value blocks crossfade while the big "360° Agency"
wordmark scrolls away — a sticky-stage "content swap" pattern.

- **Step 1 — Stage:** `.main-values` is the trigger; it is tall enough (`top top`→`bottom bottom`, `scrub`) for the swap to feel slow and deliberate.
- **Step 2 — Defaults:** all `.main-values__text` + `.main-values__tags-items` set `opacity:0`; the first one is set visible immediately.
- **Step 3 — Counter timeline:** `gsap.fromTo(o,{value:1},...)` with `snap:{value:...}` (one snap per item). On each change: fade ALL current text+tags to 0 (`duration:.3`), fade the new pair to 1 (`duration:.5`), then run entrance helpers (`G` for text, `IA` for tag pills).
- **Step 4 — Big title exit:** a parallel tween moves `.big-title` ("360Agency") up by a full viewport (`y:-window.innerHeight`) with `"<"` (start-of-timeline) so it leaves before the swap begins.

### B.6 The First The Last Agency Tags Section

**Design skill:** a large sticky title with a drifting cloud of color-coded
keyword pills, all scrubbed to scroll.

- **Step 1 — Sticky title:** `.main-tags__sticky` pins; `.main-tags__title` stays in view.
- **Step 2 — Cloud:** a 24+ item grid of pills (`.main-tags__item-1..24`).
- **Step 3 — One scrub timeline for all:** a single timeline (`ease:"none"`) with **all columns drifting negative X** — groups move at different speeds (`x:-200`, `x:-180`, `x:-80`, `x:-70`, ...) so pills pass each other, creating a slow "aurora" drift.
- **Step 4 — Colors:** the pill colors are the recurring tag palette (`#E97EFF, #CBBEDC, #F05E23, #F49FC5, #F2FBE0, #34B550, #F5CC53`), rotating per item.

### B.7 The First The Last Agency About Section

- **Step 1 — Image scale reveal:** `iC(".main-about__body-image-wrap")` scales the image in from `scaleFrom:1.1` inside an `overflow:hidden` wrapper.
- **Step 2 — Image parallax:** `MA(".main-about__body-image img")` scrubbed, so the photo slides vertically while scrolling.
- **Step 3 — Text entrances:** `Y(...)` fade-up on header text and on the body: title, photo-text, quote-text, quote-link, plus both tips (`.main-about__body-title-tip`, `.main-about__body-photo-tip`).

### B.8 The First The Last Agency Work Section (Desktop Sticky Scroll)

**Design skill:** a 400vh scroll that plays like a horizontal-reel: oversized pink
heading, projects pinned in a sticky full-viewport window, each with parallax
photo + floating metadata, and the whole strip translating vertically (creating
the "works joined together" seamless feel).

Structure (from the extracted component):

```
.main-works
├─ .main-works__body        (height: 400vh — scroll runway)
├─ .main-works__head        (20.83vw tall, pink gradient)
├─ .main-works__head-title  (21.04vw font, flex, space-between)
└─ .main-works__items-scroller (position: sticky; top:0; height:100vh)
   └─ .main-works__items    (overflow:hidden)
      ├─ .main-works__item × N   (each height:100vh)
      │   ├─ .main-works__item-photo.should-parallax
      │   ├─ .main-works__content-wrap (will-change:transform)
      │   │   └─ .main-works__content
      │   │       ├─ .main-works__content-count (h2)
      │   │       ├─ .main-works__content-year  (p1-400)
      │   │       ├─ .main-works__content-name  (h2)
      │   │       ├─ .main-works__content-about (p1-400)
      │   │       └─ .main-works__content-pagination
```

- **Step 1 — Desktop-only:** `animateWorks()` returns immediately unless `W("desktop")`; the mobile variant is a separate component (`.main-works` hidden on mobile).
- **Step 2 — Scroll runway:** `.main-works__body{height:400vh}` gives 4 screens of scroll room.
- **Step 3 — Sticky window:** `.main-works__items-scroller{position:sticky;top:0;height:100vh}` pins the strip; `.main-works__items{overflow:hidden}` clips it.
- **Step 4 — The vertical translate that "joins" works:**
  ```javascript
  ScrollTrigger.create({
    trigger: ".main-works__body",
    scrub: true,
    start: "top top",
    end: "bottom bottom",
    animation: gsap.timeline().to(".main-works__items", {
      y: -o.clientHeight + p.clientHeight   // -stripHeight + viewportHeight
    })
  });
  ```
  This single timeline moves the entire strip up by exactly `stripHeight − viewport`, so item N lands in the viewport precisely when item N−1 left — the seamless "joined together" feel the user wanted.
- **Step 5 — Heading scroll-away:** a separate scrub tween slides `.main-works__head-title` down (`yPercent:50`) as the heading scrolls out of the sticky window.
- **Step 6 — Per-item parallax:** for each `.main-works__item`, `MA(photo,{yPercentFrom:-30,yPercentTo:30,scaleFrom:1.2})` parallaxes the image and `.add(MA(contentWrap,{yPercentFrom:-20,yPercentTo:20}), 0)` runs the metadata wrap in parallel.
- **Step 7 — Crossfade metadata:** each `.main-works__content` fades its wrap out (`end:"150% bottom"`) then a second trigger fades the NEXT wrap in (`"center bottom"`→`"bottom bottom"`), so project info swaps cleanly at the boundary.
- **Step 8 — Meta layout:** subscript info floats inside each frame — count bottom-left, year at vertical-center-left, name bottom-center, about top-right (27.08vw), services mid-right (27.78vw), pagination far right.
- **Step 9 — Big title typography:** `.main-works__head-title{font-family:var(--font-700);font-size:21.04vw;letter-spacing:-0.04em;pointer-events:none}` over a `linear-gradient(#f1f1f1,var(--color-pink))` head.

### B.9 The First The Last Agency Work Section (Mobile)

**Design skill:** on small screens the reel becomes a vertical stack of full-width
cards with parallax photos.

- **Step 1 — Separate component:** `.main-works-mob{display:none}` on desktop; `display:block` under 1025px.
- **Step 2 — Card list:** each `.main-works__item` is full-width; `.main-works__item-photo{height:100vw}` (square).
- **Step 3 — Gradient legibility:** `.main-works__bg` = `linear-gradient(transparent,var(--color-black))`, bottom half, `opacity:.8`, `z-index:1`.
- **Step 4 — Content pinned to bottom:** `.main-works__content{position:absolute;bottom:0;padding:16px;z-index:2}` with name (24px), services, and info.
- **Step 5 — Scroll reveal:** each content block entrance-animates (`G(name,{yPercent:50}).add(Y(info),0)`) when its card enters the viewport.

### B.10 The First The Last Agency Services Section

**Design skill:** title/quote + a "3D pile" of colored cards that stagger up on
scroll; entering a card flips in its description.

- **Step 1 — Head reveal:** `Y(".main-services__head-quote, .head-info, .head-link")` fade up as a group.
- **Step 2 — Body title:** quote + description + two tips entrance together (`G(...).add(Y(...))`), with the tips using `IA`.
- **Step 3 — Card pile stagger:** on desktop, `.main-services__item-wrap` elements animate `from{ y:150, pointerEvents:none }` with `stagger:.05` — the "stack rises" effect.
- **Step 4 — Hover description:** each `.main-services__item` has an `onMouseenter` handler; hovering reveals `.main-services__item-descr` (the card "flips" open).
- **Step 5 — Numbering:** `.main-services__item-count` ("01"–"07") marks each card; the cards use the pink-to-white gradient family.

### B.11 The First The Last Agency Brands Section

- **Step 1 — Centered mark:** `.main-brands__logo` (a small logo) is absolutely centered at top (`left:50%;transform:translate(-50%)`).
- **Step 2 — Heading:** `h3` ".main-brands__title" at `43.47vw` wide, centered — "Proud to be ranked among the Top 30 most awarded studios worldwide."
- **Step 3 — Grid:** `.brands-items{display:grid;grid-template-columns:repeat(4,10.42vw);justify-content:space-between}` — 4 award icons per row (Desktop), collapsing to 2 columns on mobile.
- **Step 4 — SVG icons:** each `.brand-item .brand-icon` is an inline `<svg viewBox>` (Awwwards, etc.).

### B.12 The First The Last Agency Community Section

- **Step 1 — Sticky title/description:** `.main-community__sticky` keeps the intro pinned while photos pass.
- **Step 2 — Photo wall:** `.main-community__photos` grid of `.main-community__photo` items; middle photo overlays the "TFTL" letters (`main-community__photo-tftl` renders T/F/T/L spans).
- **Step 3 — Reveal:** `G(title-wrap)` and `Y(descr-wrap)` on scroll.
- **Step 4 — Photo pop:** photos + letter-text reveal via `Y(...)`, and each image scales in with `iC(scaleFrom:1.1)`.
- **Step 5 — Parallax:** a scrubbed tween moves `.main-community__photo-3` (and siblings) vertically against the wall, adding depth.

### B.13 The First The Last Agency Cases + Contact Section
- **Cases:** project-popup links animate in with the same `Y`/`IA` helpers.
- **Contacts:** on `.main-contact2`, the photo parallaxes (`yPercent:15` scrub), and each `.main-contact2__info` block reveals city (`G(...,{yPercent:50})`) then info-more (`Y`, positioned at `0` for parallel).

### B.14 The First The Last Agency Contact Section

- **Step 1 — Black canvas:** section uses `--color-black` background.
- **Step 2 — Typographic cities:** city names ("DUBAI" → "NEW YORK", etc.) rendered huge as layout type, `.main-contact2__info-city`.
- **Step 3 — Scrub reveal:** each `__info` block animates in with a vertical rise as it enters.
- **Step 4 — Face photo:** circular team photo in the center, `yPercent:15` parallax.
- **Step 5 — Cursor tick:** blinking cursor element (keyframes opacity 0↔1) next to mail/CTA.

### B.15 The First The Last Agency Footer

- **Step 1 — Reversed gradient:** footer background = white→pink but laid out mirrored; columns on desktop.
- **Step 2 — Comma-joined social links:** repeated pattern `.common-link` with comma separators.
- **Step 3 — Looping ticker:** the logo name repeats in one long strip translated infinitely (CSS keyframes), a trademark "The First The Last" signature.
- **Step 4 — Legal line:** copyright row at the very bottom.

---

## C. Cross-Section Techniques (Reusable Skills)

### C.1 Masked Text Reveal
1. Wrap text in an `overflow:hidden` parent.
2. Split into words (`.main-hero__title-word`) or lines.
3. `gsap.from(el,{yPercent:110,opacity:0,duration:1.5,stagger:.1})` — words rise from behind the mask.

### C.2 Scroll-Synced Parallax
```javascript
ScrollTrigger.create({
  trigger: el,
  scrub: true,                                 // link progress to scroll
  animation: gsap.fromTo(el,{yPercentFrom},{yPercentTo})
});
```
Used on: works photos (−30→30, scale 1.2), about image, community photo, contact photo (15%).

### C.3 Sticky "Content Swap" Stage
1. Make the stage tall (`height:400vh` for works, NNvh for values).
2. Give the inner viewer `position:sticky;top:0;height:100vh`.
3. Use a scrubbed timeline (or counter `{snap}`) to transform/swap the pinned content over the runway.
4. Add a big heading that translates away (`y: -100vh`) in parallel.

### C.4 "Joined Together" Works Reel (single math)
```javascript
gsap.timeline().to(".main-works__items", {
  y: -(stripHeight - viewportHeight)   // exact distance → zero gap between items
});
```

### C.5 Entrance Helpers (reusable, from `tqo4XJMh` etc.)
```javascript
// fade + rise
function fadeUp(el, { yPercent=50, delay=0, duration=.8 } = {}) {
  return gsap.from(el, { yPercent, opacity: 0, delay, duration, ease: "power2.out" });
}
// clip-path reveal for tags / tips
function reveal(el) {
  return gsap.from(el, { clipPath: "inset(0% 0% 100% 0%)", duration: .8 });
}
```

### C.6 Floating Tip Pills
1. A `.common-tip.p1-400` pill: inline-block, `padding`, `border-radius: var(--radius-24)`, solid background.
2. Absolutely position 5–6 of them across a hero (`__tip-1..5`, or `__tag-1..6`).
3. Entrance-animate with `reveal()`/`yFrom:300`.

### C.7 Custom Cursor Text (Video)
- Cursor follows pointer (`mousemove` → transform).
- Over video frames it swaps to a text label ("Expand Video") and fades in via opacity transition.
- The label uses `mix-blend-mode: difference` / white pill styling for contrast.

---

## D. Naming Conventions Reference

| Naming | Meaning |
|--------|---------|
| `MA(x, opts)` | Parallax mover (yPercent +/- y, optional scale) |
| `G(x)` | Fade-up entrance (yPercent 50) |
| `Y(x)` | Fade-up entrance (0 delay default) |
| `IA(x, opts)` | In/out reveal (tags, tips; clip-path) |
| `iC(x, opts)` | Image scale-in (scaleFrom 1.1) |
| `js-anim-scale` | Media scale wrapper (overflow hidden, scale 1.2→1) |
| `js-anim-scale-wrap` | Wrapper scrub scale →1.05 |
| `should-animate` | GPU hint (will-change transform/opacity) |
| `should-parallax` | `overflow:hidden; will-change:transform; img scale(1.2)` |
| `common-tip` / `common-link` | Floating pill / animated underline link |

---

## E. Key Takeaways

### Design Principles
1. **Typography-driven**: Large, bold type is the primary design element
2. **Minimal color palette**: Black, white, grey, pink with gradient
3. **Whitespace-heavy**: Generous spacing throughout
4. **Motion-first**: Every element has scroll-triggered animation
5. **Premium feel**: Custom cursor, smooth scroll, 3D card effects

### Technical Stack
- Framework: Nuxt 3 (Vue 3.5.12)
- Build: Vite
- Animation: GSAP + ScrollTrigger
- Smooth Scroll: Lenis
- Carousel: Swiper
- CSS: Scoped Vue styles + CSS custom properties
- Fonts: TWK Lausanne (250-700 weights)

### What Makes It Award-Winning
1. **Seamless transitions** between sections
2. **3D perspective cards** for services
3. **Custom cursor** interactions
4. **Preloader** with animated tags
5. **Scroll-triggered typography** animations
6. **Sticky sections** with content swapping
7. **Parallax effects** on images
8. **Consistent design system** across all pages

---

*Extracted from "The First The Last" production build - an award-winning creative digital agency website.*
