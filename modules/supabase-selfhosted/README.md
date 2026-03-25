# Supabase Self-Hosted

This module sets up a self-hosted Supabase instance using the official Docker setup.

## Install

The installer clones the official Supabase Docker repo and starts it:

```bash
git clone --depth 1 https://github.com/supabase/supabase /opt/supabase
cd /opt/supabase/docker
cp .env.example .env
docker compose up -d
```

## Ports
- Studio: http://localhost:3100
- API: http://localhost:8000
- Database: localhost:5432

## Notes
- Update `/opt/supabase/docker/.env` with secure passwords before production use
- The installer will generate random secrets automatically
