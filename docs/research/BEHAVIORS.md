# Behaviors — cryptovaultx.app

## Global
- **Fonts:** the stylesheet declares `DM Sans` / `DM Mono`, but its Google Fonts `@import` is not the first rule, so browsers drop it. `document.fonts` contains zero DM faces on the live site, which actually renders `system-ui` (Segoe UI on Windows) and `monospace`. The clone keeps the same stack and loads nothing.
- **Scrollbar:** 6px, thumb `rgba(255,255,255,.08)`, radius 3px. `.scrollbar-hide` on horizontal strips.
- **Selection:** `rgba(34,211,167,.32)` bg, `#fafafa` text.
- **Smooth scroll:** native CSS only.

## Scroll reveal (most blocks)
- IntersectionObserver, fires once.
- `opacity 0 → 1`, `translateY(50px) → 0`, `0.8s cubic-bezier(0.16,1,0.3,1)`, per-item delay 0–400ms (stored in markup).
- Implemented as `<Reveal delay>`.

## Load-time stagger
- `.stagger-children > *` runs `reveal-up 0.6s` with delays 0/80/160/…ms (hero copy, security cards).

## Count-up (Stats)
- Value animates 0 → 256 / 600 / 0 / 0 / 28 with suffixes `-bit`, `K`, `%`, `%`, ` Days`.
- The span fades in from `translateY(20px)` over 0.5s.
- Stat hover: number turns `vault-accent` (500ms).

## Hero ambience (infinite)
- Grid fade-in 3s; `float-slow` 20s/25s and `float-reverse` 22s orbs; morphing blurred blob 15s.
- 8 `drift-up` particles, 12–33s.
- Hexagons spin: 60s forward, 45s reverse.
- Badge `pulse-glow` 4s; "Own Your Keys." gradient `shimmer` 4s.

## Hover states
- Nav links: zinc-500 → white plus a gradient underline that grows 0 → 100% width (0.4s).
- Primary buttons: `scale(1.03)`, opacity .9, glow shadow; arrow shifts `translate-x-1`.
- Feature cards: `-translate-y-2` (500ms), conic glow border fades in (`border-rotate` 6s); icon `scale-110 rotate-3`.
- Step tiles: `scale-110 rotate-6`.
- Security and chain cards: border becomes `vault-borderAccent`.

## App demo (`#how-it-works`)
- **Autoplay:** 4.5s per step, progress bar width updated every 25ms (`transition: width 25ms linear`), loops through steps 1→4.
- **Step colors:** #22d3a7, #06b6d4, #8b5cf6, #f59e0b.
  - Active tile: bg `color+15`, border `1.5px color+30`, scale 1.05.
  - Active row: bg `rgba(255,255,255,.03)`, border `color+20`, pulsing dot (`dotP` 1.5s).
- **Clicking a step or any in-phone control** stops autoplay. The bar then shows full width and a "▶ Auto-play" button appears to resume.
- **Screens:** Sign-in, Wallet, Send, New Vault, Vault Unlocked, Settings.
  - Bottom tabs switch screens. Send and Settings belong to no step, so no step is highlighted.
  - Screen enter animation: `phoneIn .35s`. Phone floats with `floatP` (6s).

## Pricing
- **Period toggle** (default 3 Months):
  - 1M: $7 / 1 month, "$7/mo"
  - 3M: $20 / 3 months, "$6.67/mo · Save 5%", "You save $1 USDT vs monthly"
  - 1Y: $60 / 1 year, "$5/mo · Save 29%", "You save $25"
- **Fee calculator:** number input (default 100); presets $10–$5000 highlight when they equal the input.
  - Network gas: Polygon ~$0.001 (0.0040 POL), Ethereum ~$5.00 (0.0020 ETH), Arbitrum ~$0.03 (0.0000 ETH), Base ~$0.02 (0.0000 ETH), BNB ~$0.08 (0.0003 BNB).
  - "You Receive Back" always equals the input amount.

## Responsive
- Nav links hidden below `md` (no hamburger; only "Launch App" remains).
- Features 3 cols @md; Stats 2 → 5 cols @sm; Steps 1 → 3 @sm.
- Demo: steps become a horizontal scroll strip below `lg`; phone 280×560 below `sm`.
- Plans stack below `lg`; chains 2/3/4 cols.
- Verified at 390px: no horizontal overflow.
