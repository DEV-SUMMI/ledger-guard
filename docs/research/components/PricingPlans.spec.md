# PricingPlans Specification

## Overview
- **Target file:** `frontend/src/components/PricingPlans.tsx`
- **Source markup:** server-rendered HTML segment `sec07_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** click (period toggle)

## Key styles (exact source classes / computed values)
Free card `bg-vault-card border-vault-border rounded-2xl p-6 sm:p-8`; Pro card `border-vault-accent/20` with radial glow, toggle `bg-black/20 rounded-xl p-1`, active `bg-vault-accent/15 text-vault-accent`. Prices: 1M $7, 3M $20 ($6.67/mo, save 5%, $1), 1Y $60 ($5/mo, save 29%, $25).

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
Stack below lg.

## Text content
Verbatim from the live site (see component source).
