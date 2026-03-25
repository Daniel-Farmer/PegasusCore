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
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Module toggles (core always on)
MOD_REDIS=0
MOD_QDRANT=0
MOD_BULLMQ=0
MOD_SENTRY=0
MOD_TRAEFIK=0

# Track what needs Docker
needs_docker() {
  [[ $MOD_REDIS -eq 1 || $MOD_QDRANT -eq 1 || $MOD_TRAEFIK -eq 1 ]]
}

# ============================================================================
# Interactive menu
# ============================================================================
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
  echo -e "${BOLD}  Installer${NC}"
  echo ""
  echo -e "  ${GREEN}Core (always installed):${NC}"
  echo -e "    ${GREEN}[x]${NC} Node.js 20 + PM2"
  echo -e "    ${GREEN}[x]${NC} Next.js app"
  echo -e "    ${GREEN}[x]${NC} Supabase (cloud)"
  echo -e "    ${GREEN}[x]${NC} Bifrost (AI gateway)"
  echo -e "    ${GREEN}[x]${NC} Flowise (agent builder)"
  echo ""
  echo -e "  ${YELLOW}Optional modules (enter number to toggle):${NC}"
  echo ""

  local r_mark=" "; [[ $MOD_REDIS -eq 1 ]] && r_mark="x"
  local q_mark=" "; [[ $MOD_QDRANT -eq 1 ]] && q_mark="x"
  local b_mark=" "; [[ $MOD_BULLMQ -eq 1 ]] && b_mark="x"
  local s_mark=" "; [[ $MOD_SENTRY -eq 1 ]] && s_mark="x"
  local t_mark=" "; [[ $MOD_TRAEFIK -eq 1 ]] && t_mark="x"

  echo -e "    ${BOLD}1)${NC} [$r_mark] Redis         ${DIM}— caching layer${NC}"
  echo -e "    ${BOLD}2)${NC} [$q_mark] Qdrant        ${DIM}— vector DB (alternative to pgvector)${NC}"
  echo -e "    ${BOLD}3)${NC} [$b_mark] BullMQ        ${DIM}— job queues (auto-enables Redis)${NC}"
  echo -e "    ${BOLD}4)${NC} [$s_mark] Sentry        ${DIM}— error tracking${NC}"
  echo -e "    ${BOLD}5)${NC} [$t_mark] Traefik       ${DIM}— reverse proxy + auto SSL${NC}"
  echo ""
  echo -e "    ${BOLD}a)${NC} Select all"
  echo -e "    ${BOLD}n)${NC} Select none"
  echo ""
  echo -e "  Press ${BOLD}Enter${NC} when ready to install, or ${BOLD}q${NC} to quit."
  echo ""
}

select_modules() {
  while true; do
    show_menu
    read -rsn1 key
    case "$key" in
      1) MOD_REDIS=$(( 1 - MOD_REDIS )) ;;
      2) MOD_QDRANT=$(( 1 - MOD_QDRANT )) ;;
      3)
        MOD_BULLMQ=$(( 1 - MOD_BULLMQ ))
        [[ $MOD_BULLMQ -eq 1 ]] && MOD_REDIS=1
        ;;
      4) MOD_SENTRY=$(( 1 - MOD_SENTRY )) ;;
      5) MOD_TRAEFIK=$(( 1 - MOD_TRAEFIK )) ;;
      a|A) MOD_REDIS=1; MOD_QDRANT=1; MOD_BULLMQ=1; MOD_SENTRY=1; MOD_TRAEFIK=1 ;;
      n|N) MOD_REDIS=0; MOD_QDRANT=0; MOD_BULLMQ=0; MOD_SENTRY=0; MOD_TRAEFIK=0 ;;
      q|Q) echo "Aborted."; exit 0 ;;
      "") break ;;  # Enter pressed
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

  # Copy env file if not exists
  if [[ ! -f .env.local ]]; then
    step "Creating .env.local from example"
    cp .env.local.example .env.local
    ok
  fi
}

