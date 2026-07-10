# InGoedendoen Design System

> **"Voor een gezond, fit en vrolijk leven."**
> Gezondheidsweetjes voor mensen met plezier in het leven.

InGoedendoen is a Dutch health & lifestyle content brand. The product is a knowledge-rich editorial website that publishes approachable health tips, nutrition guides, fitness advice, and mindfulness content — aimed at people who genuinely enjoy living well, not just those driven by discipline.

---

## Sources

This design system was bootstrapped from the following materials:

| Source | Notes |
|--------|-------|
| Brand color palette | Provided directly: `#a9d300 #232323 #ffffff #dc0074 #e8e8e8 #00a9ff #5d5d5d` |
| Font files | Inter (18pt + 28pt optical sizes) + STIX Two Text (variable weight), all `.ttf`, uploaded directly |
| Brand brief | "Warm, fresh, toegankelijk" (warm, fresh, accessible) |

No Figma files or existing codebase were provided. Components and UI kit are designed from first principles using the palette and typographic assets above.

---

## Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `--color-lime-400` | `#a9d300` | Primary brand — energy, health, optimism |
| `--color-pink-500` | `#dc0074` | Accent — warmth, excitement, CTAs |
| `--color-blue-500` | `#00a9ff` | Info — trust, clarity, links |
| `--color-neutral-900` | `#232323` | Primary text |
| `--color-neutral-600` | `#5d5d5d` | Secondary text |
| `--color-neutral-200` | `#e8e8e8` | Borders, dividers |
| `--color-neutral-0` | `#ffffff` | Page background |

Full scale (100–900 tints/shades) defined in `tokens/colors.css`.

---

## Typography

Two complementary typefaces:

### Inter (sans-serif)
- **Inter Text** (18pt optical size) — body copy, UI labels, captions, navigation. Used at ≤ 20px.
- **Inter Display** (28pt optical size) — headings, hero titles, large callouts. Used at ≥ 24px.

### STIX Two Text (variable serif)
Editorial serif for article long-reads, pull quotes, and decorative subheadings. Weight range 400–700; italic variant available. Adds gravitas and warmth to otherwise clean sans-serif layouts.

CSS variable tokens: `--font-sans`, `--font-display`, `--font-serif`

---

## Content Fundamentals

### Language & Tone
- Written in **Dutch (NL)** — casual, warm, personal register. Uses *jij/je* (you) rather than *u* (formal you).
- Voice is that of a knowledgeable, enthusiastic friend — not a doctor or authority figure.
- **Encouraging & upbeat**: celebrates small wins, avoids shame or negativity around health topics.
- Copy is punchy and concrete: "3 tips voor meer energie" beats "An exploration of energy-boosting strategies".
- **Short sentences, active verbs**: "Eet meer groenten." over "It is recommended that vegetables be consumed."

### Casing
- **Sentence case everywhere** — including headings and buttons. Never title-case: "Zo eet jij gezonder" not "Zo Eet Jij Gezonder".
- Category labels use lowercase: *voeding*, *beweging*, *mindset*, *recepten*.
- Exception: the brand name "InGoedendoen" uses its own camel-cased capitalisation.

### Emoji
- Used sparingly and only in editorial contexts (social posts, newsletter subjects), never in UI chrome.
- When used: single, purposeful, not decorative clusters.

### Numbers & Units
- Metric always (km, kg, kcal, ml).
- Times as "5 min lezen" not "5 minutes reading time".
- Percentages written as digits: 80%, not tachtig procent.

### Copy examples

> *"Wist je dat 20 minuten wandelen al genoeg is om je humeur te verbeteren?"*

> *"Onze favoriete recepten voor als je wil genieten én gezond eten."*

> *"Geen ingewikkelde diëten. Gewoon slimmer eten."*

---

## Visual Foundations

### Color
Lime green (`#a9d300`) is the dominant brand hue — used for primary buttons, active states, category labels, and hover accents. It radiates energy and freshness without feeling clinical.

Hot pink (`#dc0074`) is reserved for high-urgency CTAs (newsletter sign-up, featured articles), not sprinkled throughout. Creates a vivid contrast pop against lime.

Blue (`#00a9ff`) is used only for informational content: links in body text, info badges, data callouts.

Backgrounds are predominantly white with neutral-100 (`#f5f5f5`) for section alternation. Dark surfaces (`#232323`) appear in the navigation bar and full-bleed section headers.

### Typography
- Headings: Inter Display, bold/semibold, tight letter-spacing, high visual weight.
- Body: Inter Text at 16–18px, generous line-height (1.65), optimised for long reads.
- Article body: STIX Two Text at 18px, loose line-height (1.8) — the serif imparts editorial warmth for longer content.
- Type scale ratios: roughly 1.25× (Major Third) from body upward.

### Spacing
4px base grid. Components use multiples: 8, 12, 16, 24, 32, 48, 64px. Section padding is generous (80–96px vertical).

### Backgrounds & Imagery
- Page backgrounds: clean white, occasionally neutral-50 for section breaks.
- Hero imagery: full-bleed photos, always warm-toned and approachable (natural light, real people, fresh food). No stock-photo sterility.
- No heavy gradients — a light gradient overlay (dark-to-transparent) is used over hero images for text legibility.
- Card images use a 3:2 or 16:9 ratio with `object-fit: cover`.

