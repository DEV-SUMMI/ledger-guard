# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A pixel-faithful clone of the cryptovaultx.app landing page, plus a working end-to-end-encrypted vault: login, a member dashboard and an admin panel. Two independent apps, each with its own `package.json`, lockfile, `node_modules`, Dockerfile and `railway.json`:

- `frontend/`: the web app (port 3000). All paths below without a prefix are relative to it.
- `backend/`: the API.

The repo root holds only what is shared: `docker-compose.yml` (and the `.env` it reads), `docs/`, `.nvmrc`, `.gitignore`.

**Frontend**: Next.js 16 (App Router, `output: "standalone"`), React 19, Tailwind CSS v4, lucide icons. Node >= 24 (`.nvmrc`).

**Backend** (`backend/`): its own Next.js app (route handlers only, port 4000) over Postgres (`pg`, zod validation, SQL migrations in `backend/db/migrations/`, applied by `npm run migrate` and on `npm start`). The browser never calls it directly: the frontend's catch-all `src/app/api/[...path]/route.ts` proxies `/api/*` to `BACKEND_URL` with `INTERNAL_API_TOKEN`, so session cookies stay first-party. Local dev: `docker compose up db`, then `npm run dev` in both apps (env in `frontend/.env.local` / `backend/.env.local`, see each app's `.env.example`; the root `.env.example` is for docker compose only).

**Zero-knowledge crypto** (`src/lib/crypto.ts`): the password is stretched in the browser (PBKDF2 → HKDF) into an auth key (sent as the login secret) and an enc key (never leaves the device) that unwraps a random AES-GCM vault key. Every item's title, note and secret are encrypted client-side (`src/lib/vault-client.ts`, payload context binds category + wallet id); the server stores only ciphertext. The vault key lives only in memory (`src/lib/vault-key.ts`), so after a reload the dashboard shows `UnlockVault` and re-derives it via `/api/vault/keys`. **Admin key escrow** (class project, fake data only): at sign-up the browser also wraps the vault key to the admin's RSA-OAEP public key (`admin_escrow`, `users.admin_wrapped_vault_key`); the admin's private key is sealed with the admin's own vault key (`users.admin_private_key_wrapped`, created by `seed-admin.mjs`). The admin decrypts a member's items in their own browser (`src/lib/admin-vault.ts`, `GET /api/admin/users/[id]/items`); each read is audited as "Admin viewed vault items". Members created before migration 003 have no escrow copy.

**Admin accounts** can't be created through sign-up (it always creates `user`). `backend/scripts/seed-admin.mjs` creates/updates the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` (`make db-seed-admin`, and automatically on backend start when set). It re-implements the browser's key derivation and the server's scrypt hash in Node, so any change to `src/lib/crypto.ts` or `backend/src/lib/crypto.ts` must be mirrored there. It never changes an existing admin's password unless run with `--reset-password` (`RESET=1`), because that re-keys the vault and deletes the account's items.

## Commands

The root `Makefile` wraps both apps, docker compose and the migrations (`make` lists targets: `dev`, `check`, `up`/`down`, `db-migrate`, `db-new name=x`, `db-status`, `db-reset`...). Recipes are POSIX sh; on Windows the Makefile switches to Git for Windows' `sh.exe` so it also works from PowerShell.

Run from `frontend/`:

```bash
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm run lint       # eslint (next core-web-vitals + typescript configs)
npm run typecheck  # next typegen + tsc --noEmit
npm run check      # lint + typecheck + build
```

There is no test suite. The backend has the same `dev`/`build`/`lint`/`typecheck` scripts plus `migrate`, run from `backend/`.

## Architecture

- **Routes** (`src/app/`): `/` (landing), `/login`, `/dashboard`, `/admin`. Pages are thin server components that set `metadata` and render a component; `/dashboard` and `/admin` check the session server-side (`src/lib/server-session.ts`); interactive shells (`DashboardShell`, `AdminShell`, `AuthForm`) are client components that load their data through `src/lib/api.ts`.
- **Landing page** (`src/app/page.tsx`): one component per section, in order Navbar → Hero → Features → Stats → HowItWorks → Security → AppDemo → Cta → Footer. Mark files `"use client"` only when they need state/effects.
- **Branding**: `src/lib/brand.ts` (`BRAND`) is the single source of truth for product name, titles and copy used across pages. Use it rather than hardcoding the name.
- **Static data**: `src/lib/vault-data.ts` (categories, plus placeholder items for the landing page's AppDemo only), `src/lib/wallets.ts` (seed-phrase wallet grid; ids must match `^[a-z0-9-]{1,40}$`). Types live in `src/types/`. Keep any placeholder data obviously fake (e.g. `example.com` emails, no key-shaped secret values).
- **Styling**: everything is in `src/app/globals.css`. Site tokens are defined in `@theme` as `--color-vault-*` (used as `bg-vault-bg`, `text-vault-accent`, `border-vault-borderAccent`, etc.), alongside the shadcn variables. Custom utility classes (`.glow-card`, `.animated-underline`, `.stagger-children`, `.text-shimmer`, `.scrollbar-hide`) and all keyframes live there too; components reference keyframes via arbitrary properties like `[animation:float-slow_22s_ease-in-out_infinite]`.
- **Animation helpers**: `Reveal` (IntersectionObserver fade-up, fires once, `delay` prop) and `CountUp`. No scroll libraries; smooth scroll is native CSS.
- **shadcn**: `components.json` is configured (`base-nova` style), but no shadcn components are currently installed; `npx shadcn add <name>` puts them in `src/components/ui/`.
- **Fonts**: deliberately none loaded. The original site's DM Sans import is ignored by browsers, so it renders `system-ui`; the clone matches that.
- **Visuals**: the only images are wallet logos in `src/images/` (dashboard seed grid); everything else is CSS gradients, inline SVG (`src/components/icons.tsx`, `src/components/dashboard/icons.tsx`) and emoji.
- Path alias: `@/*` → `src/*`. `cn()` in `src/lib/utils.ts`.

## Reference docs

When changing landing-page sections, check `docs/research/` (repo root) first for fidelity to the original:
- `PAGE_TOPOLOGY.md`: section order, layout and interaction model per section.
- `BEHAVIORS.md`: exact animation timings, hover states, the AppDemo autoplay logic, etc.
- `components/*.spec.md`: per-component specs with exact source classes and tokens.
- `docs/design-references/cryptovaultx.app/`: screenshots of the original.