# ============================================================================
# Module installers
# ============================================================================
install_redis() {
  step "Starting Redis"
  docker compose -f modules/redis/docker-compose.yml up -d
  # Uncomment REDIS_URL in .env.local
  sed -i 's/^# REDIS_URL/REDIS_URL/' .env.local
  ok
}

install_qdrant() {
  step "Starting Qdrant"
  docker compose -f modules/qdrant/docker-compose.yml up -d
  # Uncomment QDRANT_URL in .env.local
  sed -i 's/^# QDRANT_URL/QDRANT_URL/' .env.local
  ok
}

install_bullmq() {
  step "Installing BullMQ"
  npm install bullmq --quiet
  # Copy templates if not already there
  if [[ ! -d lib/bullmq ]]; then
    mkdir -p lib/bullmq
    cp modules/bullmq/worker.template.ts lib/bullmq/worker.ts
    cp modules/bullmq/queue.template.ts lib/bullmq/queue.ts
  fi
  ok
}

install_sentry() {
  step "Installing Sentry"
  npm install @sentry/nextjs --quiet

  # Copy config files if not already there
  [[ ! -f sentry.client.config.ts ]] && cp modules/sentry/sentry.client.config.ts .
  [[ ! -f sentry.server.config.ts ]] && cp modules/sentry/sentry.server.config.ts .

  # Prompt for DSN
  echo ""
  read -rp "   Enter your Sentry DSN (or press Enter to skip): " sentry_dsn
  if [[ -n "$sentry_dsn" ]]; then
    sed -i "s|^# SENTRY_DSN=.*|SENTRY_DSN=$sentry_dsn|" .env.local
  else
    sed -i 's/^# SENTRY_DSN=/SENTRY_DSN=/' .env.local
    warn "Set SENTRY_DSN in .env.local later"
  fi
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

  # Create acme storage
  mkdir -p modules/traefik/acme
  touch modules/traefik/acme/acme.json
  chmod 600 modules/traefik/acme/acme.json

  # Substitute domain and email in configs
  sed -i "s/APP_DOMAIN/$domain/g" modules/traefik/dynamic.yml
  sed -i "s/ACME_EMAIL/$email/g" modules/traefik/traefik.yml

  docker compose -f modules/traefik/docker-compose.yml up -d
  ok
}

