# Design System Specification: The Curated Navigator

## 1. Overview & Creative North Star
The "Creative North Star" for this design system is **The Digital Curator**. 

For a Chinese student moving to the UK, the rental market is a chaotic landscape. This system rejects the cluttered "grid-of-boxes" found in traditional real estate platforms. Instead, it adopts an **Editorial Utility** approach—merging the high-information density of Google Maps with the aesthetic breathing room of a luxury travel magazine. 

We break the "template" look through **Intentional Asymmetry** (e.g., staggering listing images), **Depth Layering** (stacking translucent surfaces), and **Tonal Authority**. Every pixel must feel intentional, professional, and ultimately, calm.

---

## 2. Colors: The Tonal Spectrum
We move beyond flat hex codes to a system of functional layers.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders (`#E2E8F0`) to section off large areas of the UI. Separation must be achieved through:
- **Background Shifts:** Placing a `surface_container_lowest` (#FFFFFF) card on a `surface` (#F7F9FB) background.
- **Negative Space:** Utilizing the Spacing Scale (specifically `8` to `12` increments) to define content groups.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical sheets of paper or glass:
- **Base Layer:** `surface` (#F7F9FB) – The canvas.
- **Mid Layer:** `surface_container_low` (#F2F4F6) – Large structural sections (e.g., the map sidebar).
- **Top Layer:** `surface_container_lowest` (#FFFFFF) – Content cards, modals, and interactive inputs.

### Glass & Gradients
To avoid a "Standard SaaS" feel, use **Glassmorphism** for floating map controls and navigation bars.
- **Token:** `surface_container_lowest` at 80% opacity with a `20px` backdrop blur.
- **Signature Texture:** Primary CTAs should use a subtle linear gradient from `primary` (#004AC6) to `primary_container` (#2563EB) at a 135° angle. This adds "soul" and prevents the blue from feeling digitally "flat."

---

## 3. Typography: Editorial Authority
The typography bridges the gap between the functional Inter (English) and the balanced Noto Sans SC (Chinese).

| Level | Token | Size / Weight | Use Case |
| :--- | :--- | :--- | :--- |
| **Display** | `display-md` | 2.75rem / Bold | Hero section titles / Price highlights |
| **Headline** | `headline-sm` | 1.5rem / SemiBold | Major section headers (H1 equivalent) |
| **Title** | `title-md` | 1.125rem / SemiBold | Property titles in cards (H2 equivalent) |
| **Body** | `body-md` | 0.875rem / Regular | Property descriptions and reviews |
| **Label** | `label-sm` | 0.6875rem / SemiBold | Metadata, timestamps, and "Authentic" tags |

**Editorial Note:** Use `title-lg` for Chinese characters to maintain visual weight parity with English bolding. Increase line height to `1.6` for all body text to ensure readability for non-native English speakers.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows often look "dirty." We use **Ambient Depth**.

- **The Layering Principle:** Depth is achieved by stacking. A card (`surface_container_lowest`) sitting on a section (`surface_container_low`) creates a natural lift.
- **Ambient Shadows:** For floating elements (Modals/Quick-view cards), use a tinted shadow: `0 12px 32px rgba(15, 23, 42, 0.06)`. This uses the `on_surface` color for the shadow tint, mimicking natural light.
- **The Ghost Border Fallback:** If a border is required for accessibility (e.g., in a high-contrast search bar), use a **Ghost Border**: `outline_variant` (#C3C6D7) at **15% opacity**. Never use 100% opaque borders for decorative containment.

---

## 5. Components: Refined Primitives

### Buttons & CTAs
- **Primary:** Gradient fill (`primary` to `primary_container`). `0.5rem` (8px) radius. No border.
- **Secondary:** `surface_container_high` background with `on_secondary_container` text.
- **Tertiary:** Text-only with an icon. No background except on hover (`surface_container_low`).

### Cards & Lists (The Xiaohongshu Influence)
- **Rule:** Forbid divider lines. 
- **Structure:** Use a `1rem` (16px) vertical gap between list items. Use a `surface_container_lowest` background for the card and a `0.75rem` (12px) radius.
- **Map Tags:** Use the `full` (pill) radius. Price tags on the map use `primary` background with `on_primary` text, utilizing a `Medium` ambient shadow to "float" above the map geography.

### Input Fields
- **State:** Default background is `surface_container_lowest`.
- **Focus:** Transition to a `Ghost Border` using the `primary` color at 40% opacity and a `2px` outer glow. This provides a "soft" focus rather than a harsh line.

### Key Custom Component: The "Authentic Badge"
- **Visuals:** Uses the `tertiary` (#6A1EDB) palette. A small, pill-shaped tag with `tertiary_fixed` background and `on_tertiary_fixed` text. This adds a "vibrant" Xiaohongshu-style social proof element to the professional layout.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical spacing. If a card has `24px` padding on the left, try `32px` on the top to create a more "designed" feel.
- **Do** use `Lucide` icons with a 1.5px stroke. Icons should always be `on_surface_variant` (#434655) to maintain professional subtlety.
- **Do** prioritize the Chinese typography scale; ensure Noto Sans SC doesn't look smaller than Inter when used side-by-side.

### Don't
- **Don't** use pure black (#000000). Always use `on_surface` (#191C1E) for text to maintain a premium, ink-like feel.
- **Don't** use standard 1px gray dividers. Use a `4px` tall `surface_container_low` bar if a physical break is absolutely necessary.
- **Don't** use hard-edged buttons. Every interaction point must have at least a `sm` (4px) or `DEFAULT` (8px) radius to maintain the "Young & Professional" attribute.