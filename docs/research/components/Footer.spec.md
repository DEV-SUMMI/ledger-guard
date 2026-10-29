# Footer Specification

## Overview
- **Target file:** `frontend/src/components/Footer.tsx`
- **Source markup:** server-rendered HTML segment `sec09_footer` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** static + hover

## Key styles (exact source classes / computed values)
Top border, py-16, brand column + PLATFORM / LEGAL / NETWORKS lists (`text-sm text-zinc-600`), bottom bar `text-xs text-zinc-700`.

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
Columns wrap.

## Text content
Verbatim from the live site (see component source).