# ============================================================================
# PM2 ecosystem config
# ============================================================================
generate_ecosystem() {
  step "Generating PM2 ecosystem config"

  cat > ecosystem.config.js << 'PMEOF'
module.exports = {
  apps: [
    {
      name: "next",
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
    {
      name: "bifrost",
      script: "bash",
      args: "-c 'npx -y @maximhq/bifrost'",
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
    },
    {
      name: "bifrost-proxy",
      script: "bash",
      args: "-c 'socat TCP-LISTEN:8081,fork,reuseaddr TCP:127.0.0.1:8080'",
      autorestart: true,
      max_restarts: 5,
      restart_delay: 3000,
    },
    {
      name: "flowise",
      script: "bash",
      args: "-c 'PORT=3001 npx flowise start'",
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
    },
PMEOF

  # Add optional module entries
  if [[ $MOD_REDIS -eq 1 ]]; then
    cat >> ecosystem.config.js << 'PMEOF'
    {
      name: "redis",
      script: "bash",
      args: "-c 'docker compose -f modules/redis/docker-compose.yml up'",
      autorestart: true,
      max_restarts: 3,
      restart_delay: 5000,
    },
PMEOF
  fi

  if [[ $MOD_QDRANT -eq 1 ]]; then
    cat >> ecosystem.config.js << 'PMEOF'
    {
      name: "qdrant",
      script: "bash",
      args: "-c 'docker compose -f modules/qdrant/docker-compose.yml up'",
      autorestart: true,
      max_restarts: 3,
      restart_delay: 5000,
    },
PMEOF
  fi

  # Close the config
  cat >> ecosystem.config.js << 'PMEOF'
  ],
};
PMEOF

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

  # Enable UFW if not already
  if ! ufw status | grep -q "Status: active"; then
    ufw --force enable >/dev/null 2>&1
  fi

  ufw allow ssh >/dev/null 2>&1
  ufw allow 3000 >/dev/null 2>&1   # Next.js

  if [[ $MOD_TRAEFIK -eq 1 ]]; then
    ufw allow 80 >/dev/null 2>&1
    ufw allow 443 >/dev/null 2>&1
  fi

  ok
}

# ============================================================================
# Summary
# ============================================================================
show_summary() {
  local ip
  ip=$(hostname -I | awk '{print $1}')

  echo ""
  echo -e "${GREEN}${BOLD}============================================${NC}"
  echo -e "${GREEN}${BOLD}  Pegasus Core installed successfully!${NC}"
  echo -e "${GREEN}${BOLD}============================================${NC}"
  echo ""
  echo -e "  ${BOLD}Services:${NC}"
  echo -e "    Next.js     ${CYAN}http://$ip:3000${NC}"
  echo -e "    Bifrost     ${CYAN}http://$ip:8081${NC}  ${DIM}(proxied)${NC}"
  echo -e "    Flowise     ${CYAN}http://$ip:3001${NC}"

  [[ $MOD_REDIS -eq 1 ]]   && echo -e "    Redis       ${CYAN}localhost:6379${NC}"
  [[ $MOD_QDRANT -eq 1 ]]  && echo -e "    Qdrant      ${CYAN}http://$ip:6333${NC}"
  [[ $MOD_TRAEFIK -eq 1 ]] && echo -e "    Traefik     ${CYAN}https://$domain${NC}"

  echo ""
  echo -e "  ${BOLD}Next steps:${NC}"
  echo -e "    1. Open ${CYAN}http://$ip:3000${NC} in your browser"
  echo -e "    2. Complete the setup wizard (Supabase + admin account)"
  echo -e "    3. Start building!"
  echo ""
  echo -e "  ${BOLD}Useful commands:${NC}"
  echo -e "    ${DIM}pm2 status${NC}       — check all services"
  echo -e "    ${DIM}pm2 logs${NC}         — view logs"
  echo -e "    ${DIM}pm2 restart all${NC}  — restart everything"
  echo ""
}

# ============================================================================
# Main
# ============================================================================
main() {
  # Must run as root
  if [[ $EUID -ne 0 ]]; then
    fail "Please run as root: sudo ./install.sh"
  fi

  # Interactive module selection
  select_modules

  # Show what we're installing
  echo ""
  step "Installing Pegasus Core"
  echo -e "   Modules: Core (Next.js + Supabase + Bifrost + Flowise)"
  [[ $MOD_REDIS -eq 1 ]]   && echo -e "          + Redis"
  [[ $MOD_QDRANT -eq 1 ]]  && echo -e "          + Qdrant"
  [[ $MOD_BULLMQ -eq 1 ]]  && echo -e "          + BullMQ"
  [[ $MOD_SENTRY -eq 1 ]]  && echo -e "          + Sentry"
  [[ $MOD_TRAEFIK -eq 1 ]] && echo -e "          + Traefik"
  echo ""

  install_system_deps
  install_core

  [[ $MOD_REDIS -eq 1 ]]   && install_redis
  [[ $MOD_QDRANT -eq 1 ]]  && install_qdrant
  [[ $MOD_BULLMQ -eq 1 ]]  && install_bullmq
  [[ $MOD_SENTRY -eq 1 ]]  && install_sentry
  [[ $MOD_TRAEFIK -eq 1 ]] && install_traefik

  generate_ecosystem
  build_and_start
  setup_firewall
  show_summary
}

main "$@"
