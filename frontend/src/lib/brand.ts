/**
 * Single source of truth for product branding.
 * Change these when you pick your real name — they flow through the whole UI,
 * including page titles, the navbar, footer and the app demo.
 */
export const BRAND = {
  name: "Crypto Ledger guard",
  tagline: "A safe vault for crypto keepers and traders.",
  /** Browser tab / SEO title. */
  title: "Crypto Ledger guard — Private Encrypted Storage for Crypto Data",
  /** Meta description. */
  description:
    "Store seed phrases, private keys and API keys in an encrypted vault. Every member gets their own private dashboard.",
  /** Shown on the auth panel; keep it short. */
  blurb:
    "Store your seed phrases and keys behind encryption you control. Self-custodial by design — nobody else holds your data.",
  highlights: [
    "End-to-end encrypted storage",
    "You hold the keys, not us",
    "Open, auditable security",
  ],
  /** Footer legal line, appended after the name. */
  legalLine: "Self-custodial vault software. Not a financial institution.",
} as const;
