# Security Specification

## Overview
- **Target file:** `frontend/src/components/Security.tsx`
- **Source markup:** server-rendered HTML segment `sec05_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** load stagger + hover

## Key styles (exact source classes / computed values)
4 cards `bg-vault-card/50 border-vault-border rounded-xl p-5` with emoji 🔐 👤 ⛓️ 🛡️, h3 `text-sm font-bold`, p `text-[13px]`. Background triple hexagon spin 90s at 2% opacity.

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
1 col → 2 cols @sm.

## Text content
Verbatim from the live site (see component source).
