# HowItWorks Specification

## Overview
- **Target file:** `frontend/src/components/HowItWorks.tsx`
- **Source markup:** server-rendered HTML segment `sec04_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** scroll reveal + hover

## Key styles (exact source classes / computed values)
3 steps with 72px tiles `rounded-2xl font-mono font-black` (accent/blue/amber gradients), connector line `top-[60px]` gradient accent→blue→amber /30. Link 'See full step-by-step guide'.

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
Stack below sm, line hidden.

## Text content
Verbatim from the live site (see component source).
