# Zentry-style animation and design guide

This is a portable reference for rebuilding the visual language of this project in another React app. It documents what is actually implemented here, in page order, plus the reusable patterns behind it.

## 1. Foundation

### Stack and asset conventions

- React 19 + Vite 8
- Tailwind CSS v4, configured in `src/index.css` with `@theme`; there is no `tailwind.config.js`.
- GSAP 3 and `@gsap/react` for JavaScript-driven motion.
- `ScrollTrigger` for viewport-linked and pinned scroll motion.
- MP4 videos live in `public/videos`, images in `public/img`, fonts in `public/fonts`, and the ambient soundtrack is in `public/audio`.

Keep public assets referenced by root-relative paths, for example `src='/videos/hero-1.mp4'`. In a different build setup, use that system's asset-import convention instead.

### Visual tokens

The visual identity comes from a deliberately small palette and five local typefaces. Copy the variables and `@font-face` rules from `src/index.css` into the destination project's global CSS.

| Token | Value / intent |
| --- | --- |
| `blue-50` | `#dfdff0`, pale lavender page background |
| `blue-75` | `#dfdff2`, pale video-frame fill |
| `blue-100` | `#f0f2fa`, bright light text |
| `blue-200` | `#010101`, near-black |
| `violet-300` | `#5724FF`, strong purple accent |
| `yellow-300` | `#EDFF66`, acid-yellow CTA fill |
| `font-zentry` | oversized display headings |
| `font-general` | small uppercase labels/navigation |
| `font-circular-web` | readable body copy |
| `font-robert-*` | Hero supporting copy |

The content pattern uses short labels, massive uppercase display type, sparse explanatory copy, nearly black sections, and irregular polygon masks over rectangular media.

### Required GSAP setup

Register `ScrollTrigger` once in every component that creates a timeline, or centrally during app bootstrap.

```jsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)
```

Use `useGSAP` rather than raw `useEffect` for GSAP animation. It scopes cleanup to React lifecycle. When selecting elements by class, pass `{ scope: ref }` so identical elements in other sections are not accidentally animated.

### Global utility patterns

These helpers in `src/index.css` are the building blocks:

- `.flex-center`: centers an element in both axes.
- `.absolute-center`: absolutely positions at `50% / 50%` and translates back by half its size.
- `.special-font b`: makes selected letters in headings use the display face. Heading text can include `<b>` around one or more letters.
- `.mask-clip-path`: a full-rectangle polygon used as an initial mask for media that will grow.
- `.border-hsla`: a translucent white border, used on dark cards and pills.
- `overflow-x-hidden` is applied at body and app level to stop large pinned/translated elements from creating horizontal scrollbars.

## 2. Application route and section map

This project is one landing-page route, rendered in this exact order by `src/App.jsx`:

```text
Navbar (fixed overlay)
  └─ Hero
     └─ About
        └─ Vault / Features
           └─ Prologue / Story
              └─ Contact
                 └─ Footer
```

The navigation uses hash paths: `#nexus`, `#vault`, `#prologue`, `#about`, and `#contact`. Only `#vault`, `#prologue`, `#about`, and `#contact` currently have matching section IDs; add an `id='nexus'` to Hero if the Nexus link should scroll somewhere meaningful. The buttons are visual CTAs only—wire their `onClick` or anchors when reusing the design.

## 3. Fixed navigation

Source: `src/components/Navbar.jsx`

### What it does

- Sits fixed at the top, above every section (`z-50`).
- At page top it is an unboxed transparent bar.
- Scrolling down hides it by animating `y: -100` and `opacity: 0` over `0.2s`.
- Scrolling up returns it to view.
- Away from the top it receives `.floating-nav`: black fill, rounded corners, and a border.
- Desktop links get an underline that scales horizontally from right to left on hover.
- The audio button plays/pauses `/audio/loop.mp3`; its four vertical bars animate only while audio is playing.

### Scroll-direction logic

```jsx
const currentScrollY = window.scrollY
if (currentScrollY === 0) {
  setIsNavVisible(true)
  navRef.current.classList.remove('floating-nav')
} else if (currentScrollY > lastScrollY) {
  setIsNavVisible(false)
  navRef.current.classList.add('floating-nav')
} else {
  setIsNavVisible(true)
  navRef.current.classList.add('floating-nav')
}
setLastScrollY(currentScrollY)
```

Then animate the same ref:

```jsx
gsap.to(navRef.current, {
  y: isNavVisible ? 0 : -100,
  opacity: isNavVisible ? 1 : 0,
  duration: 0.2,
})
```

