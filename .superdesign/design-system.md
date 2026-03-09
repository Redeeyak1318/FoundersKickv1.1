# FoundersKick Design System

## Aesthetic Direction
* **Style:** Dark neumorphic + glassmorphism dashboard aesthetic with subtle futuristic influence.
* **Vibe:** Sleek, immersive, modern, socially engaging, premium, fast, content-driven.
* **Structure:** Card-based modular feed system. Large dynamic content feed anchoring attention, smaller rounded widgets for stories, trending, messages, suggestions.

## Color Palette
* **Background Neutrals:** Deep charcoal / near-black base (`#0E1116`, `#16181D`). Layered with soft gradients, frosted translucent panels.
* **Primary Accents (Engagement/CTAs):** Soft coral/red gradient glow with gentle elevation. Ensure buttons have soft-rounded corners (8–14px radius) and smooth hover/press micro-interactions.
* **Secondary Accents:** Muted blue for links, soft purple highlights for activity states.
* **Shadows:** Low-contrast shadows to create depth without visual clutter.

## Typography
* **Font Family:** Clean geometric sans-serif (e.g., Inter, SF Pro Display, Poppins).
* **Hierarchy:**
  * Bold weights for usernames and headings.
  * Medium weights for captions.
  * Light weights for metadata.
* **Spacing:** Airy, balanced line height, subtle tracking for readability in dense feeds.

## UI Elements
* **Cards & Panels:** Frosted translucent panels (glassmorphism), low-contrast shadows. Soft-rounded corners (8–14px radius).
* **Buttons:**
  * Primary CTAs (Post, Follow, Message): Soft coral/red gradient glow, gentle elevation.
  * Secondary CTAs: Outline-based or low-contrast.
* **Icons:** Minimal monochrome line icons. State changes should rely on opacity logic (e.g., lower opacity vs. full opacity) rather than heavy stroke changes.

## Motion & Interaction (Implementation Expectations)
* **Hover States/Reveals:** GSAP for card reveals, staggered entrances, scroll triggers. Keep motion subtle, fast, and premium — avoid over-animation.
* **Transitions:** Barba.js for seamless route transitions.
* **Scrolling:** Lenis for smooth scrolling behavior.

## Content strategy
* Replace all previous placeholders with realistic structural mock content (believable startup metrics, readable dense feeds, natural conversation tones).
