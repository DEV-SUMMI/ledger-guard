# Digital Vault: one entry point for both apps, docker and the database.
# Run `make` (or `make help`) to list targets.

# Recipes are POSIX sh. Launched from PowerShell/cmd on Windows, make falls back to cmd.exe
# (it only expands %OS%), so switch to the sh.exe bundled with Git for Windows, using its
# short 8.3 path because make cannot run a SHELL whose path contains spaces.
ifeq ($(shell echo %OS%),Windows_NT)
GIT_SH := $(shell for %%I in ("$(shell git --exec-path)/../../../bin/sh.exe") do @echo %%~sI)
SHELL := $(subst \,/,$(GIT_SH))
# Git's coreutils (awk, sed, grep...), for commands make runs without the shell.
export PATH := $(patsubst %/bin/sh.exe,%/usr/bin,$(SHELL));$(PATH)
endif

FRONTEND := frontend
BACKEND  := backend
COMPOSE  := docker compose
PSQL     := $(COMPOSE) exec db psql -U vault -d vault
MIGRATIONS := $(BACKEND)/db/migrations

.DEFAULT_GOAL := help

##@ Setup

.PHONY: setup
setup: env install ## Copy missing env files and install dependencies in both apps

.PHONY: install
install: ## npm install in both apps
	cd $(FRONTEND) && npm install
	cd $(BACKEND) && npm install

.PHONY: env
env: ## Create .env / .env.local files from the examples (never overwrites)
	@for pair in ".env.example:.env" "$(FRONTEND)/.env.example:$(FRONTEND)/.env.local" "$(BACKEND)/.env.example:$(BACKEND)/.env.local"; do \
		src=$${pair%%:*}; dst=$${pair##*:}; \
		if [ -f "$$dst" ]; then echo "exists:  $$dst"; else cp "$$src" "$$dst" && echo "created: $$dst (fill in the secrets)"; fi; \
	done

##@ Development

.PHONY: dev
dev: db-up ## Start Postgres, then both dev servers (Ctrl+C stops both)
	@$(MAKE) --no-print-directory -j2 dev-backend dev-frontend

.PHONY: stop
stop: ## Stop dev servers left running on ports 3000/4000 (e.g. after a closed terminal)
	@for port in 3000 4000; do \
		if command -v powershell.exe >/dev/null 2>&1; then \
			powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort $$port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id \$$_ -Force; 'stopped port $$port (pid ' + \$$_ + ')' }"; \
		else \
			pids=$$(lsof -ti tcp:$$port -sTCP:LISTEN 2>/dev/null); \
			if [ -n "$$pids" ]; then kill $$pids && echo "stopped port $$port (pid $$pids)"; fi; \
		fi; \
	done

.PHONY: dev-frontend
dev-frontend: ## Frontend dev server on http://localhost:3000
	cd $(FRONTEND) && npm run dev

.PHONY: dev-backend
dev-backend: ## Backend dev server on http://localhost:4000
	cd $(BACKEND) && npm run dev

##@ Quality and builds

.PHONY: lint
lint: ## eslint in both apps
	cd $(FRONTEND) && npm run lint
	cd $(BACKEND) && npm run lint

.PHONY: typecheck
typecheck: ## tsc in both apps
	cd $(FRONTEND) && npm run typecheck
	cd $(BACKEND) && npm run typecheck

.PHONY: build
build: ## Production build of both apps
	cd $(FRONTEND) && npm run build
	cd $(BACKEND) && npm run build

.PHONY: check
check: lint typecheck build ## lint + typecheck + build, both apps

.PHONY: clean
clean: ## Delete build output (.next, tsbuildinfo) in both apps
	rm -rf $(FRONTEND)/.next $(BACKEND)/.next $(FRONTEND)/*.tsbuildinfo $(BACKEND)/*.tsbuildinfo

##@ Docker (full stack: db + backend + frontend)

.PHONY: up
up: ## Build and start the whole stack in the background
	$(COMPOSE) up --build -d

.PHONY: down
down: ## Stop the stack (keeps the database volume)
	$(COMPOSE) down

.PHONY: restart
restart: down up ## Rebuild and restart the stack

.PHONY: logs
logs: ## Follow logs (one service: make logs s=backend)
	$(COMPOSE) logs -f $(s)

.PHONY: ps
ps: ## Show container status
	$(COMPOSE) ps

.PHONY: docker-build
docker-build: ## Build the images without starting them
	$(COMPOSE) build

.PHONY: docker-clean
docker-clean: ## Stop the stack and DELETE the database volume (asks first)
	@$(MAKE) --no-print-directory confirm msg="This deletes all database data in the docker volume."
	$(COMPOSE) down -v --remove-orphans

##@ Database (SQL migrations in backend/db/migrations)

.PHONY: db-up
db-up: ## Start only Postgres (for local dev) and wait until it is ready
	$(COMPOSE) up -d --wait db

.PHONY: db-down
db-down: ## Stop Postgres
	$(COMPOSE) stop db

.PHONY: db-migrate
db-migrate: ## Apply pending migrations (uses backend/.env.local)
	cd $(BACKEND) && npm run migrate

.PHONY: db-status
db-status: ## List applied migrations and any pending files
	@if ! $(PSQL) -tAc "SELECT 1" >/dev/null 2>&1; then echo "Database is not reachable; run: make db-up"; exit 1; fi; \
	applied=$$($(PSQL) -tAc "SELECT name FROM schema_migrations ORDER BY name" 2>/dev/null); \
	for f in $$(ls $(MIGRATIONS)/*.sql | xargs -n1 basename); do \
		if echo "$$applied" | grep -qx "$$f"; then echo "applied  $$f"; else echo "pending  $$f"; fi; \
	done

.PHONY: db-new
db-new: ## Create the next numbered migration: make db-new name=add_tags
	@if [ -z "$(name)" ]; then echo "usage: make db-new name=<snake_case_name>"; exit 1; fi
	@last=$$(ls $(MIGRATIONS)/*.sql | xargs -n1 basename | sort | tail -1 | cut -d_ -f1); \
	n=$$(echo "$$last" | sed 's/^0*//'); next=$$(printf "%03d" $$(($${n:-0} + 1))); \
	file="$(MIGRATIONS)/$${next}_$(name).sql"; \
	printf -- "-- %s\n" "$(name)" > "$$file" && echo "created: $$file"

.PHONY: db-seed-admin
db-seed-admin: ## Create/update the admin from ADMIN_* in backend/.env.local (RESET=1 to change its password)
	cd $(BACKEND) && npm run seed:admin -- $(if $(RESET),--reset-password)

.PHONY: db-shell
db-shell: ## Open psql in the database container
	$(PSQL)

.PHONY: db-reset
db-reset: ## Drop every table and re-run all migrations (asks first)
	@$(MAKE) --no-print-directory confirm msg="This drops ALL data in the local database."
	$(PSQL) -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	@$(MAKE) --no-print-directory db-migrate

# Interactive guard for destructive targets; skip it with CONFIRM=yes.
.PHONY: confirm
confirm:
	@if [ "$(CONFIRM)" != "yes" ]; then \
		printf "%s Continue? [y/N] " "$(msg)"; read ans; \
		[ "$$ans" = "y" ] || [ "$$ans" = "Y" ] || { echo "Aborted."; exit 1; }; \
	fi

##@ Help

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } \
		/^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
