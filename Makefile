.PHONY: help setup install-frontend install-backend frontend backend migrate seed clean

# ── Config ────────────────────────────────────────────────
BACKEND_DIR  := backend
FRONTEND_DIR := frontend
VENV         := $(BACKEND_DIR)/venv
PYTHON       := $(VENV)/bin/python
PIP          := $(VENV)/bin/pip

# pydantic-core and psycopg2 require Python ≤3.13 — prefer 3.12
PYTHON_CMD   := $(shell which python3.12 2>/dev/null || which python3.13 2>/dev/null || echo python3)

# ── Default ───────────────────────────────────────────────
help:
	@echo ""
	@echo "  DevOS — Available Commands"
	@echo ""
	@echo "  make setup            Full first-time setup (frontend + backend)"
	@echo "  make frontend         Start Expo dev server (scan QR with Expo Go)"
	@echo "  make backend          Start FastAPI server on :8000"
	@echo ""
	@echo "  make install-frontend npm install in frontend/"
	@echo "  make install-backend  Create venv + pip install in backend/"
	@echo ""
	@echo "  make migrate          Print SQL migration instructions"
	@echo "  make seed             Print seed data instructions"
	@echo ""
	@echo "  make clean            Remove node_modules and venv"
	@echo ""

# ── First-time setup ──────────────────────────────────────
setup: install-frontend install-backend
	@echo ""
	@echo "✓ Setup complete."
	@echo ""
	@echo "Next steps:"
	@echo "  1. Fill in .env  (cp .env.example .env)"
	@echo "  2. make migrate  (run SQL in Supabase SQL Editor)"
	@echo "  3. make backend  (in one terminal)"
	@echo "  4. make frontend (in another terminal)"
	@echo ""

# ── Frontend ──────────────────────────────────────────────
install-frontend:
	@echo "→ Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && npm install

frontend:
	@echo "→ Copying .env to frontend/..."
	cp .env $(FRONTEND_DIR)/.env 2>/dev/null || true
	@echo "→ Starting Expo dev server..."
	cd $(FRONTEND_DIR) && npm start -- --clear

frontend-ios:
	cd $(FRONTEND_DIR) && npm run ios

frontend-android:
	cd $(FRONTEND_DIR) && npm run android

# ── Backend ───────────────────────────────────────────────
install-backend:
	@echo "→ Using $(PYTHON_CMD) (Python 3.14 not yet supported by pydantic-core)"
	rm -rf $(VENV)
	$(PYTHON_CMD) -m venv $(VENV)
	$(PIP) install --upgrade pip --quiet
	$(PIP) install -r $(BACKEND_DIR)/requirements.txt

backend:
	@echo "→ Starting FastAPI on http://localhost:8000 ..."
	cp .env $(BACKEND_DIR)/.env 2>/dev/null || true
	cd $(BACKEND_DIR) && ./venv/bin/python main.py

backend-test:
	cd $(BACKEND_DIR) && ./venv/bin/pytest -v

# ── Database ──────────────────────────────────────────────
migrate:
	@echo ""
	@echo "  ── Run migration in Supabase SQL Editor ──"
	@echo ""
	@echo "  1. Go to https://supabase.com → your project"
	@echo "  2. Click SQL Editor → New query"
	@echo "  3. Paste the contents of: supabase/migrations/001_init.sql"
	@echo "  4. Click Run"
	@echo ""
	@cat supabase/migrations/001_init.sql
	@echo ""

seed:
	@echo ""
	@echo "  ── Run seed in Supabase SQL Editor ──"
	@echo ""
	@echo "  1. Go to https://supabase.com → your project"
	@echo "  2. Click SQL Editor → New query"
	@echo "  3. Paste the contents of: supabase/seed.sql"
	@echo "  4. Click Run"
	@echo ""
	@cat supabase/seed.sql
	@echo ""

# ── Health check ──────────────────────────────────────────
check:
	@curl -s http://localhost:8000/health | python3 -m json.tool

# ── Clean ─────────────────────────────────────────────────
clean:
	@echo "→ Removing node_modules and venv..."
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(VENV)
	@echo "✓ Clean."
