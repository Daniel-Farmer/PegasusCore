#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Pegasus Core Installer
# One script. Pick your modules. Everything just works.
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ============================================================================
# Module toggles — all off by default, core always on
# ============================================================================

# Infrastructure
MOD_COOLIFY=0
MOD_TRAEFIK=0
MOD_SUPABASE_SELF=0

# Data & Storage
MOD_REDIS=0
MOD_MINIO=0
MOD_MEILISEARCH=0

# AI Layer
MOD_QDRANT=0
MOD_WEAVIATE=0
MOD_TEMPORAL=0
MOD_BULLMQ=0

# Security
MOD_AUTHELIA=0
MOD_VAULT=0

# Monitoring & DevEx
MOD_OTEL=0
MOD_SENTRY=0
MOD_NATS=0
MOD_GITHUB_ACTIONS=0
MOD_DRIZZLE=0
MOD_PRISMA=0
MOD_GPU=0
MOD_CLAUDE_CODE=0

needs_docker() {
  [[ $MOD_REDIS -eq 1 || $MOD_QDRANT -eq 1 || $MOD_WEAVIATE -eq 1 || \
     $MOD_TRAEFIK -eq 1 || $MOD_MINIO -eq 1 || $MOD_MEILISEARCH -eq 1 || \
     $MOD_TEMPORAL -eq 1 || $MOD_NATS -eq 1 || $MOD_AUTHELIA -eq 1 || \
     $MOD_VAULT -eq 1 || $MOD_OTEL -eq 1 || $MOD_SUPABASE_SELF -eq 1 ]]
}

# ============================================================================
# Interactive menu
# ============================================================================
mark() { [[ $1 -eq 1 ]] && echo "x" || echo " "; }