For a larger app, use a ref for the previous scroll position rather than state; that avoids rerendering on every scroll event. Preserve the passive listener and remove it during cleanup.

### Audio equalizer bars

Each bar gets `--animation-order: 1..4`. `.indicator-line.active` runs a `0.5s` infinite keyframe that expands from `4px` to `16px` and shifts upward by `4px`, while the custom-property delay creates the wave. The user must click first—browsers block autoplay with sound.

## 4. Hero: video cycling, reveal, and scroll morph

Source: `src/components/hero.jsx`

### Layer stack

1. A full-screen dark/pale loader overlays the hero until enough videos have loaded.
2. `#video-frame` is the clipped, rounded viewport wrapper.
3. A full-size background video plays the active video.
4. `#next-video` starts as an invisible 64×64 preview at center and grows to become the new full-screen video.
5. A small center preview is clipped, initially scaled down, and becomes visible only on hover.
6. Two identical “Gaming” headings create the foreground/background typography illusion: light text inside the frame and black text behind it.
7. Top-left copy and CTA stay above the videos.

### Video carousel transition

State is one-based because asset filenames are `hero-1.mp4` through `hero-4.mp4`:

```jsx
const totalVideos = 4
const [currentIndex, setCurrentIndex] = useState(1)
const upcomingVideoIndex = (currentIndex % totalVideos) + 1
```

On preview click, set the index to `upcomingVideoIndex`. When `currentIndex` changes, reveal and expand `#next-video`:

```jsx
gsap.set('#next-video', { visibility: 'visible' })
gsap.to('#next-video', {
  transformOrigin: 'center center',
  scale: 1,
  width: '100%',
  height: '100%',
  duration: 1,
  ease: 'power1.inOut',
  onStart: () => nextVideoRef.current.play(),
})
gsap.from('#current-video', {
  transformOrigin: 'center center',
  scale: 0,
  duration: 1.5,
  ease: 'power1.inOut',
})
```

All videos are `muted`, `loop`, and `playsInline`, which is necessary for reliable mobile autoplay. `loadedVideos < totalVideos - 1` keeps the loader up until three of the three rendered video elements fire `onLoadedData`.

Important: The permanent background and expanding `#next-video` briefly show the same `currentIndex` source. That overlap is intentional: the foreground video provides the expansion transition, then visually merges with the background.

### Scroll-linked viewport morph

The frame starts as an asymmetrical shape:

```js
gsap.set('#video-frame', {
  clipPath: 'polygon(14% 0%, 72% 0%, 90% 90%, 0% 100%)',
  borderRadius: '0 0 40% 10%',
})
```

As it scrolls from its center to bottom, scrub toward a rectangular unrounded frame:

```js
gsap.from('#video-frame', {
  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  borderRadius: '0',
  ease: 'power1.inOut',
  scrollTrigger: {
    trigger: '#video-frame',
    start: 'center center',
    end: 'bottom center',
    scrub: true,
  },
})
```

This code uses `from`, so at the beginning of the trigger it is rectangular, then moves toward the `gsap.set` asymmetrical shape as scroll progresses. If your intended story is the opposite—start clipped and end rectangular—use `gsap.to` instead.

### Loader

`.three-body` is a CSS-only three-dot orbital loader: the parent continuously rotates while each dot’s pseudo-element wobbles vertically and scales. This is independent of GSAP and can be copied as-is from `src/index.css`.

## 5. About: word entrance and pinned expanding image

Source: `src/components/About.jsx` and `src/components/AnimatedTitle.jsx`

### Animated word title

`AnimatedTitle` accepts a string separated by literal `<br/>` tags. It splits each line and then each word, wrapping every word in `.animated-word`. `<b>` tags are rendered with `dangerouslySetInnerHTML` to preserve display-face accent letters.

Initial CSS state:

```css
.animated-word {
  opacity: 0;
  transform: translate3d(10px, 51px, -60px) rotateY(60deg) rotateX(-40deg);
  transform-origin: 50% 50% -150px;
  will-change: opacity, transform;
}
```

Scroll trigger and reveal:

```js
gsap.timeline({
  scrollTrigger: {
    trigger: containerRef.current,
    start: '100 bottom',
    end: 'center bottom',
    toggleActions: 'play none none reverse',
  },
}).to('.animated-word', {
  opacity: 1,
  transform: 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)',
  ease: 'power2.inOut',
  stagger: 0.02,
})
```

