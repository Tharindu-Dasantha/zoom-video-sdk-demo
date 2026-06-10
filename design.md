# tenon-Link Connect — Design System

> Product tier within the **tenon-Link** lineup  
> Version 2.0 · June 2026

---

## Design philosophy

tenon-Link Connect is built on three principles borrowed from the best infrastructure brands:

**Simplicity** — Every element earns its place. If it can be removed without losing meaning, remove it. No decoration for its own sake.

**Sophistication** — Restraint is the luxury. Tight spacing, precise typography, and a palette of exactly three colours communicate confidence without effort.

**Boldness** — The mark is a silhouette first. It reads at 16px and at 16 feet. Complexity is an implementation detail; the brand is unmistakably one thing.

> The benchmark: would this feel at home between Stripe and Linear? If not, simplify.

---

## Logo

### Mark concept

A single, bold silhouette: two circles joined by a horizontal bar. No outlines, no decoration — just a solid, two-tone shape that reads instantly as "connection." The mark is a filled form, not a wireframe. At small sizes the circles merge into the bar, creating a capsule — this is intentional and should not be corrected.

The form references both a physical connector (two ports, one cable) and the letter *n* — the first letter of *tenon*.

### Construction

```
  ●━━━━━●
```

- Two filled circles, equal diameter, on a shared horizontal axis
- A solid rectangle bridge connecting the inner edges of both circles
- The bridge height equals 40% of the circle diameter
- No stroke, no outline, no inner detail — solid filled shapes only
- The entire mark is one colour: Electric Blue on dark backgrounds, Deep Navy on white

### Clearspace

Minimum clearspace of **1× the mark height** on all sides. On the favicon and app icon, clearspace is built into the container — the mark fills 60% of the bounding box.

### Sizing

| Context          | Mark size    | Container    |
|------------------|-------------|--------------|
| Favicon          | 10 × 6 px   | 16 × 16 px   |
| App icon small   | 17 × 10 px  | 28 × 28 px   |
| UI / navbar      | 24 × 14 px  | 40 × 40 px   |
| Marketing        | 34 × 20 px  | 56 × 56 px   |
| Hero / print     | 48 × 28 px  | 80 × 80 px   |

At 16px favicon size, render as a 2:1 capsule — skip the circle definition entirely. At 28px and above, the two-circle form is legible.

### Wordmark

Set in **Inter 600**, sentence case, no custom spacing:

```
tenon-Link Connect
```

- `tenon-Link` — White `#FFFFFF` on dark, Deep Navy `#0A1628` on white
- `Connect` — Electric Blue `#2563EB`
- Letter-spacing: −0.025em
- The hyphen in `tenon-Link` is part of the name — never drop it, never replace with an en-dash

### Logo lockup

Mark sits to the left of the wordmark. Vertical centre-aligned. Gap between mark and wordmark: 10px at default scale.

No stacked (mark above wordmark) variant. The horizontal lockup is the only approved form.

### Logo variations

| Variant       | Background   | Mark fill     | Wordmark                        |
|---------------|-------------|---------------|---------------------------------|
| Primary       | Deep Navy   | Electric Blue | White + Electric Blue           |
| Reversed      | White       | Deep Navy     | Deep Navy + Electric Blue       |
| Monochrome    | Any         | currentColor  | currentColor (single colour)    |
| On photo      | Dark overlay| White         | White only (no blue split)      |

### Forbidden usages

- Do not outline the mark — it is a filled silhouette, not a stroke illustration
- Do not add effects: no shadow, glow, gradient, or blur
- Do not place the mark on a mid-tone background where contrast falls below 4.5:1
- Do not scale the mark and wordmark independently — lock them as a unit
- Do not use the wordmark without the mark in marketing contexts
- Do not recreate the mark with rounded rectangle corners — the bridge is a rectangle, not a pill

---

## Colour palette

Exactly three colours. No exceptions in primary brand usage.

### Core three

| Name           | Hex       | RGB               | Role                                      |
|----------------|-----------|-------------------|-------------------------------------------|
| Deep Navy      | `#0A1628` | 10, 22, 40        | Primary background, text on light         |
| Electric Blue  | `#2563EB` | 37, 99, 235       | Brand accent, CTAs, links, the mark       |
| White          | `#FFFFFF` | 255, 255, 255     | Text on dark, light surfaces, space       |

### Extended palette

These are derivations of the core three — not additional colours. Use sparingly and only in UI contexts.

