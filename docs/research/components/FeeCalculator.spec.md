# FeeCalculator Specification

## Overview
- **Target file:** `frontend/src/components/FeeCalculator.tsx`
- **Source markup:** server-rendered HTML segment `sec07_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** click + input

## Key styles (exact source classes / computed values)
Card max-w 560, header gradient `from-vault-accent/10 to-vault-blue/10`. Input `bg-[#0e0e14] rounded-xl py-3.5 text-lg font-mono`. Presets/network chips active `bg-vault-accent/10 border-vault-accent/30 text-vault-accent`. Results panel `bg-[#0a0a12] rounded-xl p-4`.

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
Network chips scroll horizontally on narrow screens.

## Text content
Verbatim from the live site (see component source).