The negative Z transform and transform origin make this feel like words hinge out of depth rather than simply rise. Keep a scoped selector. For untrusted/CMS title content, replace `dangerouslySetInnerHTML` with a safe rich-text renderer or structured React nodes.

### Pinned image expansion

The About section reserves a `100dvh` scroll region (`#clip`). Inside, the image starts as a centered, narrow `60vh` rounded card. Its parent has a rectangular polygon clip. The timeline pins the region for an additional 800px of scroll and grows the mask to the full viewport:

```js
gsap.timeline({
  scrollTrigger: {
    trigger: '#clip',
    start: 'center center',
    end: '+=800 center',
    scrub: 0.5,
    pin: true,
    pinSpacing: true,
  },
}).to('.mask-clip-path', {
  width: '100vw',
  height: '100vh',
  borderRadius: 0,
})
```

This is the main “small media window becomes the world” effect. Tune `+=800` to control how slowly it unfolds. `scrub: 0.5` adds half a second of easing between physical scroll position and animation progress. Use unique class names or scope the selector if more than one `.mask-clip-path` exists on a page.

## 6. Features: bento cards, video media, 3D tilt, cursor glow

Source: `src/components/Features.jsx`

### Layout design

The dark Vault section uses a bento hierarchy:

- one wide lead card (`feature-1.mp4`), 96px high on small screens / 65vh at `md`;
- a responsive stacked composition: tall `zigma` card alongside two half-height cards;
- two smaller final cards: a flat purple announcement and `feature-5.mp4`.

Cards have `overflow-hidden`, a small rounded radius, light translucent border, and media that fills its whole box with `object-cover`. Text is a positioned layer above it (`relative z-10`). Use a `linear-gradient()` overlay if a replacement video needs more contrast.

### Reusable pointer tilt

For each card, convert cursor position to a normalized `0..1` value, offset it around the center, and map it to degrees:

```jsx
const { left, top, width, height } = itemRef.current.getBoundingClientRect()
const relativeX = (event.clientX - left) / width
const relativeY = (event.clientY - top) / height
const tiltX = (relativeY - 0.5) * 5
const tiltY = (relativeX - 0.5) * -5

setTransformStyle(
  `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.98, .98, .98)`
)
```

Apply the transform to the card and clear it in `onMouseLeave`. A CSS `transition-transform: 300ms ease-out` makes the response and reset soft. The ±5° limit is intentionally subtle; more tilt makes type hard to read and feels unstable.

For touch-first devices, omit the pointer tilt or enable it only for `(hover: hover) and (pointer: fine)`.

### Cursor-following pill glow

The “coming soon” pill tracks cursor coordinates inside itself and writes them into an inline radial gradient:

