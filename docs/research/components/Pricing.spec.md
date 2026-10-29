# Pricing Specification

## Overview
- **Target file:** `frontend/src/components/Pricing.tsx`
- **Source markup:** server-rendered HTML segment `sec07_section` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** scroll reveal + hover (chain cards)

## Key styles (exact source classes / computed values)
Section wrapper + Supported Chains grid: cards `bg-vault-card rounded-xl p-3.5 sm:p-4`, letter tiles with per-chain gradients, badges LIVE (green-500/15) / SOON (zinc-800, card opacity-40) / FREE (blue-500/15).

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
2 / 3 @sm / 4 @lg cols.

## Text content
Verbatim from the live site (see component source).