show_menu() {
  clear
  echo -e "${CYAN}${BOLD}"
  echo "  ____                                    ____"
  echo " |  _ \ ___  __ _  __ _ ___ _   _ ___   / ___|___  _ __ ___"
  echo " | |_) / _ \/ _\` |/ _\` / __| | | / __| | |   / _ \| '__/ _ \\"
  echo " |  __/  __/ (_| | (_| \__ \ |_| \__ \ | |__| (_) | | |  __/"
  echo " |_|   \___|\__, |\__,_|___/\__,_|___/  \____\___/|_|  \___|"
  echo "            |___/"
  echo -e "${NC}"
  echo -e "  ${BOLD}Installer${NC}"
  echo ""
  echo -e "  ${GREEN}Core (always installed):${NC}"
  echo -e "    ${GREEN}[x]${NC} Node.js 20 + PM2      ${GREEN}[x]${NC} Bifrost (AI gateway)"
  echo -e "    ${GREEN}[x]${NC} Next.js app            ${GREEN}[x]${NC} Flowise (agent builder)"
  echo -e "    ${GREEN}[x]${NC} Supabase (cloud)"
  echo ""
  echo -e "  ${YELLOW}Optional modules — enter number to toggle:${NC}"
  echo ""
  echo -e "  ${MAGENTA}Infrastructure${NC}"
  echo -e "     ${BOLD}1)${NC} [$(mark $MOD_COOLIFY)] Coolify          ${DIM}— self-hosted PaaS${NC}"
  echo -e "     ${BOLD}2)${NC} [$(mark $MOD_TRAEFIK)] Traefik          ${DIM}— reverse proxy + auto SSL${NC}"
  echo -e "     ${BOLD}3)${NC} [$(mark $MOD_SUPABASE_SELF)] Supabase (self)  ${DIM}— self-hosted Postgres + auth + storage${NC}"
  echo ""
  echo -e "  ${MAGENTA}Data & Storage${NC}"
  echo -e "     ${BOLD}4)${NC} [$(mark $MOD_REDIS)] Redis            ${DIM}— caching, queues, rate limiting${NC}"
  echo -e "     ${BOLD}5)${NC} [$(mark $MOD_MINIO)] MinIO            ${DIM}— S3-compatible object storage${NC}"
  echo -e "     ${BOLD}6)${NC} [$(mark $MOD_MEILISEARCH)] Meilisearch      ${DIM}— full-text search engine${NC}"
  echo ""
  echo -e "  ${MAGENTA}AI Layer${NC}"
  echo -e "     ${BOLD}7)${NC} [$(mark $MOD_QDRANT)] Qdrant           ${DIM}— vector DB for embeddings${NC}"
  echo -e "     ${BOLD}8)${NC} [$(mark $MOD_WEAVIATE)] Weaviate         ${DIM}— vector DB (alternative)${NC}"
  echo -e "     ${BOLD}9)${NC} [$(mark $MOD_TEMPORAL)] Temporal         ${DIM}— durable workflow engine${NC}"
  echo -e "    ${BOLD}10)${NC} [$(mark $MOD_BULLMQ)] BullMQ           ${DIM}— job queues (auto-enables Redis)${NC}"
  echo -e "    ${BOLD}11)${NC} [$(mark $MOD_GPU)] GPU Nodes        ${DIM}— RunPod / Vast / self-hosted${NC}"
  echo ""
  echo -e "  ${MAGENTA}Security${NC}"
  echo -e "    ${BOLD}12)${NC} [$(mark $MOD_AUTHELIA)] Authelia         ${DIM}— SSO + identity provider${NC}"
  echo -e "    ${BOLD}13)${NC} [$(mark $MOD_VAULT)] Vault            ${DIM}— secrets management${NC}"
  echo ""
  echo -e "  ${MAGENTA}Monitoring & DevEx${NC}"
  echo -e "    ${BOLD}14)${NC} [$(mark $MOD_OTEL)] OpenTelemetry    ${DIM}— tracing + metrics${NC}"
  echo -e "    ${BOLD}15)${NC} [$(mark $MOD_SENTRY)] Sentry           ${DIM}— error tracking${NC}"
  echo -e "    ${BOLD}16)${NC} [$(mark $MOD_NATS)] NATS             ${DIM}— event messaging${NC}"
  echo -e "    ${BOLD}17)${NC} [$(mark $MOD_GITHUB_ACTIONS)] GitHub Actions   ${DIM}— CI/CD workflows${NC}"
  echo -e "    ${BOLD}18)${NC} [$(mark $MOD_DRIZZLE)] Drizzle          ${DIM}— TypeScript ORM${NC}"
  echo -e "    ${BOLD}19)${NC} [$(mark $MOD_PRISMA)] Prisma           ${DIM}— database ORM${NC}"
  echo -e "    ${BOLD}20)${NC} [$(mark $MOD_CLAUDE_CODE)] Claude Code      ${DIM}— AI coding assistant on the server${NC}"
  echo ""
  echo -e "    ${BOLD} a)${NC} Select all    ${BOLD}n)${NC} Select none"
  echo ""
  echo -e "  Press ${BOLD}Enter${NC} to install, ${BOLD}q${NC} to quit."
  echo ""
}