| Name             | Hex       | Derivation                      | Usage                            |
|------------------|-----------|---------------------------------|----------------------------------|
| Navy 800         | `#0F1F3D` | Deep Navy lightened 8%          | Card surfaces, secondary bg      |
| Navy 700         | `#162947` | Deep Navy lightened 14%         | Hover states on dark surfaces    |
| Navy 600         | `#1E3A5F` | Deep Navy lightened 22%         | Borders, dividers on dark        |
| Navy 400         | `#2A5278` | Deep Navy lightened 34%         | Muted text, secondary labels     |
| Navy 200         | `#7BA8D4` | Deep Navy lightened 60%         | Disabled states, placeholders    |
| Blue 700         | `#1D4ED8` | Electric Blue darkened 8%       | Button hover, pressed state      |
| Blue 100         | `#DBEAFE` | Electric Blue at 12% opacity    | Tinted surfaces, info backgrounds|
| White 60         | `rgba(255,255,255,0.60)` | —             | Secondary text on dark           |
| White 30         | `rgba(255,255,255,0.30)` | —             | Tertiary text, placeholders      |
| White 10         | `rgba(255,255,255,0.10)` | —             | Subtle borders on dark           |

### Semantic colours

These are the only non-palette colours permitted. Used exclusively for status communication.

| State    | Hex       | Background tint | Usage                       |
|----------|-----------|-----------------|-----------------------------|
| Success  | `#10B981` | `#052E1C`       | Connected, healthy          |
| Warning  | `#F59E0B` | `#2D1A00`       | Degraded, rate-limited      |
| Error    | `#EF4444` | `#2D0A0A`       | Failed, disconnected        |
| Neutral  | `#7BA8D4` | `#0F1F3D`       | Standby, pending            |

### Colour rules

- The palette is Deep Navy, Electric Blue, and White. Every design decision starts here.
- Electric Blue is never used for large fills — it is an accent, not a background
- White is used generously — whitespace is not empty, it is structure
- Never use Electric Blue text on a white background for body copy — contrast is fine but it reads as a link
- Dark UI is the default. Light UI (white background, Deep Navy text) is used for documentation and onboarding only

---

## Typography

### Typefaces

| Role        | Family  | Weights       | Source              |
|-------------|---------|---------------|---------------------|
| Brand / UI  | Inter   | 400, 500, 600 | Google Fonts / rsms |
| Data / Code | Inter   | 400           | Same family, mono feature |

One typeface. Inter is the only font in the system. Its optical precision at small sizes and wide language support make it the correct choice for infrastructure software. Do not introduce a second display font.

For code and data contexts, use Inter with `font-variant-numeric: tabular-nums` and `font-feature-settings: "tnum"`.

### Type scale

| Level      | Size  | Weight | Tracking  | Line height | Usage                           |
|------------|-------|--------|-----------|-------------|----------------------------------|
| Display    | 40px  | 600    | −0.03em   | 1.1         | Hero, splash, marketing          |
| Heading 1  | 28px  | 600    | −0.02em   | 1.15        | Page titles                      |
| Heading 2  | 22px  | 600    | −0.015em  | 1.2         | Section headings                 |
| Heading 3  | 17px  | 600    | −0.01em   | 1.3         | Card titles, panel headings      |
| Body       | 15px  | 400    | 0         | 1.65        | Paragraph text                   |
| Body small | 13px  | 400    | 0         | 1.55        | Captions, secondary descriptions |
| Label      | 11px  | 500    | +0.08em   | 1.4         | Status labels, metadata tags     |
| Mono       | 13px  | 400    | 0         | 1.5         | API strings, endpoints, code     |

### Label style

Labels are uppercase, tracked, and small. They introduce sections and annotate status — never used for prose.

```
INTEGRATION STATUS · LIVE
```

Style: 11px / Inter 500 / uppercase / +0.08em tracking / White 60 or Electric Blue depending on context.

### Type rules

- Sentence case everywhere except labels
- Maximum weight is 600 — never 700 or 900 in UI
- Headlines never exceed two lines
- Body text minimum: 13px
- Contrast minimum: 4.5:1 for all text, 7:1 preferred for body on dark backgrounds

---

## Spacing and layout

### Base unit

All spacing uses an **8px base grid**. Every margin, padding, and gap is a multiple of 8.

