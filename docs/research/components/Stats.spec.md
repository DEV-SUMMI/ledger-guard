# Stats Specification

## Overview
- **Target file:** `frontend/src/components/Stats.tsx`
- **Source markup:** server-rendered HTML segment `sec03_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** scroll reveal + count-up

## Key styles (exact source classes / computed values)
Hairline gradients top/bottom (`via-vault-accent/20`). Values `text-3xl sm:text-4xl font-black`, labels `text-xs text-zinc-600 uppercase tracking-wider`. CountUp 256-bit, 600K, 0%, 0%, 28 Days.

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
2 cols → 5 cols @sm.

## Text content
Verbatim from the live site (see component source).