select_modules() {
  while true; do
    show_menu
    read -rp "  > " key
    case "$key" in
      1)  MOD_COOLIFY=$(( 1 - MOD_COOLIFY )) ;;
      2)  MOD_TRAEFIK=$(( 1 - MOD_TRAEFIK )) ;;
      3)  MOD_SUPABASE_SELF=$(( 1 - MOD_SUPABASE_SELF )) ;;
      4)  MOD_REDIS=$(( 1 - MOD_REDIS )) ;;
      5)  MOD_MINIO=$(( 1 - MOD_MINIO )) ;;
      6)  MOD_MEILISEARCH=$(( 1 - MOD_MEILISEARCH )) ;;
      7)  MOD_QDRANT=$(( 1 - MOD_QDRANT )) ;;
      8)  MOD_WEAVIATE=$(( 1 - MOD_WEAVIATE )) ;;
      9)  MOD_TEMPORAL=$(( 1 - MOD_TEMPORAL )) ;;
      10)
        MOD_BULLMQ=$(( 1 - MOD_BULLMQ ))
        [[ $MOD_BULLMQ -eq 1 ]] && MOD_REDIS=1
        ;;
      11) MOD_GPU=$(( 1 - MOD_GPU )) ;;
      12) MOD_AUTHELIA=$(( 1 - MOD_AUTHELIA )) ;;
      13) MOD_VAULT=$(( 1 - MOD_VAULT )) ;;
      14) MOD_OTEL=$(( 1 - MOD_OTEL )) ;;
      15) MOD_SENTRY=$(( 1 - MOD_SENTRY )) ;;
      16) MOD_NATS=$(( 1 - MOD_NATS )) ;;
      17) MOD_GITHUB_ACTIONS=$(( 1 - MOD_GITHUB_ACTIONS )) ;;
      18) MOD_DRIZZLE=$(( 1 - MOD_DRIZZLE )) ;;
      19) MOD_PRISMA=$(( 1 - MOD_PRISMA )) ;;
      20) MOD_CLAUDE_CODE=$(( 1 - MOD_CLAUDE_CODE )) ;;
      a|A)
        MOD_COOLIFY=1; MOD_TRAEFIK=1; MOD_SUPABASE_SELF=1
        MOD_REDIS=1; MOD_MINIO=1; MOD_MEILISEARCH=1
        MOD_QDRANT=1; MOD_WEAVIATE=1; MOD_TEMPORAL=1; MOD_BULLMQ=1; MOD_GPU=1
        MOD_AUTHELIA=1; MOD_VAULT=1
        MOD_OTEL=1; MOD_SENTRY=1; MOD_NATS=1; MOD_GITHUB_ACTIONS=1
        MOD_DRIZZLE=1; MOD_PRISMA=1; MOD_CLAUDE_CODE=1
        ;;
      n|N)
        MOD_COOLIFY=0; MOD_TRAEFIK=0; MOD_SUPABASE_SELF=0
        MOD_REDIS=0; MOD_MINIO=0; MOD_MEILISEARCH=0
        MOD_QDRANT=0; MOD_WEAVIATE=0; MOD_TEMPORAL=0; MOD_BULLMQ=0; MOD_GPU=0
        MOD_AUTHELIA=0; MOD_VAULT=0
        MOD_OTEL=0; MOD_SENTRY=0; MOD_NATS=0; MOD_GITHUB_ACTIONS=0
        MOD_DRIZZLE=0; MOD_PRISMA=0; MOD_CLAUDE_CODE=0
        ;;
      q|Q) echo "Aborted."; exit 0 ;;
      "") break ;;
    esac
  done
}

# ============================================================================
# Logging helpers
# ============================================================================
step() { echo -e "\n${CYAN}${BOLD}=> $1${NC}"; }
ok()   { echo -e "   ${GREEN}done${NC}"; }
warn() { echo -e "   ${YELLOW}$1${NC}"; }
fail() { echo -e "   ${RED}$1${NC}"; exit 1; }

