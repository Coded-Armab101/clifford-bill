# awwards — project notes

Zentry-style landing page. React 19 + Vite 8 + **Tailwind CSS v4**.

## Important: Tailwind v4, not v3

This project uses Tailwind **v4.3.3**. Most Zentry/awwwards tutorials are written for **v3**, so their
config instructions will not match this repo. There is deliberately **no `tailwind.config.js`** and no
`postcss.config.js` — v4 moved configuration into CSS.

Everything lives in `src/index.css`.

### Translating v3 tutorial steps to v4

| v3 tutorial says | do this instead |
| --- | --- |
| edit `tailwind.config.js` | edit the `@theme` block in `src/index.css` |
| `theme.extend.fontFamily` | `--font-<name>: "<family>", sans-serif;` |
| `theme.extend.colors` | `--color-<name>-<shade>: #hex;` |
| `content: [...]` | nothing — v4 auto-detects template files |
| `@tailwind base/components/utilities` | `@import "tailwindcss";` |

### Fonts need two halves

`@font-face` loads the file (browser-level); `@theme` names it for Tailwind (generates `font-*`).
Both are required — `@theme` alone loads nothing.

```css
@theme { --font-zentry: "zentry", sans-serif; }        /* → font-zentry utility */
@layer base {
  @font-face { font-family: "zentry"; src: url('/fonts/zentry-regular.woff2') format('woff2'); }
}
```

Font files live in `public/fonts/`, referenced by absolute path (`/fonts/...`).

### Colors

One `--color-*` variable yields every color utility for that shade — `bg-`, `text-`, `border-`,
`ring-`, `outline-`, `fill-`, `stroke-`, `from-`, `caret-`, `decoration-`. Non-standard shades
like `75` are allowed.

Caveat: `blue`, `violet`, `yellow` are built-in palettes. Defining `--color-blue-50` overrides only
that shade — `bg-blue-500` still returns stock Tailwind blue. To remove the defaults entirely, add
`--color-blue-*: initial;` *before* your definitions.

### `@apply` only takes real utilities

v4 hard-fails with `Cannot apply unknown utility class X` if you `@apply` one of your own classes.
Register it as a utility first:

```css
@utility border-hsla { @apply border border-white/20; }
```

A plain `.foo {}` in `@layer utilities` is fine as a `className`; it breaks *only* when `@apply`d.
`@utility` must sit at top level, not nested inside `@layer`.

## Verifying a change

`npm run build`, then inspect the emitted CSS — don't assume:

```bash
npm run build
grep -o '\.your-class{[^}]*}' dist/assets/*.css
```

v4 generates **on demand**. A `@theme` variable missing from the output usually means nothing uses it
yet, not that it's broken. `@apply`d utilities get inlined into the consuming rule rather than
emitted standalone.

## Known loose ends

- `src/App.css` is not imported anywhere — dead code.
- `src/components/hero.jsx` exists but `App.jsx` does not import it.
- Not a git repository. Run `git init` to get real change history.

## Change log

### 2026-08-21
- Installed `tailwindcss@4.3.3` + `@tailwindcss/vite@4.3.3`; registered plugin in `vite.config.js`.
- Created `src/index.css` (`main.jsx` already imported it but the file did not exist — latent break).
- Added `@theme` fonts: zentry, general, circular-web, robert-medium, robert-regular, plus the
  missing `zentry` `@font-face`.
- Fixed `body`: unquoted `background-color: #dfdff0` (a quoted hex is an invalid CSS value and was
  being dropped); `font-family` → `var(--font-general)` (was `'General Sans'`, a family not loaded here).
- Added blue/violet/yellow `@theme` colors. Note `blue-75` was given as a 7-digit hex `DFDFFF2`;
  used `#dfdff2`.
- Build was failing with `Cannot apply unknown utility class special-font`. Converted `special-font`
  and `border-hsla` to `@utility` blocks; removed the duplicate `.special-font b` rule.
