# Hostproof — Production Guide

This monorepo contains two production apps:

| App | Framework | Default port |
|-----|-----------|-------------|
| `apps/api` | AdonisJS v7 | `3333` |
| `apps/web` | Next.js 16 | `3000` |

---

## Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| Node.js | 20 LTS | https://nodejs.org |
| pnpm | 9+ | `npm i -g pnpm` |
| PM2 | 5+ | `npm i -g pm2` |
| PostgreSQL | 14+ | — |

---

## Quick start

```bash
# 1. Clone and enter the repo
git clone <repo-url> hostproof && cd hostproof

# 2. Copy and fill in the API env file
cp apps/api/.env.example apps/api/.env
$EDITOR apps/api/.env        # set APP_KEY, DB_*, SMTP_*, etc.

# 3. (Optional) Set custom ports — defaults are 3333 / 3000
export HOSTPROOF_API_PORT=3333
export HOSTPROOF_WEB_PORT=3000

# 4. Run the deploy script
chmod +x deploy.sh
./deploy.sh

# The script builds both apps, runs DB migrations, and starts PM2.
```

---

## Environment variables

### `apps/api/.env` (required)

```dotenv
TZ=UTC
PORT=3333                       # overridden by HOSTPROOF_API_PORT in PM2
HOST=0.0.0.0
NODE_ENV=production

LOG_LEVEL=info
APP_KEY=<generate with: node ace generate:key>
APP_URL=https://api.yourdomain.com

SESSION_DRIVER=cookie

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=hostproof
DB_PASSWORD=<strong-password>
DB_DATABASE=hostproof

SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USERNAME=you@yourdomain.com
SMTP_PASSWORD=<smtp-password>

MAIL_MAILER=smtp
MAIL_FROM_NAME=Hostproof
MAIL_FROM_ADDRESS=no-reply@yourdomain.com

FRONTEND_APP_URL=https://app.yourdomain.com

GOOGLE_API_KEY=<your-google-genai-key>
```

### `apps/web` environment (optional)

Pass via shell before running `deploy.sh`, or add to the `env_production` block in `ecosystem.config.cjs`:

```bash
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
export NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

---

## Manual step-by-step

If you prefer to run each step yourself instead of using `deploy.sh`:

```bash
# 1. Install all dependencies
pnpm install --frozen-lockfile

# 2. Build the API
pnpm build:api
# Output: apps/api/build/

# 3. Install production-only deps inside the build folder
cd apps/api/build
pnpm install --prod
cd ../../..

# 4. Copy the API .env into the build folder
cp apps/api/.env apps/api/build/.env

# 5. Run database migrations
cd apps/api/build
node ace migration:run --force
cd ../../..

# 6. Build the web app
pnpm build:web
# Output: apps/web/.next/

# 7. Create the log directory
mkdir -p logs

# 8. Start (or reload) with PM2
export HOSTPROOF_API_PORT=3333
export HOSTPROOF_WEB_PORT=3000
pm2 start ecosystem.config.cjs --env production

# 9. Save the PM2 process list for auto-restart on reboot
pm2 save
pm2 startup    # follow the printed command to enable systemd/init integration
```

---

## PM2 cheat sheet

```bash
# View running processes
pm2 list

# Real-time logs (both apps)
pm2 logs

# Logs for a specific app
pm2 logs hostproof-api
pm2 logs hostproof-web

# Zero-downtime reload (after a new build)
pm2 reload ecosystem.config.cjs --env production

# Restart a single app
pm2 restart hostproof-api

# Stop everything
pm2 stop ecosystem.config.cjs

# Delete from PM2 registry
pm2 delete ecosystem.config.cjs

# Monitor CPU / memory
pm2 monit
```

Log files are written to the `logs/` directory at the repo root:

```
logs/
  api-out.log
  api-err.log
  web-out.log
  web-err.log
```

---

## Re-deploying after code changes

```bash
# Pull latest code
git pull

# Re-run the deploy script (builds + migrates + reloads PM2)
./deploy.sh
```

Or manually:

```bash
pnpm install --frozen-lockfile
pnpm build:api
pnpm build:web
cp apps/api/.env apps/api/build/.env
cd apps/api/build && pnpm install --prod && node ace migration:run --force && cd ../../..
pm2 reload ecosystem.config.cjs --env production
```

---

## Reverse proxy (Nginx example)

Run Nginx in front of both apps to handle TLS and clean URLs:

```nginx
# /etc/nginx/sites-available/hostproof

# API
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web app
server {
    listen 443 ssl;
    server_name app.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

**API won't start — "Missing environment variable"**  
Make sure `apps/api/build/.env` exists and contains all required keys. The deploy script copies it automatically; if you built manually, run `cp apps/api/.env apps/api/build/.env`.

**Web app returns 500 — API unreachable**  
Check `NEXT_PUBLIC_API_URL` points to the correct API address and that the API is running (`pm2 list`).

**Database migration failed**  
Verify the `DB_*` variables in `apps/api/build/.env` match your PostgreSQL instance and that the user has CREATE/ALTER TABLE privileges.

**Port already in use**  
Change the port via `HOSTPROOF_API_PORT` / `HOSTPROOF_WEB_PORT` before starting, or kill the conflicting process with `lsof -ti:<port> | xargs kill`.