# ============================================================================
# System setup
# ============================================================================
install_system_deps() {
  step "Updating system packages"
  apt-get update -qq && apt-get upgrade -y -qq
  ok

  # Node.js 20
  if command -v node &>/dev/null && [[ "$(node -v)" == v20.* ]]; then
    step "Node.js $(node -v) already installed"
  else
    step "Installing Node.js 20"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    apt-get install -y -qq nodejs
    ok
  fi

  # PM2
  if command -v pm2 &>/dev/null; then
    step "PM2 already installed"
  else
    step "Installing PM2"
    npm install -g pm2 --quiet
    ok
  fi

  # socat (for Bifrost proxy)
  if ! command -v socat &>/dev/null; then
    step "Installing socat"
    apt-get install -y -qq socat
    ok
  fi

  # Docker (if needed)
  if needs_docker; then
    if command -v docker &>/dev/null; then
      step "Docker already installed"
    else
      step "Installing Docker"
      curl -fsSL https://get.docker.com | sh >/dev/null 2>&1
      systemctl enable docker --now
      ok
    fi
  fi

  # Swap (if <4GB RAM and no swap)
  local total_ram
  total_ram=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
  if [[ $total_ram -lt 4096 ]] && ! swapon --show | grep -q "/"; then
    step "Adding 2GB swap (${total_ram}MB RAM detected)"
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile >/dev/null
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    ok
  fi
}

# ============================================================================
# Core install
# ============================================================================
install_core() {
  step "Installing npm dependencies"
  npm install --quiet
  ok

  if [[ ! -f .env.local ]]; then
    step "Creating .env.local from example"
    cp .env.local.example .env.local
    ok
  fi
}

# ============================================================================
# Module installers
# ============================================================================

# --- Infrastructure ---

install_coolify() {
  step "Installing Coolify"
  curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
  ok
}

install_traefik() {
  step "Setting up Traefik"
  echo ""
  read -rp "   Enter your domain (e.g. app.example.com): " domain
  read -rp "   Enter your email (for Let's Encrypt): " email

  if [[ -z "$domain" || -z "$email" ]]; then
    warn "Skipping Traefik — domain and email required"
    return
  fi

  mkdir -p modules/traefik/acme
  touch modules/traefik/acme/acme.json
  chmod 600 modules/traefik/acme/acme.json

  # Work on copies so git stays clean
  cp modules/traefik/dynamic.yml modules/traefik/dynamic.active.yml
  cp modules/traefik/traefik.yml modules/traefik/traefik.active.yml
  sed -i "s/APP_DOMAIN/$domain/g" modules/traefik/dynamic.active.yml
  sed -i "s/ACME_EMAIL/$email/g" modules/traefik/traefik.active.yml

  docker network create web 2>/dev/null || true
  docker compose -f modules/traefik/docker-compose.yml up -d
  ok
}

install_supabase_self() {
  step "Installing Supabase (self-hosted)"
  if [[ -d /opt/supabase ]]; then
    warn "Supabase already cloned at /opt/supabase"
  else
    git clone --depth 1 https://github.com/supabase/supabase /opt/supabase
  fi
  cd /opt/supabase/docker
  cp .env.example .env
  # Generate random secrets
  sed -i "s/super-secret-jwt-token-with-at-least-32-characters-long/$(openssl rand -hex 32)/g" .env
  sed -i "s/this_password_is_insecure_and_should_be_updated/$(openssl rand -hex 16)/g" .env
  docker compose up -d
  cd "$SCRIPT_DIR"
  ok
}

# --- Data & Storage ---

install_redis() {
  step "Starting Redis"
  docker compose -f modules/redis/docker-compose.yml up -d
  sed -i 's/^# REDIS_URL/REDIS_URL/' .env.local
  ok
}

install_minio() {
  step "Starting MinIO"
  docker compose -f modules/minio/docker-compose.yml up -d
  echo ""
  echo -e "   ${DIM}MinIO Console: http://localhost:9001${NC}"
  echo -e "   ${DIM}Default creds: minioadmin / minioadmin${NC}"
  echo -e "   ${DIM}Change these in modules/minio/docker-compose.yml${NC}"
  ok
}

install_meilisearch() {
  step "Starting Meilisearch"
  docker compose -f modules/meilisearch/docker-compose.yml up -d
  ok
}

# --- AI Layer ---

install_qdrant() {
  step "Starting Qdrant"
  docker compose -f modules/qdrant/docker-compose.yml up -d
  sed -i 's/^# QDRANT_URL/QDRANT_URL/' .env.local
  ok
}

