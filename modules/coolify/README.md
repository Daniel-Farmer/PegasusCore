# Coolify

Self-hosted PaaS for deploying and managing all your services.

## Install

The installer runs the official Coolify install script:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

## Access
- Dashboard: http://localhost:8000

## Notes
- Coolify manages its own Docker containers and Traefik instance
- If you also install the Traefik module, Coolify's built-in Traefik will be used instead
- See https://coolify.io/docs for configuration
