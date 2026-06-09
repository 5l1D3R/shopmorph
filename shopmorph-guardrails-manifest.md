# ShopMorph Guardrails Manifest

## Brand Palette

- Use luxury dark backgrounds: `bg-slate-950`, `bg-slate-900`, `bg-zinc-950`, `bg-neutral-950`.
- Use teal accents only for primary action and status: `bg-teal-400`, `text-teal-300`, `border-teal-400/30`.
- Use subtle glass surfaces: `bg-white/5`, `bg-slate-900/90`, `backdrop-blur-md`.
- Use readable text: `text-white`, `text-slate-300`, `text-slate-400`.

## Shape And Layout

- Use `rounded-xl` as the standard brand radius for primary widget containers.
- Use thin slate or white alpha borders: `border border-slate-800`, `border border-white/10`.
- Use premium shadows: `shadow-xl`, `shadow-2xl`.
- Optimize for a fixed iframe viewport. Avoid heavy vertical margins, oversized headers, and layouts that create scrollbars.
- Keep spacing tight and clean. Prefer `p-4` or `p-6`, efficient `flex` or `grid` layouts, and single-screen composition.

## Micro-Copy

- Tone must be premium, concise, and conversion-focused.
- Include a clear benefit-led headline, short supporting copy, and a high-contrast CTA.
- Button labels must be accessible and action-oriented.

## Behavioral Script Boundaries

- Include Tailwind CDN in the `<head>`: `<script src="https://cdn.tailwindcss.com"></script>`.
- Use vanilla JavaScript only.
- Put all click listeners, timers, state management, and interactive behavior inside one inline `<script>` tag at the bottom of the HTML document.
- Avoid external JavaScript dependencies.
