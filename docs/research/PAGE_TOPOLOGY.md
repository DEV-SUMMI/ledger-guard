# Page Topology — cryptovaultx.app (home)

Single scroll page, native scrolling (`html { scroll-behavior: smooth }`, no Lenis/Locomotive).
Root wrapper: `min-h-screen bg-vault-bg text-vault-text overflow-x-hidden`.

| # | Section | Component | Layout | Interaction model |
|---|---------|-----------|--------|-------------------|
| 0 | Fixed nav (z-50, 64px, blur bg) | `Navbar` | overlay, `fixed top-0 inset-x-0` | static + hover (animated underline, button scale) |
| 1 | Hero (min-h-screen) | `Hero` | centered, max-w 820 | time-driven (floating orbs, drifting particles, spinning hexagons, shimmer text, load-time stagger) |
| 2 | "Why CryptoVault?" 3 cards | `Features` | grid 1 → 3 cols @md, max-w 1100 | scroll reveal + hover (glow-card conic border, lift, icon rotate) |
| 3 | Stats strip | `Stats` | grid 2 → 5 cols @sm, max-w 1000 | scroll reveal + count-up |
| 4 | How It Works (3 steps) | `HowItWorks` | grid 1 → 3 cols @sm, connector line | scroll reveal + hover |
| 5 | Security You Can Verify | `Security` | grid 1 → 2 cols @sm, max-w 800 | load-time stagger, hover border |
| 6 | Interactive app demo `#how-it-works` | `AppDemo` | steps column (270px) + phone (300×580) @lg; stacked below lg | time-driven autoplay (4.5s/step) + click |
| 7 | Pricing `#pricing` (plans, fee calculator, supported chains) | `Pricing` → `PricingPlans`, `FeeCalculator` | grid 1 → 2 @lg; calc max-w 560; chains 2/3/4 cols | click (period toggle, presets, network), input |
| 8 | CTA card | `Cta` | max-w 700, rounded-3xl | scroll reveal, floating orbs |
| 9 | Footer | `Footer` | 4 columns | static + hover |

No images or videos — every visual is CSS gradients, inline SVG and emoji.