install_weaviate() {
  step "Starting Weaviate"
  docker compose -f modules/weaviate/docker-compose.yml up -d
  ok
}

install_temporal() {
  step "Starting Temporal"
  docker compose -f modules/temporal/docker-compose.yml up -d
  echo -e "   ${DIM}Temporal UI: http://localhost:8088${NC}"
  ok
}

install_bullmq() {
  step "Installing BullMQ"
  npm install bullmq --quiet
  if [[ ! -d lib/bullmq ]]; then
    mkdir -p lib/bullmq
    cp modules/bullmq/worker.template.ts lib/bullmq/worker.ts
    cp modules/bullmq/queue.template.ts lib/bullmq/queue.ts
  fi
  ok
}

install_gpu() {
  step "Configuring GPU nodes"
  echo ""
  echo -e "   ${DIM}GPU support configured. Set these in .env.local:${NC}"
  echo -e "   ${DIM}  GPU_PROVIDER=runpod|vast|self-hosted${NC}"
  echo -e "   ${DIM}  GPU_API_KEY=your-key${NC}"
  echo -e "   ${DIM}  GPU_ENDPOINT=http://your-gpu:8000${NC}"
  echo -e "   ${DIM}See modules/gpu/README.md for details.${NC}"
  ok
}

# --- Security ---

install_authelia() {
  step "Starting Authelia"
  docker compose -f modules/authelia/docker-compose.yml up -d
  warn "Update secrets in modules/authelia/docker-compose.yml before production!"
  ok
}

install_vault() {
  step "Starting Vault"
  docker compose -f modules/vault/docker-compose.yml up -d
  echo -e "   ${DIM}Vault UI: http://localhost:8200${NC}"
  echo -e "   ${DIM}Dev token: pegasus-vault-dev-token${NC}"
  warn "Running in dev mode — configure for production separately"
  ok
}

# --- Monitoring & DevEx ---

install_otel() {
  step "Starting OpenTelemetry + Jaeger"
  docker compose -f modules/otel/docker-compose.yml up -d
  echo -e "   ${DIM}Jaeger UI: http://localhost:16686${NC}"
  ok
}

install_sentry() {
  step "Installing Sentry"
  npm install @sentry/nextjs --quiet

  [[ ! -f sentry.client.config.ts ]] && cp modules/sentry/sentry.client.config.ts .
  [[ ! -f sentry.server.config.ts ]] && cp modules/sentry/sentry.server.config.ts .

  echo ""
  read -rp "   Enter your Sentry DSN (or press Enter to skip): " sentry_dsn
  if [[ -n "$sentry_dsn" ]]; then
    sed -i "s|^# SENTRY_DSN=.*|SENTRY_DSN=$sentry_dsn|" .env.local
    sed -i "s|^# NEXT_PUBLIC_SENTRY_DSN=.*|NEXT_PUBLIC_SENTRY_DSN=$sentry_dsn|" .env.local
  else
    sed -i 's/^# SENTRY_DSN=/SENTRY_DSN=/' .env.local
    warn "Set SENTRY_DSN in .env.local later"
  fi
  ok
}

install_nats() {
  step "Starting NATS"
  docker compose -f modules/nats/docker-compose.yml up -d
  echo -e "   ${DIM}NATS monitoring: http://localhost:8222${NC}"
  ok
}

install_github_actions() {
  step "Setting up GitHub Actions"
  mkdir -p .github/workflows
  cp modules/github-actions/ci.yml .github/workflows/ci.yml
  cp modules/github-actions/deploy.yml .github/workflows/deploy.yml
  echo -e "   ${DIM}CI + Deploy workflows added to .github/workflows/${NC}"
  echo -e "   ${DIM}Set these GitHub secrets: VPS_HOST, VPS_USER, VPS_SSH_KEY${NC}"
  ok
}

