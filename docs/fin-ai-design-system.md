# Fin.ai Design System — Complete Visual Extraction

> Extracted from scraped HTML: `capabilities.html`, `voice.html`, `channels.html`, `train.html`
> CSS theme file: `_next/static/css/7af3ded2bd6e14f5.css`

---

## Table of Contents

- [A. Hero Sections](#a-hero-sections)
- [B. Section Blocks](#b-section-blocks)
- [C. Feature Cards](#c-feature-cards)
- [D. FAQ Accordion](#d-faq-accordion)
- [E. CTA Banner](#e-cta-banner)
- [F. Color System](#f-color-system)
- [G. Typography System](#g-typography-system)
- [H. Button Variants](#h-button-variants)
- [I. Link Variants](#i-link-variants)
- [J. Chapter Navigation (sidebar)](#j-chapter-navigation)
- [K. Layout Grid & Container System](#k-layout-grid--container-system)

---

## A. Hero Sections

All hero sections use container queries (`@container`) with a 12-column grid at max-width 1600px.

### Shared Container Structure

```html
<div class="@container relative overflow-hidden">
  <!-- Optional: background bleed visual (varies per page) -->

  <div class="mx-auto w-full max-w-[1600px] px-3 relative grid grid-cols-12 items-center gap-x-4 pt-32 pb-14 md:px-10 lg:px-6 lg:py-0">
    <!-- Content column -->
    <div class="col-span-12 lg:col-span-6 ...">
      <h1>...</h1>
      <p>...</p>
      <div><!-- buttons --></div>
    </div>
    <!-- Visual/media column (optional) -->
    <div class="col-span-12 lg:col-span-6 ...">
      <!-- image/animation -->
    </div>
  </div>
</div>
```

### H1 Variants

#### Capabilities (standard size)
```
font-serif font-light
text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem]
leading-[1]
tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem]
max-w-[20ch]
text-content-primary/60
[&>strong]:font-normal [&>strong]:text-content-primary
```
**Content**: `<strong>Built to resolve the most complex queries on every channel</strong>` (all highlighted)

#### Voice / Train (larger size)
```
enable-ligatures font-serif font-light
text-[2.75rem] md:text-[4.5rem] xl:text-[6rem]
leading-[1]
tracking-[-0.125rem] md:tracking-[-0.219rem] xl:tracking-[-0.188rem]
max-w-[20ch]
text-content-primary/60
[&>strong]:font-normal [&>strong]:text-content-primary
```
**Voice content**: `People prefer <strong class="block xl:text-right">talking to Fin</strong>`
**Train content**: `Train Fin to resolve <strong>all your queries</strong>`

#### Channels (unique animated layout)
```
text-current mx-auto w-full font-serif
text-[44px]/none font-light tracking-tighter
md:text-[3.5rem] lg:text-7xl xl:text-[5.05rem]/none 2xl:text-8xl/none
```
**Content**: Uses inline animated channel switcher `<div>` with channel names cycling.
Ghost text uses `text-white/60`, not `text-content-primary/60`.

### Ghost-Text Pattern

The "ghost text" effect = base text at **60% opacity**, strong/highlight words at **100%**:
```css
/* Applied via Tailwind's /60 modifier */
text-content-primary/60
/* Which compiles to: */
color: color-mix(in oklab, var(--color-content-primary) 60%, transparent);

/* Children get full opacity: */
[&>strong]:text-content-primary
/* or */
[&>strong]:font-normal [&>strong]:text-content-primary
```

### Description Paragraph
```
font-sans
text-[1rem] md:text-[1rem] xl:text-[1.125rem]
leading-[1.375] md:leading-[1.375] xl:leading-[1.33]
tracking-[0rem]
max-w-[35ch]
text-content-primary/60
```

---

## B. Section Blocks

All content sections share a common structure: a colored block with corner decorations, a label row, heading group, and content area.

### Full Section Markup

```html
<section
  id="train"
  data-slugify="id"
  class="relative bg-background-elevated px-3 py-6 text-content-primary md:px-6 md:py-8 lg:px-12 lg:pb-12 scroll-mt-20 md:my-0 md:scroll-mt-24 [&>[data-slot='content']]:space-y-12 md:[&>[data-slot='content']]:space-y-20"
>
  <!-- Corner decorations (4 total) -->
  <span role="presentation" aria-hidden="true"
    class="absolute h-6 w-6 border-border-decorative top-0 left-0 border-t border-l md:top-2 md:left-2 hidden md:block z-10"></span>
  <span role="presentation" aria-hidden="true"
    class="absolute h-6 w-6 border-border-decorative top-0 right-0 border-t border-r md:top-2 md:right-2 hidden md:block z-10"></span>
  <span role="presentation" aria-hidden="true"
    class="absolute h-6 w-6 border-border-decorative bottom-0 left-0 border-b border-l md:bottom-2 md:left-2 hidden md:block z-10"></span>
  <span role="presentation" aria-hidden="true"
    class="absolute h-6 w-6 border-border-decorative bottom-0 right-0 border-b border-r md:bottom-2 md:right-2 hidden md:block z-10"></span>

  <!-- Section label row -->
  <div class="font-mono uppercase text-[0.6875rem] leading-[1.273] tracking-[0.094rem] mb-6 flex items-center gap-2 border-b border-border-decorative pt-2 lg:pb-3 pb-2">
    <span class="mr-6 font-mono text-xs text-content-tertiary md:mr-10">01</span>
    Train
  </div>

  <!-- Heading group (12-col grid) -->
  <hgroup class="grid grid-cols-12 gap-x-4 gap-y-6 xl:grid-cols-10">
    <h2 class="col-span-12 xl:col-span-7 font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] text-content-primary/60 [&>strong]:font-normal [&>strong]:text-content-primary">
      <strong>Knowledge and procedures</strong> that resolve your customers' queries
    </h2>
    <p class="col-span-12 xl:col-start-8 xl:col-span-3 xl:self-end xl:text-right font-sans text-[0.875rem] leading-[1.286] tracking-[0.031rem] text-content-secondary">
      Description text here
    </p>
  </hgroup>

  <!-- Content area -->
  <div data-slot="content">
    <!-- Feature cards, subsections, etc. -->
  </div>
</section>
```

### Section Label Classes
```
font-mono uppercase
text-[0.6875rem]
leading-[1.273]
tracking-[0.094rem]
mb-6
flex items-center gap-2
border-b border-border-decorative
pt-2 lg:pb-3 pb-2
```

### Section Heading (H2) Classes
```
font-serif font-light
text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem]
leading-[1]
tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem]
text-content-primary/60
[&>strong]:font-normal [&>strong]:text-content-primary
```

### Number Prefix
```html
<span class="mr-6 font-mono text-xs text-content-tertiary md:mr-10">01</span>
```

---

## C. Feature Cards

### Card Container
```html
<div class="relative size-full border border-border-decorative bg-background-highlight">
  <!-- Dot pattern overlay -->
  <div class="absolute inset-0 h-full w-full bg-[radial-gradient(color-mix(in_oklab,var(--color-content-primary)_10%,_transparent)_1px,transparent_1px)] [background-size:20px_20px] z-0">
  </div>

  <div data-slot="card-inner" class="relative z-3 flex h-full flex-col p-4 md:p-5 lg:p-8">
    <!-- Badge/label -->
    <div class="inline-flex border border-border-decorative bg-background-highlight px-2.5 py-2 absolute -top-px -left-px z-3">
      <span class="font-mono uppercase text-[0.6875rem] leading-[1.273] tracking-[0.094rem]">Feature Name</span>
    </div>

    <!-- Image area -->
    <div class="relative mt-10 mb-6 overflow-hidden lg:mb-8">
      <picture>
        <img class="w-full" loading="lazy" alt="..." />
      </picture>
    </div>

    <!-- Text content -->
    <div class="mt-auto flex flex-col gap-2">
      <h3 class="font-sans text-[1rem] md:text-[1rem] xl:text-[1.125rem] leading-[1.375] md:leading-[1.375] xl:leading-[1.33] tracking-[0rem] text-content-primary">
        Card Title
      </h3>
      <p class="font-sans text-[0.875rem] leading-[1.286] tracking-[0.031rem] text-content-secondary">
        Card description text
      </p>
    </div>
  </div>
</div>
```

### Card Grid Layout

Cards sit inside a `@container` grid:
```
<!-- Standard card (1/3 width at @5xl, 1/2 at @2xl, full at mobile) -->
col-span-12 @2xl:col-span-6 @5xl:col-span-4

<!-- Featured card (full-width) -->
col-span-12 @2xl:[&>[data-slot='card-inner']]:gap-y-6.25

<!-- Cards grid wrapper -->
grid grid-cols-12 gap-2 @2xl:gap-3
```

### Dot Pattern (Standalone CSS)
```css
background-image: radial-gradient(
  color-mix(in oklab, var(--color-content-primary) 10%, transparent) 1px,
  transparent 1px
);
background-size: 20px 20px;
```

---

## D. FAQ Accordion

Uses native `<details>/<summary>` — no JavaScript needed!

### Full Markup
```html
<section class="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 flex flex-col gap-4 py-12 md:py-16 lg:py-20">
  <!-- Heading -->
  <h2 class="font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] max-w-[20ch] mb-4 md:mb-6 lg:mb-12 text-content-primary">
    Questions?
  </h2>

  <!-- FAQ items -->
  <div class="flex flex-col">
    <!-- Dashed divider -->
    <div class="h-px w-full bg-[linear-gradient(to_right,var(--color-border-decorative)_5px,transparent_5px)] [background-size:10px_1px]"></div>

    <details class="group/accordion transition-colors duration-200
      details-content:h-0
      details-content:overflow-clip
      details-content:transition-all
      details-content:[transition-behavior:allow-discrete]
      details-content:duration-500
      details-content:ease-out-quart
      open:details-content:h-auto">

      <summary class="flex w-full cursor-pointer list-none items-center justify-between py-4 text-content-secondary transition-colors duration-200 group-open/accordion:text-content-primary hover:text-content-primary [&::-webkit-details-marker]:hidden">
        <span class="font-sans text-[1rem] md:text-[1rem] xl:text-[1.125rem] leading-[1.375] md:leading-[1.375] xl:leading-[1.33] tracking-[0rem]">
          Question text here?
        </span>
        <!-- Chevron icon -->
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          class="rotate-90 text-content-primary group-open/accordion:rotate-270 ml-4 size-3 shrink-0 transition-transform duration-200">
          <path d="M4.5 2.25L8.25 6L4.5 9.75" stroke="currentColor"
            stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </summary>

      <div>
        <p class="font-sans text-[0.875rem] leading-[1.286] tracking-[0.031rem] max-w-[55ch] pb-4 text-content-secondary">
          Answer text here.
        </p>
      </div>
    </details>

    <!-- Repeat dashed divider + details for each FAQ item -->
    <div class="h-px w-full bg-[linear-gradient(to_right,var(--color-border-decorative)_5px,transparent_5px)] [background-size:10px_1px]"></div>
  </div>
</section>
```

### Key Details
- **Dashed line**: `bg-[linear-gradient(to_right,var(--color-border-decorative)_5px,transparent_5px)]` with `[background-size:10px_1px]`
- **Animation**: Uses new CSS `details-content:` pseudo targeting with Tailwind v4 for height animation
- **Easing**: `ease-out-quart` (custom cubic-bezier)
- **Chevron rotation**: `rotate-90` → `group-open/accordion:rotate-270`

---

## E. CTA Banner

### Full Markup
```html
<div data-testid="cta-banner-wrapper" class="@container relative">
  <!-- Background image (space/solar flare) -->
  <picture>
    <img
      loading="lazy"
      class="absolute inset-0 h-full w-full object-cover"
      src="/_next/image?url=...solar-system-dark.webp"
      alt=""
    />
  </picture>

  <!-- Gradient masks to blend edges -->
  <div class="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_right,var(--color-background-screen)_0%,transparent_10%,transparent_90%,var(--color-background-screen)_100%)]"></div>
  <div class="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_bottom,var(--color-background-screen)_0%,transparent_20%,transparent_80%,var(--color-background-screen)_100%)]"></div>

  <!-- Content -->
  <div class="mx-auto w-full max-w-[1600px] px-3 md:px-4 lg:px-6 relative z-20 overflow-hidden gap-4 @3xl:grid @3xl:grid-cols-12 @3xl:gap-6 @5xl:gap-12 py-40">
    <div class="col-span-12 @3xl:col-span-7 @5xl:col-span-6 flex flex-col items-start gap-8">
      <h2 class="text-current font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] text-balance text-left @3xl:text-left">
        <span class="inline text-content-primary/60">Get started with the </span>
        <span class="text-content-primary @3xl:text-right inline @3xl:block">#1 AI agent for customer service</span>
      </h2>

      <!-- Buttons -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <a class="... bg-interactive-primary text-interactive-control ...">
          Get a demo
        </a>
        <a class="... border border-interactive-primary text-interactive-primary ...">
          Try for free
        </a>
      </div>
    </div>
  </div>
</div>
```

### CTA Heading Variants Per Page
| Page | CTA text |
|------|----------|
| capabilities | "Get started with the #1 AI agent for customer service" |
| voice | "Deliver a phone experience customers genuinely prefer" |
| channels | "Get started with the #1 AI agent for customer service" |
| train | "Train Fin to become your best agent" |

### CTA Alignment
- capabilities, voice, channels: `text-left` (with ghost-text spans)
- train: `text-center` (centered)

---

## F. Color System

### Theme: `theme-navy` (dark — used on all 4 pages)

#### Semantic Tokens
```css
--color-background-screen:     var(--color-dark-blue);     /* #020917 */
--color-background-elevated:   var(--color-deep-blue);     /* #080f1e */
--color-background-highlight:  var(--color-white-5);       /* #151b29 */
--color-content-primary:       var(--color-white-100);     /* #fff */
--color-content-secondary:     var(--color-white-80);      /* #cecfd2 */
--color-content-tertiary:      var(--color-white-60);      /* #9c9fa5 */
--color-border-decorative:     var(--color-white-20);      /* #393f4b */
--color-interactive-primary:   var(--color-white-100);     /* #fff */
--color-interactive-control:   var(--color-black-100);     /* #000 */
--color-button-hover:          var(--color-white-80);      /* #cecfd2 */
--color-interactive-tertiary:  var(--color-white-10);      /* #252b39 */
--color-orange:                #ff5600;
```

#### White Scale (dark theme foregrounds)
| Token | Hex |
|-------|-----|
| `--color-white-5`  | `#151b29` |
| `--color-white-10` | `#252b39` |
| `--color-white-15` | `#31374a` |
| `--color-white-20` | `#393f4b` |
| `--color-white-30` | `#545864` |
| `--color-white-40` | `#6d7079` |
| `--color-white-50` | `#878a91` |
| `--color-white-60` | `#9c9fa5` |
| `--color-white-70` | `#b5b7bb` |
| `--color-white-80` | `#cecfd2` |
| `--color-white-90` | `#e6e7e8` |
| `--color-white-100` | `#fff` |

#### Black Scale (light theme foregrounds)
| Token | Hex |
|-------|-----|
| `--color-black-5`  | `#e9e9e5` |
| `--color-black-10` | `#ddddd8` |
| `--color-black-15` | `#c5c5be` |
| `--color-black-20` | `#b3b3ab` |
| `--color-black-30` | `#929289` |
| `--color-black-40` | `#7f7f76` |
| `--color-black-50` | `#6c6c64` |
| `--color-black-60` | `#5a5a53` |
| `--color-black-70` | `#444440` |
| `--color-black-80` | `#333330` |
| `--color-black-90` | `#1e1e1c` |
| `--color-black-100` | `#000` |

#### Base Colors
```css
--color-dark-blue:  #020917;
--color-deep-blue:  #080f1e;
--color-orange:     #ff5600;
```

### Theme: `theme-light`
```css
--color-background-screen:     var(--color-cream);         /* #f4f3ee */
--color-background-elevated:   var(--color-off-white);     /* #faf9f5 */
--color-background-highlight:  var(--color-black-5);       /* #e9e9e5 */
--color-content-primary:       var(--color-black-100);     /* #000 */
--color-content-secondary:     var(--color-black-60);      /* #5a5a53 */
--color-content-tertiary:      var(--color-black-40);      /* #7f7f76 */
--color-border-decorative:     var(--color-black-20);      /* #b3b3ab */
--color-interactive-primary:   var(--color-black-100);     /* #000 */
--color-interactive-control:   var(--color-white-100);     /* #fff */
--color-button-hover:          var(--color-black-80);      /* #333330 */
```

### Color-mix Usage
Fin uses `color-mix(in oklab, ...)` for opacity colors with sRGB fallbacks:
```css
/* Tailwind's /60 modifier generates: */
color: color-mix(in oklab, var(--color-content-primary) 60%, transparent);

/* With sRGB fallback: */
@supports not (color: color-mix(in oklab, red, red)) {
  color: oklch(from var(--color-content-primary) l c h / 0.6);
}
```

---

## G. Typography System

### Font Families
```css
--font-serif:  /* Custom serif (preloaded .woff2) */
--font-sans:   /* Custom sans-serif */
--font-mono:   /* Custom monospace */
```

Three `.woff2` files are preloaded. The CSS vars are set via `font-family` declarations with `variable` font-display.

### Type Scale

| Element | Classes |
|---------|---------|
| **H1 (standard)** | `font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem]` |
| **H1 (large/voice)** | `font-serif font-light text-[2.75rem] md:text-[4.5rem] xl:text-[6rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.219rem] xl:tracking-[-0.188rem]` |
| **H1 (channels)** | `font-serif font-light text-[44px]/none tracking-tighter md:text-[3.5rem] lg:text-7xl xl:text-[5.05rem]/none 2xl:text-8xl/none` |
| **H2 (section)** | Same as H1 standard |
| **Body** | `font-sans text-[1rem] md:text-[1rem] xl:text-[1.125rem] leading-[1.375] md:leading-[1.375] xl:leading-[1.33] tracking-[0rem]` |
| **Body small** | `font-sans text-[0.875rem] leading-[1.286] tracking-[0.031rem]` |
| **Label/mono** | `font-mono uppercase text-[0.6875rem] leading-[1.273] tracking-[0.094rem]` |
| **Number prefix** | `font-mono text-xs text-content-tertiary` |
| **Card title** | Same as Body |
| **Card desc** | Same as Body small |

### Special Class: `enable-ligatures`
Applied to voice/train H1s. Likely activates OpenType ligatures:
```css
.enable-ligatures {
  font-feature-settings: "liga" 1, "calt" 1;
}
```

---

## H. Button Variants

### 1. Primary Button (filled)
```
a11y-focus relative inline-flex cursor-pointer items-center justify-center
rounded-md text-center font-normal tracking-tight whitespace-nowrap
transition-colors duration-400 ease-out-quart
focus-visible:outline-offset-2
lg:text-base/none
bg-interactive-primary text-interactive-control
group-hover:bg-button-hover hover:bg-button-hover
text-base/none px-[10px] py-2.5 leading-[1em] sm:px-4 lg:px-4 lg:py-2.5
```
**Visual**: White bg, black text (on dark theme). Hover → light gray.

### 2. Primary Button (large / full-width)
```
a11y-focus relative inline-flex cursor-pointer items-center justify-center
rounded-md text-center font-normal whitespace-nowrap
transition-colors duration-400 ease-out-quart
focus-visible:outline-offset-2
lg:text-base/none
bg-interactive-primary text-interactive-control
group-hover:bg-button-hover hover:bg-button-hover
text-base/none w-full px-4 py-3.5 leading-[1em] tracking-[0.005em]
theme-navy lg:px-4 lg:py-2.5 block w-full
```

### 3. Outline Button (ghost)
```
a11y-focus relative inline-flex cursor-pointer items-center justify-center
rounded-md text-center font-normal tracking-tight whitespace-nowrap
transition-colors duration-400 ease-out-quart
focus-visible:outline-offset-2
lg:text-base/none
border border-interactive-primary text-interactive-primary
group-hover:bg-interactive-primary group-hover:text-interactive-control
hover:bg-interactive-primary hover:text-interactive-control
lg:px-4 px-4 py-3 text-base/none
```
**Visual**: White border, white text. Hover → fills white, text goes black.

### 4. Outline Button (large / full-width)
Same as #3 but with:
```
w-full px-4 py-3.5 leading-[1em] tracking-[0.005em] theme-navy lg:px-4 lg:py-2.5 block w-full
```

### 5. Pill Button (channel selector style)
```
relative z-2 inline-flex items-end justify-center gap-3
rounded-full border-[2px] px-4 py-3 text-white
transition-all duration-300
border-interactive-tertiary bg-[#172025]
```

### Shared Button Base
```
a11y-focus
  → likely: focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
ease-out-quart
  → custom cubic-bezier easing
duration-400
  → 400ms transition
```

---

## I. Link Variants

### 1. Underline Link (section heading row — reveals on hover)
```
font-sans md:text-[1rem] xl:text-[1rem] md:leading-[0.938] xl:leading-[0.938]
tracking-[0rem] md:tracking-[0rem] xl:tracking-[-0.006rem]
relative cursor-pointer
bg-gradient-to-r from-current to-current bg-no-repeat
bg-[length:0%_0.06em] bg-[position:100%_100%]
transition-[background-size] duration-200 ease-out
hover:bg-[length:100%_0.06em] hover:bg-[position:0%_100%]
block bg-none py-0.5 text-base font-medium text-current
hover:opacity-100 focus:opacity-100
```
**Behavior**: No underline by default. On hover, underline slides in from left.

### 2. Card "Learn more" Link (visible underline — hides on hover)
```
font-sans text-[0.875rem] md:text-[0.875rem] xl:text-[0.875rem]
leading-[1.143] md:leading-[1.143] xl:leading-[1.143]
tracking-[0.031rem] md:tracking-[0.031rem] xl:tracking-[0.031rem]
relative cursor-pointer
bg-gradient-to-r from-current to-current bg-no-repeat pb-1
bg-[length:100%_0.06em] bg-[position:0%_100%]
transition-[background-size] duration-200 ease-out
hover:bg-[length:0%_0.06em] hover:bg-[position:100%_100%]
text-interactive-primary
```
**Behavior**: Underline visible by default. On hover, underline slides out to right.

### 3. Primary Link (reveals on hover)
```
font-sans text-[0.875rem] md:text-[1rem] xl:text-[1rem]
leading-[0.929] md:leading-[0.938] xl:leading-[0.938]
tracking-[0rem] md:tracking-[0rem] xl:tracking-[-0.006rem]
relative cursor-pointer
bg-gradient-to-r from-current to-current bg-no-repeat pb-1
bg-[length:0%_0.06em] bg-[position:100%_100%]
transition-[background-size] duration-200 ease-out
hover:bg-[length:100%_0.06em] hover:bg-[position:0%_100%]
text-primary-content
```

### Underline Animation Technique
All links use `background-image` gradient for the underline (not `text-decoration` or `border-bottom`):
```
bg-gradient-to-r from-current to-current     /* gradient = solid line in text color */
bg-no-repeat                                   /* don't tile */
bg-[length:0%_0.06em]                         /* start: 0% width, 0.06em height */
bg-[position:100%_100%]                       /* anchored to bottom-right */
hover:bg-[length:100%_0.06em]                 /* hover: expand to full width */
hover:bg-[position:0%_100%]                   /* anchor to bottom-left */
transition-[background-size] duration-200      /* animate the size change */
```

---

## J. Chapter Navigation

The sidebar navigation (capabilities page) uses a sticky column with scroll progress:

### Layout
```html
<!-- Outer grid -->
<div class="mx-auto w-full max-w-[1600px] md:px-4 lg:px-6 px-0">
  <div class="relative md:grid md:grid-cols-12 md:gap-6 lg:gap-8 [&>div:has([data-chapter-layout='nav'])]:sticky [&>div:has([data-chapter-layout='nav'])]:top-[56px] [&>div:has([data-chapter-layout='nav'])]:z-10"
    data-chapter-layout="main">

    <!-- Sticky sidebar (2-3 cols) -->
    <div class="md:col-span-3 lg:col-span-2">
      <div data-chapter-layout="nav"
        class="sticky top-14 z-10 h-fit md:top-8 md:pt-10 lg:top-8 lg:pt-12 [body:has(.top-banner)_&]:pt-20 bg-background-screen max-md:w-full md:bg-transparent">
        <nav aria-label="Chapter navigation">
          <ul class="max-md:z-10 max-md:mx-auto max-md:flex max-md:h-fit max-md:w-full max-md:max-w-max max-md:gap-2 max-md:overflow-x-auto max-md:[&::-webkit-scrollbar]:hidden">
            <!-- Nav items (rendered by React client component) -->
          </ul>
          <!-- Progress bar (mobile only) -->
          <div class="relative h-[1px] w-full bg-content-primary/20 block md:hidden">
            <span class="absolute top-0 h-0.25 w-full bg-border-decorative"></span>
            <span role="progressbar" aria-label="Progress"
              aria-valuemin="0" aria-valuemax="100"
              style="transform:scaleX(0);transition:transform 0ms"
              class="absolute top-0 h-0.25 w-full origin-left bg-orange">
            </span>
          </div>
        </nav>
      </div>
    </div>

    <!-- Content column -->
    <div class="isolate flex flex-col gap-0 md:col-span-9 md:gap-4 lg:col-span-10">
      <!-- Sections go here -->
    </div>
  </div>
</div>
```

### Key Features
- Sidebar sticks at `top-14` (56px = navbar height) on mobile, `top-8` on desktop
- Mobile: horizontal scroll nav with hidden scrollbar
- Progress bar: uses `scaleX()` transform animated dynamically with JS
- Progress color: `bg-orange` (#ff5600)
- Desktop layout: 2 cols sidebar + 10 cols content (lg), or 3+9 (md)

---

## K. Layout Grid & Container System

### Max Width
```
max-w-[1600px]  /* Global content max width */
```

### Container Padding
```
px-3 md:px-4 lg:px-6     /* Standard horizontal padding */
/* Or on hero: */
px-3 md:px-10 lg:px-6    /* Slightly wider on medium */
```

### Container Queries (not media queries!)
Fin uses `@container` extensively instead of media queries for component-level responsiveness:
```
@container           /* parent must have class: @container */
@3xl:grid            /* container >= 3xl */
@2xl:col-span-6      /* container >= 2xl */
@5xl:col-span-4      /* container >= 5xl */
@lg:text-lg          /* container >= lg */
```

### 12-Column Grid
```
grid grid-cols-12 gap-x-4          /* Standard 12-col */
grid grid-cols-12 gap-x-4 gap-y-6  /* With vertical gap */
xl:grid-cols-10                     /* Collapsed to 10 at xl */
```

### Common Column Spans
```
col-span-12                         /* Full width */
col-span-12 lg:col-span-6          /* Half at large */
col-span-12 xl:col-span-7          /* 7/12 at xl */
xl:col-start-8 xl:col-span-3       /* Right-aligned description */
@3xl:col-span-7 @5xl:col-span-6    /* CTA content area */
```

---

## Appendix: Custom Easing & Transitions

```css
/* ease-out-quart — custom cubic-bezier used throughout */
transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1);

/* Standard durations used: */
duration-200   /* links, accordions */
duration-300   /* pill buttons */
duration-400   /* primary/outline buttons */
duration-500   /* accordion content height */
```

## Appendix: `data-page-theme` Attribute

Applied on `<html>` element to switch the entire page theme:
```html
<html data-page-theme="theme-navy">
```
CSS targets it:
```css
.theme-navy, [data-page-theme="theme-navy"] {
  --color-background-screen: var(--color-dark-blue);
  /* ... all semantic tokens ... */
}
```

---

## Quick Reference: Class Strings to Copy

### Hero H1 (standard)
```
font-serif font-light text-[2.25rem] md:text-[3.375rem] xl:text-[4.5rem] leading-[1] tracking-[-0.125rem] md:tracking-[-0.156rem] xl:tracking-[-0.188rem] max-w-[20ch] text-content-primary/60 [&>strong]:font-normal [&>strong]:text-content-primary
```

### Section Block
```
relative bg-background-elevated px-3 py-6 text-content-primary md:px-6 md:py-8 lg:px-12 lg:pb-12 scroll-mt-20
```

### Corner Decoration
```
absolute h-6 w-6 border-border-decorative hidden md:block z-10
```
(+ position/border-side variants for each corner)

### Card
```
relative size-full border border-border-decorative bg-background-highlight
```

### Badge
```
inline-flex border border-border-decorative bg-background-highlight px-2.5 py-2 absolute -top-px -left-px z-3
```

### Dashed Separator
```
h-px w-full bg-[linear-gradient(to_right,var(--color-border-decorative)_5px,transparent_5px)] [background-size:10px_1px]
```

### Primary Button
```
a11y-focus relative inline-flex cursor-pointer items-center justify-center rounded-md text-center font-normal tracking-tight whitespace-nowrap transition-colors duration-400 ease-out-quart focus-visible:outline-offset-2 lg:text-base/none bg-interactive-primary text-interactive-control hover:bg-button-hover px-4 py-3 text-base/none
```

### Outline Button
```
a11y-focus relative inline-flex cursor-pointer items-center justify-center rounded-md text-center font-normal tracking-tight whitespace-nowrap transition-colors duration-400 ease-out-quart focus-visible:outline-offset-2 lg:text-base/none border border-interactive-primary text-interactive-primary hover:bg-interactive-primary hover:text-interactive-control px-4 py-3 text-base/none
```
