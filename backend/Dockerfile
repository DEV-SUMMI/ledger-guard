# Crypto Ledger guard API — production image (Railway / docker compose)
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=4000 \
    HOSTNAME=::
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/db ./db
COPY --from=build --chown=app:app /app/scripts ./scripts
USER app
EXPOSE 4000
# Migrations run on every start; they're idempotent and lock against concurrent runs.
# The admin is then seeded from ADMIN_EMAIL/ADMIN_PASSWORD when set (a no-op once it exists).
# Both run alongside the server rather than before it, so a sleeping or unreachable database
# never blocks boot (or a free-tier wake-up): /api/health answers at once, DB routes fail until it's back.
CMD ["sh", "-c", "(node scripts/migrate.mjs && node scripts/seed-admin.mjs --if-configured || echo 'startup: migrate/seed failed, serving anyway' >&2) & exec node server.js"]