install_drizzle() {
  step "Installing Drizzle ORM"
  npm install drizzle-orm postgres --quiet
  npm install -D drizzle-kit --quiet
  [[ ! -f drizzle.config.ts ]] && cp modules/drizzle/drizzle.config.ts .
  if [[ ! -f lib/db/schema.ts ]]; then
    mkdir -p lib/db
    cp modules/drizzle/schema.template.ts lib/db/schema.ts
  fi
  ok
}

install_prisma() {
  step "Installing Prisma"
  npm install prisma @prisma/client --quiet
  if [[ ! -d prisma ]]; then
    mkdir -p prisma
    cp modules/prisma/schema.prisma prisma/schema.prisma
  fi
  ok
}

install_claude_code() {
  step "Installing Claude Code"
  npm install -g @anthropic-ai/claude-code --quiet
  echo ""
  echo -e "   ${DIM}Claude Code installed. Run 'claude' in the project directory.${NC}"
  echo -e "   ${DIM}It will use the CLAUDE.md file for full stack context.${NC}"
  echo -e "   ${DIM}Set ANTHROPIC_API_KEY in your shell: export ANTHROPIC_API_KEY=sk-...${NC}"
  ok
}

# ============================================================================
# PM2 ecosystem config
# ============================================================================
generate_ecosystem() {
  step "Generating PM2 ecosystem config"

  local apps='[
    {
      name: "next",
      script: "node_modules/.bin/next",
      args: "start",
      env: { PORT: 3000, NODE_ENV: "production" },
    },
    {
      name: "bifrost",
      script: "bash",
      args: "-c '\''npx -y @maximhq/bifrost'\''",
      autorestart: true, max_restarts: 5, restart_delay: 5000,
    },
    {
      name: "bifrost-proxy",
      script: "bash",
      args: "-c '\''socat TCP-LISTEN:8081,fork,reuseaddr TCP:127.0.0.1:8080'\''",
      autorestart: true, max_restarts: 5, restart_delay: 3000,
    },
    {
      name: "flowise",
      script: "bash",
      args: "-c '\''PORT=3001 npx flowise start'\''",
      autorestart: true, max_restarts: 5, restart_delay: 5000,
    }'

  # Docker-based services don't need PM2 — they use docker restart policies
  # Only add non-Docker services to PM2

  apps="$apps"$'\n  ]'

  cat > ecosystem.config.js << EOF
module.exports = {
  apps: $apps,
};
EOF

  ok
}

# ============================================================================
# Build & start
# ============================================================================
build_and_start() {
  step "Building Next.js for production"
  npm run build
  ok

  step "Starting all services with PM2"
  pm2 delete all 2>/dev/null || true
  pm2 start ecosystem.config.js
  pm2 save
  ok

  step "Configuring PM2 to start on boot"
  pm2 startup systemd -u root --hp /root 2>/dev/null || true
  pm2 save
  ok
}

# ============================================================================
# Firewall
# ============================================================================
setup_firewall() {
  step "Configuring firewall"

  if ! ufw status | grep -q "Status: active"; then
    ufw --force enable >/dev/null 2>&1
  fi

  ufw allow ssh >/dev/null 2>&1
  ufw allow 3000 >/dev/null 2>&1

  [[ $MOD_TRAEFIK -eq 1 ]] && { ufw allow 80 >/dev/null 2>&1; ufw allow 443 >/dev/null 2>&1; }

  ok
}

