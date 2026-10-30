# Crypto Ledger guard

A clone of the cryptovaultx.app landing page plus a working end-to-end-encrypted vault (login, member dashboard, admin panel).

## Layout

```
frontend/   Next.js web app (port 3000): landing page, /login, /dashboard, /admin
backend/    Next.js API app (port 4000): route handlers over Postgres
docs/       research notes and screenshots of the original site
docker-compose.yml   Postgres + both apps
```

The browser only talks to the frontend; it proxies `/api/*` to the backend.

## Run it locally

Everything is wrapped in the root `Makefile`; run `make` to list targets. The common ones:

```bash
make setup        # create env files from the examples, npm install both apps
make dev          # Postgres in docker + both dev servers
make stop         # stop dev servers left running on ports 3000/4000
make db-migrate   # apply SQL migrations   (also: db-status, db-new name=x, db-shell, db-reset)
make db-seed-admin  # create the admin from ADMIN_EMAIL/ADMIN_PASSWORD in backend/.env.local
make up / down    # full stack in docker   (also: logs s=backend, ps, docker-clean)
make check        # lint + typecheck + build, both apps
```

Or by hand:

```bash
docker compose up db                    # Postgres
cd backend  && npm install && npm run migrate && npm run dev
cd frontend && npm install && npm run dev
```

Copy each app's `.env.example` to `.env.local` first. Then open http://localhost:3000.

There is no admin sign-up. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters) and `ADMIN_NAME` in `backend/.env.local` and run `make db-seed-admin`; the backend also seeds it on start (docker / Railway) when those are set. Change the password later with `make db-seed-admin RESET=1`.

Or run the whole stack in containers: `cp .env.example .env`, fill in the secrets, `docker compose up --build`.

## Commands (in either app)

- `npm run dev`: dev server
- `npm run build` / `npm start`: production build and serve
- `npm run lint` / `npm run typecheck`: checks (`npm run check` in `frontend/` runs all three)
- `npm run migrate`: apply SQL migrations (`backend/` only)