```
4px   — hairline separation (icon-to-label gap)
8px   — tight internal padding
16px  — default component padding
24px  — section breathing room
32px  — component separation
48px  — major section breaks
64px  — hero / page-level spacing
```

### Border radius

| Context             | Radius |
|---------------------|--------|
| Buttons, chips      | 6px    |
| Cards, panels       | 10px   |
| Modals, sheets      | 14px   |
| App icon container  | 22%    |
| Pill / badge        | 999px  |

No border radius on the logo mark itself — the mark geometry is defined by circle mathematics, not CSS rounding.

### Borders

One border weight: `1px solid`. Never 0.5px, never 2px (except focus rings).

- On dark: `rgba(255,255,255,0.10)` — White 10
- On light: `rgba(10,22,40,0.12)` — Deep Navy at 12% opacity
- Focused element: `2px solid #2563EB`

---

## Iconography

### Style

Outline, 1.5px stroke, rounded caps and joins. The icon style mirrors the wordmark weight — both are 600-equivalent in optical weight.

Source library: **Phosphor Icons** (Regular weight) or **Heroicons** (outline).

No filled icons in UI. No multi-colour icons. Icons are always one colour — inherited from parent (White, Navy 200, or Electric Blue depending on context).

### Sizing

| Context            | Size  |
|--------------------|-------|
| Inline with text   | 16px  |
| Button / action    | 18px  |
| Feature / UI       | 20px  |
| Decorative section | 24px  |

### Key icon set

| Concept           | Phosphor           | Heroicons              |
|-------------------|--------------------|------------------------|
| Connection        | `LinkSimple`       | `link`                 |
| Integration       | `PlugsConnected`   | —                      |
| Live status       | `PulseActivity`    | `signal`               |
| API               | `Code`             | `code-bracket`         |
| Settings          | `GearSix`          | `cog-6-tooth`          |
| Sync              | `ArrowsClockwise`  | `arrow-path`           |
| Alert             | `Warning`          | `exclamation-triangle` |
| Success           | `CheckCircle`      | `check-circle`         |
| Disconnect        | `LinkBreak`        | —                      |

---

## Components

### Buttons

**Primary:**
```
background:  #2563EB
color:       #FFFFFF
font:        Inter 500 / 14px
border:      none
radius:      6px
padding:     9px 18px
hover:       background #1D4ED8
active:      background #1D4ED8, scale(0.98)
focus:       2px solid #2563EB, 2px offset
```

**Secondary (ghost):**
```
background:  transparent
color:       #FFFFFF
border:      1px solid rgba(255,255,255,0.20)
radius:      6px
padding:     9px 18px
hover:       background rgba(255,255,255,0.06)
```

**Destructive:**
```
background:  transparent
color:       #EF4444
border:      1px solid rgba(239,68,68,0.30)
hover:       background rgba(239,68,68,0.08)
```

### Badges and chips

**Product badge:**
```
background:  #0F1F3D
border:      1px solid rgba(255,255,255,0.10)
color:       rgba(255,255,255,0.60)
font:        Inter 500 / 11px / uppercase / +0.08em
radius:      999px
padding:     3px 10px
dot:         6px, #10B981 (active) or #7BA8D4 (standby)
```

**Status chips:**

| State    | Background | Text       | Dot        |
|----------|------------|------------|------------|
| Active   | `#052E1C`  | `#10B981`  | `#10B981`  |
| Standby  | `#0F1F3D`  | `#7BA8D4`  | `#7BA8D4`  |
| Degraded | `#2D1A00`  | `#F59E0B`  | `#F59E0B`  |
| Error    | `#2D0A0A`  | `#EF4444`  | `#EF4444`  |

### Cards

**Standard surface:**
```
background:  #0F1F3D
border:      1px solid rgba(255,255,255,0.08)
radius:      10px
padding:     20px 24px
```

**Featured / highlighted:**
```
background:  #0F1F3D
border:      1px solid #2563EB
radius:      10px
padding:     20px 24px
```

**On white (light UI):**
```
background:  #FFFFFF
border:      1px solid rgba(10,22,40,0.10)
radius:      10px
padding:     20px 24px
box-shadow:  0 1px 4px rgba(10,22,40,0.06)
```

### Input fields

```
background:  rgba(255,255,255,0.05)
border:      1px solid rgba(255,255,255,0.12)
color:       #FFFFFF
font:        Inter 400 / 14px
radius:      6px
padding:     9px 14px
placeholder: rgba(255,255,255,0.30)
focus:       border-color #2563EB, no background change
```

