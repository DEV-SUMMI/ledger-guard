# Cta Specification

## Overview
- **Target file:** `frontend/src/components/Cta.tsx`
- **Source markup:** server-rendered HTML segment `sec08_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** scroll reveal + ambient

## Key styles (exact source classes / computed values)
max-w 700 rounded-3xl card, gradient `from-vault-accent/[0.08] to-vault-blue/[0.06]` with `border-vault-accent/[0.12]`, two floating orbs; content py-20 px-10.

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
Same layout, narrower.

## Text content
Verbatim from the live site (see component source).
