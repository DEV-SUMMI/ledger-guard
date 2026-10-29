# AppDemo Specification

## Overview
- **Target file:** `frontend/src/components/AppDemo.tsx`
- **Source markup:** server-rendered HTML segment `sec06_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** time-driven autoplay (4.5s/step, 25ms ticks) + click

## Key styles (exact source classes / computed values)
See BEHAVIORS.md 'App demo'. Phone shell `w-[300px] h-[580px] bg-[#08080f] border-white/[0.07] rounded-[2.5rem]`, shadow `0 40px 100px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.04)`; tab bar `bg-[#06060c]`. Six screens captured verbatim from the live DOM (signin, wallet, send, vault, unlock, settings).

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
Steps become horizontal scroll strip below lg; phone 280×560 below sm.

## Text content
Verbatim from the live site (see component source).