---

## Motion

Animation is used to confirm state changes, never to decorate. Timings:

| Type             | Duration | Easing                     |
|------------------|----------|----------------------------|
| Micro (hover)    | 80ms     | ease                       |
| State change     | 140ms    | ease-out                   |
| Panel / modal    | 200ms    | cubic-bezier(0.2, 0, 0, 1) |
| Page transition  | 240ms    | cubic-bezier(0.2, 0, 0, 1) |

No bounce, no spring, no overshoot. Motion is invisible when it is working correctly.

---

## Voice and tone

### Brand voice

**Minimal.** One idea per sentence. One sentence per thought.

**Technical without jargon.** Use the word your user would use, not the word that sounds impressive.

**Confident without arrogance.** The product does not need to announce its own quality — it demonstrates it.

### Headline formula

Subject + verb + object. Maximum five words. Prefer noun phrases.

```
One link. Every system.
Infrastructure that stays connected.
Built for the critical path.
```

### UI copy rules

- Status: `Connected` · `Disconnected` · `Degraded` · `Pending` — no punctuation, no verb, no emoji
- Errors: state the cause first, then the remedy. "Request timed out. Check the endpoint URL."
- Success: one word where possible. "Connected." "Saved." "Done."
- Never write "successfully" — if it worked, the state shows it
- Use `you` / `your`. Never `we` / `our` in UI strings

---

## Within the tenon-Link lineup

All tenon-Link products share: Deep Navy as the primary surface, Inter as the typeface, the two-circle mark geometry, and the lockup structure.

Each tier is differentiated only by its accent colour. The mark, wordmark structure, and spacing rules are identical across all tiers.

| Product             | Accent      | Hex       |
|---------------------|-------------|-----------|
| tenon-Link Connect  | Electric Blue | `#2563EB` |
| tenon-Link Sync     | Emerald     | `#10B981` |
| tenon-Link Monitor  | Amber       | `#F59E0B` |
| tenon-Link Gateway  | Violet      | `#7C3AED` |

The accent colour appears in: the tier name in the wordmark, the primary button, status-active indicators, focus rings, and the mark on light backgrounds. Everything else is Deep Navy, White, or a derivation.

---

## Design tokens (CSS)

```css
:root {
  /* Core */
  --tl-navy:          #0A1628;
  --tl-blue:          #2563EB;
  --tl-white:         #FFFFFF;

  /* Navy scale */
  --tl-navy-800:      #0F1F3D;
  --tl-navy-700:      #162947;
  --tl-navy-600:      #1E3A5F;
  --tl-navy-400:      #2A5278;
  --tl-navy-200:      #7BA8D4;

  /* Blue scale */
  --tl-blue-700:      #1D4ED8;
  --tl-blue-100:      #DBEAFE;

  /* White alpha */
  --tl-white-60:      rgba(255,255,255,0.60);
  --tl-white-30:      rgba(255,255,255,0.30);
  --tl-white-10:      rgba(255,255,255,0.10);

  /* Semantic */
  --tl-success:       #10B981;
  --tl-warning:       #F59E0B;
  --tl-error:         #EF4444;
  --tl-neutral:       #7BA8D4;

  /* Typography */
  --tl-font:          'Inter', system-ui, sans-serif;
  --tl-font-mono:     'Inter', monospace;

  /* Radius */
  --tl-radius-sm:     6px;
  --tl-radius-md:     10px;
  --tl-radius-lg:     14px;

  /* Motion */
  --tl-ease:          cubic-bezier(0.2, 0, 0, 1);
  --tl-duration-sm:   80ms;
  --tl-duration-md:   140ms;
  --tl-duration-lg:   200ms;
}
```

---

## Assets checklist

- [ ] Logo mark — SVG (filled silhouette), dark and light variants
- [ ] Logo lockup — SVG, dark, light, monochrome, on-photo
- [ ] Favicon — SVG (capsule form at 16px), ICO fallback
- [ ] App icon set — 28, 40, 56, 80, 512px with rounded-rect container
- [ ] Open Graph image — 1200 × 630px, Deep Navy, centred lockup
- [ ] Design tokens — `tokens.css` and `tokens.json`
- [ ] Typeface — Inter loaded from rsms.me/inter or Google Fonts (SIL OFL)

---

*tenon-Link Connect Design System · v2.0 · Revised for Apple-level simplicity, Stripe-level sophistication*