# ============================================================================
# Summary
# ============================================================================
show_summary() {
  local ip
  ip=$(hostname -I | awk '{print $1}')

  echo ""
  echo -e "${GREEN}${BOLD}================================================${NC}"
  echo -e "${GREEN}${BOLD}  Pegasus Core installed successfully!${NC}"
  echo -e "${GREEN}${BOLD}================================================${NC}"
  echo ""
  echo -e "  ${BOLD}Core Services:${NC}"
  echo -e "    Next.js      ${CYAN}http://$ip:3000${NC}"
  echo -e "    Bifrost      ${CYAN}http://$ip:8081${NC}  ${DIM}(proxied)${NC}"
  echo -e "    Flowise      ${CYAN}http://$ip:3001${NC}"
  echo ""

  local has_optional=0

  if [[ $MOD_REDIS -eq 1 || $MOD_QDRANT -eq 1 || $MOD_WEAVIATE -eq 1 || \
        $MOD_MINIO -eq 1 || $MOD_MEILISEARCH -eq 1 || $MOD_TEMPORAL -eq 1 || \
        $MOD_NATS -eq 1 || $MOD_AUTHELIA -eq 1 || $MOD_VAULT -eq 1 || \
        $MOD_OTEL -eq 1 || $MOD_SUPABASE_SELF -eq 1 ]]; then
    has_optional=1
    echo -e "  ${BOLD}Optional Services:${NC}"
    [[ $MOD_REDIS -eq 1 ]]         && echo -e "    Redis        ${CYAN}localhost:6379${NC}"
    [[ $MOD_MINIO -eq 1 ]]         && echo -e "    MinIO        ${CYAN}http://$ip:9001${NC}  ${DIM}(console)${NC}"
    [[ $MOD_MEILISEARCH -eq 1 ]]   && echo -e "    Meilisearch  ${CYAN}http://$ip:7700${NC}"
    [[ $MOD_QDRANT -eq 1 ]]        && echo -e "    Qdrant       ${CYAN}http://$ip:6333${NC}"
    [[ $MOD_WEAVIATE -eq 1 ]]      && echo -e "    Weaviate     ${CYAN}http://$ip:8085${NC}"
    [[ $MOD_TEMPORAL -eq 1 ]]      && echo -e "    Temporal     ${CYAN}http://$ip:8088${NC}  ${DIM}(UI)${NC}"
    [[ $MOD_NATS -eq 1 ]]          && echo -e "    NATS         ${CYAN}localhost:4222${NC}"
    [[ $MOD_AUTHELIA -eq 1 ]]      && echo -e "    Authelia     ${CYAN}http://$ip:9091${NC}"
    [[ $MOD_VAULT -eq 1 ]]         && echo -e "    Vault        ${CYAN}http://$ip:8200${NC}"
    [[ $MOD_OTEL -eq 1 ]]          && echo -e "    Jaeger       ${CYAN}http://$ip:16686${NC}"
    [[ $MOD_SUPABASE_SELF -eq 1 ]] && echo -e "    Supabase     ${CYAN}http://$ip:3100${NC}  ${DIM}(Studio)${NC}"
    [[ $MOD_TRAEFIK -eq 1 ]]       && echo -e "    Traefik      ${CYAN}https://$domain${NC}"
    echo ""
  fi

  echo -e "  ${BOLD}Next steps:${NC}"
  echo -e "    1. Open ${CYAN}http://$ip:3000${NC} in your browser"
  echo -e "    2. Complete the setup wizard (Supabase + admin account)"
  echo -e "    3. Start building!"
  echo ""
  echo -e "  ${BOLD}Commands:${NC}"
  echo -e "    ${DIM}pm2 status${NC}        — check services"
  echo -e "    ${DIM}pm2 logs${NC}          — view logs"
  echo -e "    ${DIM}pm2 restart all${NC}   — restart everything"
  [[ $has_optional -eq 1 ]] && echo -e "    ${DIM}docker ps${NC}         — check Docker containers"
  echo ""
}