```jsx
background: `radial-gradient(100px circle at ${x}px ${y}px, #656fe288, #00000026)`
```

The gradient layer is absolutely positioned with `pointer-events-none`; opacity changes from 0 to 1 on enter/leave. The icon and text get `relative z-20` so they always remain above the glow. This is a compact way to create interactive light without a canvas.

## 7. Story / Prologue: distorted image mask and larger 3D tilt

Source: `src/components/Story.jsx`

### Composition

The title uses `mix-blend-difference`, causing it to invert against the light/dark values of the image below. The entrance image is nested in a large clip-path mask:

```css
clip-path: polygon(4% 0, 83% 21%, 100% 73%, 0% 100%);
```

It is offset differently at each breakpoint so the image feels oversized and partially cropped rather than contained.

### SVG goo/edge treatment

`.story-img-container` applies `filter: url('#flt_tag')`. The hidden inline SVG defines the filter:

1. `feGaussianBlur` blurs the source by 8.
2. `feColorMatrix` boosts alpha strongly (`19`, offset `-9`) to make a chunky silhouette.
3. `feComposite operator='atop'` composites the original over that result.

This produces the soft, fused edge treatment. Keep the SVG `filter` ID unique if the page can render multiple story components. SVG filters can be GPU-expensive on large media; test on lower-end mobile devices.

### Image tilt

This is the GSAP version of bento tilt. It maps cursor distance from the image center to ±10° and animates each update over 0.3s:

```js
gsap.to(frameRef.current, {
  duration: 0.3,
  rotateX: ((event.clientY - top - centerY) / centerY) * -10,
  rotateY: ((event.clientX - left - centerX) / centerX) * 10,
  transformPerspective: 500,
  ease: 'power1.inOut',
})
```

On mouse leave, reset `rotateX` and `rotateY` to zero. The component currently calls this same reset on `onMouseEnter`, `onMouseLeave`, and `onMouseUp`—the enter handler ensures the image is neutral before the next interaction.

## 8. Contact: collage masks and animated title

Source: `src/components/Contact.jsx`

This section is a black rounded CTA panel. It combines the standard scroll-revealed `AnimatedTitle` with a static image collage:

- Left collage is hidden below `sm`; two photos use different polygon clip paths and vertical offsets.
- Right sword collage is visible at all sizes, positioned partially outside the panel, and layered with a full partial image behind a clipped foreground image.
- The text stays centered above the art due to normal stacking and the collage's absolute positioning.

The exact masks are in global CSS:

```css
.contact-clip-path-1 { clip-path: polygon(25% 0%, 74% 0, 69% 64%, 34% 73%); }
.contact-clip-path-2 { clip-path: polygon(29% 15%, 85% 30%, 50% 100%, 10% 64%); }
.sword-man-clip-path { clip-path: polygon(16% 0, 89% 15%, 75% 100%, 0 97%); }
```

This is a reusable “cut-paper collage” pattern: use two copies/crops of related art, offset and clip only the foreground copy, then let both overflow a rounded parent at selected breakpoints.

## 9. Footer and buttons

Source: `src/components/Footer.jsx` and `src/components/Button.jsx`

The footer is intentionally static: a vivid purple strip, compact legal text, hover color transitions on social icons, and a responsive column-to-row layout at `md`.

`Button` is a reusable pill foundation: `overflow-hidden rounded-full px-7 py-3`, optional left/right icon slots, uppercase small label, and caller-provided color/layout class. It does not currently animate its label despite having `group` and `overflow-hidden`; add a nested duplicate text span with a `translate-y` group-hover transition if you want a rolling-label effect.

## 10. Build checklist for a new project

1. Install `gsap` and `@gsap/react`; register `ScrollTrigger`.
2. Copy or replace the local font files and create the matching `@font-face` plus Tailwind v4 `@theme` tokens.
3. Copy the global helpers/keyframes used by the section you need, not necessarily every utility in `src/index.css`.
4. Place media in the public-assets location and preserve `muted loop playsInline` on ambient video.
5. Build the layout and z-index layers first; add animation only when its start and end visual states work without JavaScript.
6. Use refs/scoped GSAP selectors rather than global duplicate IDs if the effect is reused more than once.
7. Test at mobile, tablet, and desktop widths. `dvh` is used throughout so hero/pinned sections respond better to browser chrome than `vh`.
8. Test keyboard operation: previews and cards implemented as clickable `div`s should become real buttons or links with keyboard handlers.
9. Respect motion preference for production use. The current project does not include it; add a reduced-motion branch that skips looping/scroll-scrub animation.

### Reduced-motion baseline

```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduceMotion) {
  gsap.set(target, { clearProps: 'all', opacity: 1 })
  return
}
```

Also disable or pause decorative autoplay videos when they are off-screen if performance or battery use matters.

## 11. Troubleshooting and implementation notes

- `ScrollTrigger` needs scrollable document space. A pinned scene must have an end distance such as `'+=800'`.
- `clip-path` is animatable when the start/end polygons have compatible point counts. Prefer interpolating the same shape topology; this project changes a four-point rectangle to a four-point quadrilateral.
- `overflow-hidden` is required on each media card, but be careful: it can clip shadows or absolutely-positioned art that is meant to extend outside.
- `mix-blend-difference` depends on what is behind it. Keep its stacking context and test text readability on all image areas.
- Do not use duplicate IDs for reusable component instances. The current hero uses IDs because it appears once; make refs/classes instance-safe when extracting it.
- `src/App.css` is presently unused and contains starter-template CSS. The active global styles are in `src/index.css`.
- Run `npm run build` after extraction. Tailwind v4 produces utilities on demand and rejects invalid `@apply` usages.

## Source index

| Feature | Source |
| --- | --- |
| Page order | `src/App.jsx` |
| Global typography, palette, clip paths, loader, audio bars | `src/index.css` |
| Word entrance | `src/components/AnimatedTitle.jsx` |
| Video hero and morph | `src/components/hero.jsx` |
| Hide/show navigation and soundtrack | `src/components/Navbar.jsx` |
| Pinned About expansion | `src/components/About.jsx` |
| Bento layout, card tilt, cursor glow | `src/components/Features.jsx` |
| Story SVG filter and image tilt | `src/components/Story.jsx` |
| Contact collage | `src/components/Contact.jsx` |
| CTA and footer foundations | `src/components/Button.jsx`, `src/components/Footer.jsx` |