### Corner Radius
- Small interactive elements (badges, tags): `--radius-full` (pill shape)
- Cards: `--radius-lg` (12px) — friendly without being childish
- Buttons: `--radius-full` for primary/accent; `--radius-md` for tertiary/ghost
- Inputs: `--radius-md` (8px)
- Modals / panels: `--radius-xl` (16px)

### Cards
White background, `--shadow-sm` at rest, `--shadow-md` on hover. Subtle border (`1px solid --color-neutral-200`) on cards without images. No coloured left-border accents. Image always top-aligned.

### Shadows
Very light, warm-tinted shadows. No hard drop shadows. Brand-tinted shadow (`--shadow-brand`) for featured/hero cards.

### Animations & Transitions
- Duration: 100–160ms for interactions; 300ms for page transitions.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — snappy spring feel.
- Hover: subtle scale-up (1.02×) on cards; background/color shift on buttons.
- Press: scale-down (0.97×) with fast easing.
- No decorative looping animations on content. Micro-animations only.

### Hover & Press States
- Buttons: background shifts to slightly darker tint; no opacity reduction.
- Cards: `transform: translateY(-2px)` + enhanced shadow on hover.
- Links: colour shift + underline on hover.
- Tags: background tint shifts.

### Icons
Lucide icon set (CDN). Stroke-width 1.5–2, consistent sizing at 16/20/24px. No filled icons unless indicating an active/selected state.

### Borders
`1px solid --color-neutral-200` as the default border. `2px` for form inputs to give tactility. Active/focus: `2px solid --color-lime-400`.

---

## Iconography

**Icon library**: [Lucide](https://lucide.dev) (CDN: `https://unpkg.com/lucide@latest`)
- Loaded via: `<script src="https://unpkg.com/lucide@latest"></script>` + `lucide.createIcons()`
- Usage: `<i data-lucide="heart"></i>` → renders outlined SVG icon.
- Stroke weight: 1.5px for decorative; 2px for UI chrome.
- Sizes: 16px (inline), 20px (buttons), 24px (navigation), 32px (feature icons).

No custom icon font or sprite sheet was provided. Lucide is a direct match in visual style — clean, outlined, geometric. No emoji used as icons in UI chrome.

Common icons in use:
| Context | Icon name |
|---------|-----------|
| Navigation menu | `menu` |
| Search | `search` |
| Heart / save | `heart` |
| Article | `file-text` |
| Nutrition | `salad` |
| Fitness | `dumbbell` |
| Mindset | `brain` |
| Recipes | `chef-hat` |
| Clock / read time | `clock` |
| Arrow | `arrow-right` |
| Share | `share-2` |

---

## File Structure

```
styles.css                  ← Global entry point (import only)
readme.md                   ← This file
SKILL.md                    ← Skill definition for Claude Code

tokens/
  fonts.css                 ← @font-face declarations
  colors.css                ← Color tokens (base + semantic)
  typography.css            ← Font family, size, weight, leading tokens
  spacing.css               ← Spacing scale + radius + layout + z-index
  effects.css               ← Shadows, transitions, easing, focus
  base.css                  ← Minimal reset + base element styles

assets/
  fonts/                    ← Inter (18pt + 28pt) + STIX Two Text TTF files

guidelines/
  brand-identity.card.html  ← Brand colors + wordmark
  colors-brand.card.html    ← Primary color swatches
  colors-neutral.card.html  ← Neutral scale
  colors-semantic.card.html ← Semantic color tokens
  type-display.card.html    ← Inter Display specimens
  type-body.card.html       ← Inter Text specimens
  type-serif.card.html      ← STIX Two Text specimens
  type-scale.card.html      ← Full type scale H1–caption
  spacing.card.html         ← Spacing + radius visual scale
  effects.card.html         ← Shadows + transitions

components/
  core/
    Button.jsx / .d.ts / .prompt.md
    Card.jsx   / .d.ts / .prompt.md
    Badge.jsx  / .d.ts / .prompt.md
    Input.jsx  / .d.ts / .prompt.md
    Tag.jsx    / .d.ts / .prompt.md
    core.card.html          ← Component showcase card

ui_kits/
  website/
    index.html              ← Interactive website mockup
    Navigation.jsx
    HomePage.jsx
    ArticlePage.jsx
```

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `Button` | `components/core/Button.jsx` | Primary interactive trigger — variant, size, disabled |
| `Card` | `components/core/Card.jsx` | Article / content card with image, category, title, meta |
| `Badge` | `components/core/Badge.jsx` | Compact status or category label |
| `Input` | `components/core/Input.jsx` | Text input with label, hint, error states |
| `Tag` | `components/core/Tag.jsx` | Interactive filter/category chip |

Access via `window.IGDS.<ComponentName>` (see `check_design_system` for exact namespace).

---

## UI Kits

| Kit | Path | Screens |
|-----|------|---------|
| Website | `ui_kits/website/index.html` | Homepage, Article view |

---

*Last updated: June 2026. Design system bootstrapped for InGoedendoen by Diversions.*