# ============================================================================
# Main
# ============================================================================
main() {
  if [[ $EUID -ne 0 ]]; then
    fail "Please run as root: sudo ./install.sh"
  fi

  select_modules

  echo ""
  step "Installing Pegasus Core"
  echo -e "   Core: Next.js + Supabase + Bifrost + Flowise"
  [[ $MOD_COOLIFY -eq 1 ]]       && echo -e "       + Coolify"
  [[ $MOD_TRAEFIK -eq 1 ]]       && echo -e "       + Traefik"
  [[ $MOD_SUPABASE_SELF -eq 1 ]] && echo -e "       + Supabase (self-hosted)"
  [[ $MOD_REDIS -eq 1 ]]         && echo -e "       + Redis"
  [[ $MOD_MINIO -eq 1 ]]         && echo -e "       + MinIO"
  [[ $MOD_MEILISEARCH -eq 1 ]]   && echo -e "       + Meilisearch"
  [[ $MOD_QDRANT -eq 1 ]]        && echo -e "       + Qdrant"
  [[ $MOD_WEAVIATE -eq 1 ]]      && echo -e "       + Weaviate"
  [[ $MOD_TEMPORAL -eq 1 ]]      && echo -e "       + Temporal"
  [[ $MOD_BULLMQ -eq 1 ]]        && echo -e "       + BullMQ"
  [[ $MOD_GPU -eq 1 ]]           && echo -e "       + GPU Nodes"
  [[ $MOD_AUTHELIA -eq 1 ]]      && echo -e "       + Authelia"
  [[ $MOD_VAULT -eq 1 ]]         && echo -e "       + Vault"
  [[ $MOD_OTEL -eq 1 ]]          && echo -e "       + OpenTelemetry"
  [[ $MOD_SENTRY -eq 1 ]]        && echo -e "       + Sentry"
  [[ $MOD_NATS -eq 1 ]]          && echo -e "       + NATS"
  [[ $MOD_GITHUB_ACTIONS -eq 1 ]]&& echo -e "       + GitHub Actions"
  [[ $MOD_DRIZZLE -eq 1 ]]       && echo -e "       + Drizzle"
  [[ $MOD_PRISMA -eq 1 ]]        && echo -e "       + Prisma"
  [[ $MOD_CLAUDE_CODE -eq 1 ]]   && echo -e "       + Claude Code"
  echo ""

  install_system_deps
  install_core

  # Infrastructure
  [[ $MOD_COOLIFY -eq 1 ]]       && install_coolify
  [[ $MOD_TRAEFIK -eq 1 ]]       && install_traefik
  [[ $MOD_SUPABASE_SELF -eq 1 ]] && install_supabase_self

  # Data & Storage
  [[ $MOD_REDIS -eq 1 ]]         && install_redis
  [[ $MOD_MINIO -eq 1 ]]         && install_minio
  [[ $MOD_MEILISEARCH -eq 1 ]]   && install_meilisearch

  # AI Layer
  [[ $MOD_QDRANT -eq 1 ]]        && install_qdrant
  [[ $MOD_WEAVIATE -eq 1 ]]      && install_weaviate
  [[ $MOD_TEMPORAL -eq 1 ]]      && install_temporal
  [[ $MOD_BULLMQ -eq 1 ]]        && install_bullmq
  [[ $MOD_GPU -eq 1 ]]           && install_gpu

  # Security
  [[ $MOD_AUTHELIA -eq 1 ]]      && install_authelia
  [[ $MOD_VAULT -eq 1 ]]         && install_vault

  # Monitoring & DevEx
  [[ $MOD_OTEL -eq 1 ]]          && install_otel
  [[ $MOD_SENTRY -eq 1 ]]        && install_sentry
  [[ $MOD_NATS -eq 1 ]]          && install_nats
  [[ $MOD_GITHUB_ACTIONS -eq 1 ]]&& install_github_actions
  [[ $MOD_DRIZZLE -eq 1 ]]       && install_drizzle
  [[ $MOD_PRISMA -eq 1 ]]        && install_prisma
  [[ $MOD_CLAUDE_CODE -eq 1 ]]   && install_claude_code

  generate_ecosystem
  build_and_start
  setup_firewall
  show_summary
}

main "$@"
