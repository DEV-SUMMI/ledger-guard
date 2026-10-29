# Navbar Specification

## Overview
- **Target file:** `frontend/src/components/Navbar.tsx`
- **Source markup:** server-rendered HTML segment `sec00_nav` of https://cryptovaultx.app/ (class lists copied verbatim; inline styles converted to Tailwind arbitrary properties)
- **Screenshots:** `docs/design-references/cryptovaultx.app/`
- **Interaction model:** static + hover

## Key styles (exact source classes / computed values)
Fixed 64px bar, `bg-vault-bg/80 backdrop-blur-2xl border-b border-vault-border`, inner `max-w-[1200px] px-6`. Logo hex (vault-accent) + `text-xl font-extrabold` wordmark; links `text-sm text-zinc-500 hover:text-white px-3.5 py-2` with `.animated-underline`; CTA gradient `from-vault-accent to-vault-blue`, `text-vault-bg font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.03]`.

## Tokens
vault-bg #0a0a0f · vault-card #141418 · vault-cardHover #18181e · vault-border rgba(255,255,255,.06) · vault-borderAccent rgba(34,211,167,.15) · vault-accent #22d3a7 · vault-accentDim rgba(34,211,167,.12) · vault-blue #0ea5e9 · vault-text #e4e4e7 · textDim #a1a1aa · textMuted #71717a · textFaint #52525b

## Responsive
Links hidden below md.

## Text content
Verbatim from the live site (see component source).
