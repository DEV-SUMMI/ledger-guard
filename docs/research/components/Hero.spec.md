# Hero Specification

## Overview
- **Target file:** `frontend/src/components/Hero.tsx`
- **Source markup:** server-rendered HTML segment `sec01_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** time-driven (ambient animations) + load stagger

## Key styles (exact source classes / computed values)
min-h-screen centered; h1 `text-[clamp(38px,6.5vw,72px)] font-black leading-[1.06] tracking-[-2px]`, second line `.text-shimmer` gradient #22d3a7→#0ea5e9→#a855f7. Badge `bg-vault-accentDim border-vault-accent/20 rounded-full px-5 py-2 text-[13px]` with pulse-glow. Copy `text-[clamp(16px,2vw,20px)] text-vault-textMuted max-w-[580px]`. Buttons px-9 py-4 rounded-xl.

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
Buttons wrap; type scales via clamp.

## Text content
Verbatim from the live site (see component source).
