# Features Specification

## Overview
- **Target file:** `frontend/src/components/Features.tsx`
- **Source markup:** server-rendered HTML segment `sec02_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** scroll reveal + hover

## Key styles (exact source classes / computed values)
3 `glow-card` links: `bg-vault-card border-vault-border rounded-2xl p-8 hover:-translate-y-2 duration-500`; 56px gradient icon tiles (accent→emerald-400, blue→cyan-400, amber); h3 `text-xl font-bold`; body `text-sm text-vault-textMuted`; 'Learn more' accent link with gap animation. Reveal delays 0/150/300.

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
1 col → 3 cols @md.

## Text content
Verbatim from the live site (see component source).
