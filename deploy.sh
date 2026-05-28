#!/usr/bin/env bash
# =============================================================================
# Hostproof — Production Deploy Script
# =============================================================================
#
# Usage:
#   ./deploy.sh [OPTIONS]
#
# Options:
#   --api-port  PORT   Port for the AdonisJS API      (default: 3333)
#   --web-port  PORT   Port for the Next.js web app   (default: 3000)
#   --skip-build       Skip the build step (reuse existing artifacts)
#   --skip-migrate     Skip database migrations
#   --help             Show this help message
#
# Root env files (create these from the .example templates):
#   .env.api  →  copied to apps/api/.env  and  apps/api/build/.env
#   .env.web  →  copied to apps/web/.env.production.local  (before build)
#
# Port env variables (alternative to flags):
#   HOSTPROOF_API_PORT
#   HOSTPROOF_WEB_PORT
#
# Examples:
#   ./deploy.sh
#   ./deploy.sh --api-port 8080 --web-port 8081
#   HOSTPROOF_API_PORT=8080 ./deploy.sh
# =============================================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

log()     { echo -e "${CYAN}${BOLD}[deploy]${RESET} $*"; }
success() { echo -e "${GREEN}${BOLD}[✓]${RESET} $*"; }
warn()    { echo -e "${YELLOW}${BOLD}[!]${RESET} $*"; }
error()   { echo -e "${RED}${BOLD}[✗]${RESET} $*" >&2; }
die()     { error "$*"; exit 1; }

# ─── Defaults ────────────────────────────────────────────────────────────────
API_PORT="${HOSTPROOF_API_PORT:-1234}"
WEB_PORT="${HOSTPROOF_WEB_PORT:-5050}"
SKIP_BUILD=false
SKIP_MIGRATE=false

# ─── Argument parsing ────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-port)    API_PORT="$2";   shift 2 ;;
    --web-port)    WEB_PORT="$2";   shift 2 ;;
    --skip-build)  SKIP_BUILD=true; shift   ;;
    --skip-migrate) SKIP_MIGRATE=true; shift ;;
    --help|-h)
      sed -n '3,27p' "$0" | sed 's/^# \?//'
      exit 0 ;;
    *) die "Unknown option: $1  (run ./deploy.sh --help)" ;;
  esac
done

export HOSTPROOF_API_PORT="$API_PORT"
export HOSTPROOF_WEB_PORT="$WEB_PORT"

# ─── Resolve repo root ───────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  Hostproof Production Deploy${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${RESET}"
echo -e "  API  → port ${BOLD}${API_PORT}${RESET}"
echo -e "  Web  → port ${BOLD}${WEB_PORT}${RESET}"
echo ""

# ─── 1. Prerequisites ────────────────────────────────────────────────────────
log "Checking prerequisites…"

check_cmd() {
  command -v "$1" &>/dev/null || die "'$1' is not installed. $2"
}
check_cmd node "Install from https://nodejs.org (v20 LTS recommended)"
check_cmd pnpm "Run: npm i -g pnpm"
check_cmd pm2  "Run: npm i -g pm2"

log "  Node $(node -e 'process.stdout.write(process.version)') / pnpm $(pnpm --version) / pm2 $(pm2 --version)"

# ─── 2. Distribute root env files ────────────────────────────────────────────
log "Distributing env files…"

# ── API env (.env.api → apps/api/.env) ──────────────────────────────────────
if [[ -f ".env.api" ]]; then
  cp .env.api apps/api/.env
  success ".env.api  →  apps/api/.env"
elif [[ -f "apps/api/.env" ]]; then
  warn ".env.api not found at repo root — using existing apps/api/.env"
else
  if [[ -f ".env.api.example" ]]; then
    warn ".env.api not found. Copy the template and fill in your values:"
    warn "  cp .env.api.example .env.api && \$EDITOR .env.api"
  fi
  die "No API env file found. Cannot continue."
fi

# ── Web env (.env.web → apps/web/.env.production.local) ─────────────────────
# This must happen BEFORE the build so NEXT_PUBLIC_* vars are baked in.
if [[ -f ".env.web" ]]; then
  cp .env.web apps/web/.env.production.local
  success ".env.web  →  apps/web/.env.production.local"
else
  warn ".env.web not found at repo root — web app will use any existing env vars"
  warn "  (create from template: cp .env.web.example .env.web)"
fi

# ─── 3. Install dependencies ─────────────────────────────────────────────────
log "Installing dependencies…"
pnpm install --frozen-lockfile
success "Dependencies installed"

# ─── 4. Build ────────────────────────────────────────────────────────────────
if [[ "$SKIP_BUILD" == false ]]; then
  log "Building API (AdonisJS)…"
  pnpm build:api
  success "API build complete  →  apps/api/build/"

  log "Building Web (Next.js)…"
  pnpm build:web
  success "Web build complete  →  apps/web/.next/"
else
  warn "--skip-build: reusing existing artifacts"
fi

# ─── 5. Finalize API build directory ─────────────────────────────────────────
log "Finalising API build directory…"

[[ -d "apps/api/build" ]] || die "apps/api/build/ not found — run without --skip-build first."

# Copy .env into the build dir (AdonisJS reads it from cwd at runtime)
cp apps/api/.env apps/api/build/.env
success ".env  →  apps/api/build/.env"

log "Installing production deps in apps/api/build/…"
(cd apps/api/build && pnpm install --prod --ignore-scripts)
success "Production deps installed in build/"

# ─── 6. Database migrations ──────────────────────────────────────────────────
if [[ "$SKIP_MIGRATE" == false ]]; then
  log "Running database migrations…"
  (cd apps/api/build && node ace migration:run --force)
  success "Migrations complete"
else
  warn "--skip-migrate: skipping migrations"
fi

# ─── 7. Log directory ────────────────────────────────────────────────────────
mkdir -p logs
success "Log directory ready  →  logs/"

# ─── 8. Start / reload PM2 ───────────────────────────────────────────────────
log "Starting services with PM2…"
if pm2 list 2>/dev/null | grep -q "hostproof-"; then
  log "Existing PM2 processes found — reloading (zero-downtime)…"
  pm2 reload ecosystem.config.cjs --env production
else
  log "No existing processes — starting fresh…"
  pm2 start ecosystem.config.cjs --env production
fi
success "PM2 processes running"
pm2 save
success "PM2 process list saved"

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  Deploy complete!${RESET}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════${RESET}"
echo -e "  API   http://localhost:${API_PORT}"
echo -e "  Web   http://localhost:${WEB_PORT}"
echo ""
echo -e "  ${BOLD}pm2 logs${RESET}    — stream all logs"
echo -e "  ${BOLD}pm2 list${RESET}    — process status"
echo -e "  ${BOLD}pm2 monit${RESET}   — CPU / memory dashboard"
echo -e "  ${BOLD}pm2 startup${RESET} — enable auto-start on reboot"
echo ""
