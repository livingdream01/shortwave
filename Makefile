# Shortwave — task shortcuts. `make setup` gets a newcomer to a running portal.
.DEFAULT_GOAL := help

setup: ## install deps, start Supabase, apply schema, create .env.local
	npm install
	@command -v supabase >/dev/null 2>&1 && supabase start && supabase db reset || echo "Supabase CLI missing: brew install supabase/tap/supabase"
	@test -f .env.local || cp .env.example .env.local
	@echo "Done. Run 'make dev' then open http://localhost:3040 (sign in via Mailpit :54324)."

dev: ## run the control-plane portal
	npm run dev

demo: ## produce a real MP4 offline (no keys)
	npm run worker -- --demo

work: ## generate one episode (live brain if keys present)
	npm run worker

sweep: ## unattended: refresh token -> publish -> alert
	npm run sweep

refresh: ## refresh the Instagram token
	npm run refresh

mcp: ## start the MCP server (drive Shortwave from Claude)
	npm run mcp

test: ## run the test suite
	npm test

ci: lint typecheck test build ## full quality gate

lint:
	npm run lint

typecheck:
	npm run typecheck

build:
	npm run build

up: ## install the launchd jobs (boot + sweep + refresh; add KEEP=1 for keep-awake)
	bash scripts/install-launchd.sh $(if $(KEEP),--keepawake,)

down: ## remove the launchd jobs
	bash scripts/uninstall-launchd.sh

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

.PHONY: setup dev demo work sweep refresh mcp test ci lint typecheck build up down help
