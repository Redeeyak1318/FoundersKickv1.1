# Theme and Design System

The application uses Tailwind CSS v4 alongside a strong cinematic custom theme.

## Source: `src/index.css`
```css
@import "tailwindcss";

:root {
  /* Color Palette — Cinematic pure black + orange accents */
  --color-bg-primary: #000000;
  --color-bg-secondary: #0A0A0A;
  --color-bg-tertiary: #0a0a0a;
  --color-bg-card: rgba(255, 255, 255, 0.04);
  --color-bg-glass: rgba(255, 255, 255, 0.04);
  --color-bg-glass-hover: rgba(255, 255, 255, 0.07);
  --color-bg-elevated: rgba(10, 10, 10, 0.85);

  /* Accent Colors — Orange + Blue */
  --color-accent-primary: #F97316;
  --color-accent-secondary: #F97316;
  --color-accent-tertiary: #3B82F6;
  --color-accent-glow: rgba(249, 115, 22, 0.3);
  --color-accent-cyan: #3B82F6;
  --color-accent-emerald: #34d399;
  --color-accent-rose: #fb7185;
  --color-accent-amber: #fbbf24;

  /* Typography — Serif + Sans-serif duo */
  --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-display: 'Inter', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  
  --sidebar-width: 280px;
  --sidebar-collapsed: 72px;
  --navbar-height: 64px;
  --content-max-width: 1200px;
}
```
