# Design System Strategy: Panka Editorial E-Commerce

## 1. Overview & Creative North Star
**Creative North Star: The Artisanal Gallery**

This design system moves away from the "fast-food" digital template and toward a high-end editorial experience. We treat Panka’s tamales not just as food, but as a handcrafted art form. The visual language is defined by **Soft Minimalism**: a marriage of expansive white space (using the `surface` and `cream` palettes) and high-contrast, elegant typography.

To break the traditional grid, we utilize intentional asymmetry—offsetting food photography against large-scale serif typography and using "floating" layers. This creates a sense of depth and tactile quality, mimicking a premium physical cookbook or a boutique culinary magazine.

---

## 2. Colors: Tonal Depth & Organic Warmth
The palette is rooted in earth tones, designed to make high-quality food photography "pop" while maintaining a sophisticated, calm environment.

### The "No-Line" Rule
**Explicit Instruction:** Use of 1px solid borders for sectioning is strictly prohibited. 
Visual boundaries must be achieved through background color shifts. For example, a featured menu item section should transition from `surface` (#fcf9f4) to `surface-container-low` (#f6f3ee). This creates a seamless, high-end feel that feels carved rather than outlined.

### Surface Hierarchy & Nesting
Instead of a flat grid, treat the UI as stacked sheets of fine paper.
- **Base:** `surface` (#fcf9f4)
- **Secondary Sections:** `surface-container` (#f0ede8)
- **Interactive Cards:** `surface-container-lowest` (#ffffff) to provide a soft, natural "lift."

### The Glass & Gradient Rule
For floating navigation or mobile headers, use **Glassmorphism**. Apply `surface` with 80% opacity and a `backdrop-blur` (12px-20px). For primary Call-to-Actions (CTAs), use a subtle radial gradient from `primary` (#006b25) to `primary-container` (#248639) to add a "signature" polish that feels dimensional rather than flat.

---

## 3. Typography: The Editorial Voice
We use a high-contrast pairing to balance "Modern Minimalist" with "Homestyle Elegant."

*   **Display & Headlines (Noto Serif):** This is our "homestyle" touch. Large-scale serifs convey authority and heritage. Use `display-lg` for hero statements to create a bold, editorial impact.
*   **Body & Labels (Plus Jakarta Sans):** A clean, geometric sans-serif that ensures high readability and a "tech-forward" minimalist feel. Use `body-lg` for product descriptions to maintain a premium spacing feel.

**Hierarchy Goal:** The contrast between the serif headlines and the sans-serif body text creates a visual rhythm that guides the user through the story of the tamale, not just the price.

---

## 4. Elevation & Depth: Tonal Layering
We reject heavy, artificial drop shadows in favor of natural light physics.

*   **The Layering Principle:** Depth is achieved by "stacking" surface tokens. Place a `surface-container-highest` card on a `surface` background for immediate, soft hierarchy.
*   **Ambient Shadows:** If a floating element (like a "Add to Cart" fab) requires a shadow, use: `color: on-surface` (alpha 5%), `blur: 32px`, `y-offset: 16px`. This mimics natural sunlight hitting a surface.
*   **The Ghost Border:** If accessibility requires a border, use `outline-variant` at 15% opacity. Never use a 100% opaque border.
*   **Glassmorphism:** Use semi-transparent layers for elements that "float" over food photography, ensuring the vibrant greens and browns of the tamale ingredients bleed through the UI, integrating the brand and the product.

---

## 5. Components: Refined Interaction

### Buttons
*   **Primary:** Moderately rounded corners (reflecting a `roundedness` of 2), gradient background (Primary to Primary-Container), `on-primary` text. No border.
*   **Secondary:** `surface-container-highest` background with `on-secondary-container` text. High-end, subtle contrast.
*   **Tertiary:** Pure text with an underline that appears on hover, utilizing the `secondary` (#7a5829) color.

### Cards & Lists
*   **Strict Rule:** No divider lines. Use `surface-container` shifts or 32px-48px of vertical white space to separate items.
*   **Product Cards:** Use `surface-container-lowest` (#ffffff) with moderately rounded corners (reflecting a `roundedness` of 2). Photography should slightly "break" the container (overflow) for an asymmetric, custom feel.

### Input Fields
*   **Style:** Minimalist. Only a bottom "Ghost Border" (10% opacity) or a subtle `surface-container-high` background fill. Avoid the "boxed-in" look.
*   **Focus State:** The bottom border transitions to `primary` (#006b25) with a 2px thickness.

### Signature Component: The "Ingredient Chip"
*   Small, `secondary-fixed-dim` (#ecbf86) capsules with `label-sm` text. These highlight flavor profiles (e.g., "Spicy," "Vegan," "Hand-Husked") without cluttering the visual field.

---

## 6. Do's and Don'ts

### Do
*   **DO** use normal margins, balancing a spacious feel with content density (reflecting a `spacing` of 2). Luxury is still defined by intentional whitespace.
*   **DO** use high-quality, "hero" food photography where the steam or texture of the corn husk is visible.
*   **DO** apply moderately rounded corners (reflecting a `roundedness` of 2) to images to match the "soft corners" requirement.
*   **DO** use `tertiary` (#6e5841) for metadata or secondary labels to keep the interface warm.

### Don't
*   **DON'T** use pure black (#000000). Use `on-surface` (#1c1c19) for all text to maintain a softer, organic feel.
*   **DON'T** use 1px dividers. It breaks the editorial flow and looks like a generic template.
*   **DON'T** crowd the header. Keep navigation minimal (Shop, Our Story, Cart).
*   **DON'T** use "harsh" corners. Every element should feel as soft and approachable as a warm tamale.