#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Pegasus Core Installer
# One script. Five services. Everything just works.
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

# ============================================================================
# Logging helpers
# ============================================================================
step() { echo -e "\n${CYAN}${BOLD}=> $1${NC}"; }
ok()   { echo -e "   ${GREEN}done${NC}"; }
warn() { echo -e "   ${YELLOW}$1${NC}"; }
fail() { echo -e "   ${RED}$1${NC}"; exit 1; }

# ============================================================================
# Banner
# ============================================================================
show_banner() {
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
  echo -e "  This will install and configure:"
  echo ""
  echo -e "    ${GREEN}[x]${NC} Node.js 20 + PM2      ${DIM}— runtime + process manager${NC}"
  echo -e "    ${GREEN}[x]${NC} Docker                 ${DIM}— container runtime${NC}"
  echo -e "    ${GREEN}[x]${NC} Next.js                ${DIM}— app framework${NC}"
  echo -e "    ${GREEN}[x]${NC} Supabase (self-hosted) ${DIM}— auth, DB, storage, vectors${NC}"
  echo -e "    ${GREEN}[x]${NC} Coolify                ${DIM}— deployment PaaS${NC}"
  echo -e "    ${GREEN}[x]${NC} Bifrost                ${DIM}— AI gateway${NC}"
  echo -e "    ${GREEN}[x]${NC} Flowise                ${DIM}— visual agent builder${NC}"
  echo ""
  echo -e "  ${DIM}Optional modules (Redis, Qdrant, Sentry, etc.) can be${NC}"
  echo -e "  ${DIM}added later from the modules/ directory.${NC}"
  echo ""
  read -rp "  Press Enter to start, or q to quit: " confirm
  [[ "$confirm" == "q" || "$confirm" == "Q" ]] && { echo "Aborted."; exit 0; }
}

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

  # Docker
  if command -v docker &>/dev/null; then
    step "Docker already installed"
  else
    step "Installing Docker"
    curl -fsSL https://get.docker.com | sh >/dev/null 2>&1
    systemctl enable docker --now
    ok
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
install_app() {
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
# Supabase self-hosted
# ============================================================================
install_supabase() {
  step "Installing Supabase (self-hosted)"
  if [[ -d /opt/supabase ]]; then
    warn "Supabase already installed at /opt/supabase"
  else
    git clone --depth 1 https://github.com/supabase/supabase /opt/supabase
    cd /opt/supabase/docker
    cp .env.example .env

    # Generate random secrets
    local jwt_secret anon_key service_key
    jwt_secret=$(openssl rand -hex 32)
    sed -i "s/super-secret-jwt-token-with-at-least-32-characters-long/$jwt_secret/g" .env
    sed -i "s/this_password_is_insecure_and_should_be_updated/$(openssl rand -hex 16)/g" .env

    docker compose up -d
    cd "$SCRIPT_DIR"
  fi

  # Get the local Supabase URL and keys
  local sb_url="http://localhost:8000"

  # Wait for Supabase to be ready
  step "Waiting for Supabase to start"
  local retries=30
  while [[ $retries -gt 0 ]]; do
    if curl -sf "$sb_url/rest/v1/" -H "apikey: placeholder" >/dev/null 2>&1 || \
       curl -sf "$sb_url" >/dev/null 2>&1; then
      break
    fi
    sleep 2
    retries=$((retries - 1))
  done

  if [[ $retries -eq 0 ]]; then
    warn "Supabase may still be starting — check 'docker compose -f /opt/supabase/docker/docker-compose.yml logs'"
  else
    ok
  fi

  # Update .env.local with local Supabase URL
  local ip
  ip=$(hostname -I | awk '{print $1}')
  sed -i "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=http://$ip:8000|" .env.local
  step "Supabase URL set to http://$ip:8000"
}

# ============================================================================
# Coolify
# ============================================================================
install_coolify() {
  step "Installing Coolify"
  if curl -sf http://localhost:8000 >/dev/null 2>&1 && command -v coolify &>/dev/null; then
    warn "Coolify already installed"
  else
    curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
  fi
  ok
}

# ============================================================================
# Build & PM2
# ============================================================================
generate_ecosystem() {
  step "Generating PM2 ecosystem config"

  cat > ecosystem.config.js << 'EOF'
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
  ],
};
EOF

  ok
}

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
  ufw allow 3000 >/dev/null 2>&1    # Next.js
  ufw allow 3001 >/dev/null 2>&1    # Flowise
  ufw allow 3100 >/dev/null 2>&1    # Supabase Studio
  ufw allow 8000 >/dev/null 2>&1    # Supabase API / Coolify
  ufw allow 8081 >/dev/null 2>&1    # Bifrost (proxied)

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
  echo -e "  ${BOLD}Services:${NC}"
  echo -e "    Next.js      ${CYAN}http://$ip:3000${NC}"
  echo -e "    Supabase     ${CYAN}http://$ip:3100${NC}  ${DIM}(Studio)${NC}"
  echo -e "    Supabase API ${CYAN}http://$ip:8000${NC}"
  echo -e "    Coolify      ${CYAN}http://$ip:8000${NC}"
  echo -e "    Bifrost      ${CYAN}http://$ip:8081${NC}"
  echo -e "    Flowise      ${CYAN}http://$ip:3001${NC}"
  echo ""
  echo -e "  ${BOLD}Next steps:${NC}"
  echo -e "    1. Open ${CYAN}http://$ip:3000${NC} in your browser"
  echo -e "    2. Complete the setup wizard"
  echo -e "    3. Start building!"
  echo ""
  echo -e "  ${BOLD}Commands:${NC}"
  echo -e "    ${DIM}pm2 status${NC}        — check PM2 services"
  echo -e "    ${DIM}pm2 logs${NC}          — view logs"
  echo -e "    ${DIM}pm2 restart all${NC}   — restart everything"
  echo -e "    ${DIM}docker ps${NC}         — check Docker containers"
  echo ""
  echo -e "  ${BOLD}Optional modules:${NC}"
  echo -e "    ${DIM}See modules/ directory for Redis, Qdrant, Sentry, etc.${NC}"
  echo ""
}

# ============================================================================
# Main
# ============================================================================
main() {
  if [[ $EUID -ne 0 ]]; then
    fail "Please run as root: sudo ./install.sh"
  fi

  show_banner
  install_system_deps
  install_app
  install_supabase
  install_coolify
  generate_ecosystem
  build_and_start
  setup_firewall
  show_summary
}

main "$@"
