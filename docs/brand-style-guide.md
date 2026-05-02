# NexusDev - Brand Style Guide

>Based on Agile Bridge website brand guidelines (www2.agilebridge.co.za)
>Last updated: 2 May 2026
>Author: Tiego Mokwena

---

## Important Note

The Agile Bridge website's WordPress theme CSS contains an older teal colour (`#1a6c7a`) used for theme defaults. The **actual visual brand identity** is based on a bright cyan (`#00B4D8) as seen on the live website - used for heading accents, buttons, and all interactive highlights. This guide reflects the **visual brand**, not the theme CSS defaults. 

---

## Colour Palette
 
| Name | HEX | Usage |
|---|---|---|
| Primary Cyan | `#00B4D8` | Buttons, accent headings, highlights, links, interactive elements |
| Primary Cyan Hover | `#0096B4` | Button hover and focus states (10% darker) |
| Dark Navy | `#000f2b` | All heading text (h1–h6) |
| Dark Grey | `#3a3a3a` | Body text, general content |
| Subtle Grey | `#4B4F58` | Meta text, captions, subtle labels |
| Light Grey | `#F5F5F5` | Card backgrounds, input backgrounds, panels |
| Border Grey | `#dddddd` | Borders, dividers, input borders |
| Medium Grey | `#E5E5E5` | Subtle separators |
| White | `#FFFFFF` | Page backgrounds, cards, modals, nav |
| Black | `#000000` | Maximum contrast text |
 
### Colour Usage Rules
 
- **Primary Cyan `#00B4D8`** - all interactive elements: buttons, links,
  selected states, focus rings, accent text
- **Primary Cyan Hover `#0096B4`** - hover and focus on all cyan elements
- **Dark Navy `#000f2b`** - headings only, never body text
- **Dark Grey `#3a3a3a`** - all body text, labels, paragraphs
- **White `#FFFFFF`** - page backgrounds, navigation, cards, modals
---
 
## Typography
 
### Font Family
 
```
'Montserrat', sans-serif
```
 
Montserrat is used for all text - body, headings, buttons, inputs, labels.
No secondary font is used.
 
**Google Fonts import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
```
 
### Type Scale
 
| Element | Size | Weight | Transform | Line Height |
|---|---|---|---|---|
| H1 | 50px / 3.125rem | 700 | none | 1.2em |
| H2 | 28px / 1.75rem | 700 | uppercase | 1.3em |
| H3 | 22px / 1.375rem | 600 | none | 1.3em |
| H4 | 18px / 1.125rem | 600 | none | 1.3em |
| H5 | 16px / 1rem | 600 | none | 1.4em |
| H6 | 14px / 0.875rem | 600 | none | 1.4em |
| Body | 16px / 1rem | 400 | none | 1.6em |
| Button | 14px / 0.875rem | 600 | none | 1em |
| Small / Caption | 14px / 0.875rem | 400 | none | inherit |
 
> Note: The Agile Bridge site uses bold, impactful headings as seen in
> "We are Craftsmen when it comes to creating Software Solutions!"
 
### Mobile Type Scale (max-width: 921px)
 
| Element | Size |
|---|---|
| H1 | 2.5rem / 40px |
| H2 | 1.875rem / 30px |
| H3 | 1.375rem / 22px |
| Body | 1rem / 16px |
 
---
 
## Buttons
 
### Primary Button ("Let's Connect" style)
 
From the screenshot, the button is:
- **Background:** `#00B4D8` (primary cyan)
- **Text:** `#FFFFFF` white
- **Border radius:** approximately `4–6px` - slightly rounded, not sharp
- **Font:** Montserrat, 600 weight, ~14px
- **Padding:** 14px top/bottom, 28px left/right
- **No visible border** — background only
### States
 
| State | Background | Text |
|---|---|---|
| Default | `#00B4D8` | `#ffffff` |
| Hover | `#0096B4` | `#ffffff` |
| Focus | `#0096B4` | `#ffffff` |
| Disabled | `#E5E5E5` | `#4B4F58` |
 
### Secondary / Outline Button
 
- Background: transparent
- Border: 2px solid `#00B4D8`
- Text: `#00B4D8`
- Hover: background `#00B4D8`, text `#ffffff`
---
 
## Form Inputs
 
- **Default border:** 1px solid `#dddddd`
- **Focus border:** 1px solid `#00B4D8`
- **Background:** `#FFFFFF`
- **Border radius:** `4px`
- **Font:** Montserrat, 400, 16px
- **Placeholder colour:** `#4B4F58`
---
 
## Navigation
 
- **Background:** `#FFFFFF`
- **Nav link colour:** `#3a3a3a`
- **Nav link hover:** `#00B4D8`
- **Active link:** `#00B4D8`
- **Header min-height:** 70px
- **Max container width:** 1240px
---
 
## Layout
 
| Setting | Value |
|---|---|
| Max content width | 1200px |
| Desktop container padding | 35px left/right |
| Mobile container padding | 20px left/right |
| Desktop breakpoint | 922px |
| Mobile breakpoint | 921px |
| Small mobile breakpoint | 544px |
| Card border radius | `6px` |
 
---

## Logo
 
- Logo text: lowercase "agilebridge" in dark navy
- Tagline: "CONSIDERED SOFTWARE SOLUTIONS" in small caps, spaced
- Icon: cyan circuit/node dot accent above the "i"
- **Do not** recreate or imitate the logo — use only as reference for tone

---

## Selection & Focus
 
```css
::selection {
  background-color: #00B4D8;
  color: #ffffff;
}
```
 
---
 
## Design Principles
 
Observed from the Agile Bridge website:
 
**1. Bold and confident headings** - large, heavy type with cyan accents
on key words. Creates energy and draws the eye.
 
**2. Cyan as the signature colour** - `#00B4D8` appears on every
interactive element and accent. It is the single most recognisable brand
element.
 
**3. Clean white layouts** - generous white space, no cluttered backgrounds.
Content breathes.
 
**4. Rounded but professional** - buttons have a slight border radius (~4–6px),
not completely sharp or pill-shaped. Balanced and approachable.
 
**5. Montserrat throughout** - consistent typeface creates cohesion across
all text sizes and weights.
 
**6. Minimal decorative elements** - the design is clean and purposeful.
Avoid gradients, drop shadows, or decorative patterns.
 
---
 
## Accessibility
 
- Primary cyan `#00B4D8` on white: ensure sufficient contrast on body text
  (use dark navy `#000f2b` or dark grey `#3a3a3a` for readable text)
- Cyan is appropriate for large text, headings, buttons, and icons
- All interactive elements must have visible focus states
- Minimum tap target size: 44x44px on mobile

---