# Hostproof — Production Guide

This monorepo contains two production apps:

| App | Framework | Default port |
|-----|-----------|-------------|
| `apps/api` | AdonisJS v7 | `3333` |
| `apps/web` | Next.js 16 | `3000` |

---

## Prerequisites

| Tool | Min version | Install |
|------|------------|---------|
| Node.js | 20 LTS | https://nodejs.org |
| pnpm | 9+ | `npm i -g pnpm` |
| PM2 | 5+ | `npm i -g pm2` |
| PostgreSQL | 14+ | — |

---

## Quick start

```bash
# 1. Clone and enter the repo
git clone <repo-url> hostproof && cd hostproof

# 2. Create the root-level env files from the templates
cp .env.api.example .env.api
cp .env.web.example .env.web

# 3. Fill them in
$EDITOR .env.api    # APP_KEY, DB_*, SMTP_*, GOOGLE_API_KEY …
$EDITOR .env.web    # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL

# 4. (Optional) custom ports — defaults are API:3333 / Web:3000
export HOSTPROOF_API_PORT=3333
export HOSTPROOF_WEB_PORT=3000

# 5. Deploy
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Copy `.env.api` → `apps/api/.env` and `apps/api/build/.env`
2. Copy `.env.web` → `apps/web/.env.production.local` *(before build, so `NEXT_PUBLIC_*` vars are baked in)*
3. Install deps, build both apps, run DB migrations, start PM2.

---

## Env files

All production secrets live at the **repo root** and are gitignored:

```
.env.api          ← API secrets (DB, SMTP, APP_KEY …)
.env.web          ← Web public vars (API/app URLs)
.env.api.example  ← committed template
.env.web.example  ← committed template
```

The deploy script distributes them automatically:

| Root file | Copied to |
|-----------|-----------|
| `.env.api` | `apps/api/.env` + `apps/api/build/.env` |
| `.env.web` | `apps/web/.env.production.local` |

### `.env.api` reference

```dotenv
TZ=UTC
PORT=3333          # overridden by HOSTPROOF_API_PORT in PM2
HOST=0.0.0.0
NODE_ENV=production

LOG_LEVEL=info
APP_KEY=           # generate: node ace generate:key
APP_URL=https://api.yourdomain.com

SESSION_DRIVER=cookie

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=hostproof
DB_PASSWORD=
DB_DATABASE=hostproof

MAIL_MAILER=smtp
MAIL_FROM_NAME=Hostproof
MAIL_FROM_ADDRESS=no-reply@yourdomain.com
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USERNAME=
SMTP_PASSWORD=

FRONTEND_APP_URL=https://app.yourdomain.com

GOOGLE_API_KEY=
```

### `.env.web` reference

```dotenv
# Baked into the client bundle at build time
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

---

## Manual step-by-step

If you prefer to run each step yourself:

```bash
# Distribute env files
cp .env.api apps/api/.env
cp .env.web apps/web/.env.production.local

# Install deps
pnpm install --frozen-lockfile

# Build API
pnpm build:api
# → apps/api/build/

# Copy .env into build dir (AdonisJS reads from cwd)
cp .env.api apps/api/build/.env

# Install prod-only deps in build dir
cd apps/api/build && pnpm install --prod && cd ../../..

# Run migrations
cd apps/api/build && node ace migration:run --force && cd ../../..

# Build web (NEXT_PUBLIC_* already set by env.production.local above)
pnpm build:web
# → apps/web/.next/

# Start PM2
mkdir -p logs
export HOSTPROOF_API_PORT=3333
export HOSTPROOF_WEB_PORT=3000
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup   # follow the printed command to enable auto-start on reboot
```

---

## Re-deploying after code changes

```bash
git pull
./deploy.sh
# Existing PM2 processes are reloaded with zero downtime.
```

To skip rebuilding when only env vars changed:

```bash
./deploy.sh --skip-build --skip-migrate
```

---

## PM2 cheat sheet

```bash
pm2 list                                        # process status
pm2 logs                                        # all logs (live)
pm2 logs hostproof-api                          # API logs only
pm2 logs hostproof-web                          # web logs only
pm2 reload ecosystem.config.cjs --env production  # zero-downtime reload
pm2 restart hostproof-api                       # hard restart one app
pm2 stop ecosystem.config.cjs                   # stop all
pm2 monit                                       # CPU / memory dashboard
```

Logs are written to `logs/` at the repo root:

```
logs/api-out.log   logs/api-err.log
logs/web-out.log   logs/web-err.log
```

---

## Reverse proxy (Nginx example)

```nginx
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

# Web
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

**`No API env file found`**
Create `.env.api` from the template: `cp .env.api.example .env.api`

**API won't start — "Missing environment variable"**
`apps/api/build/.env` is missing or incomplete. Re-run `./deploy.sh` so it is copied fresh from `.env.api`.

**Web returns 500 — API unreachable**
Check `NEXT_PUBLIC_API_URL` in `.env.web` and rebuild: `./deploy.sh`

**`NEXT_PUBLIC_*` vars have wrong value in production**
These are baked in at build time. Update `.env.web` and re-run `./deploy.sh` (full rebuild needed).

**Database migration failed**
Check `DB_*` values in `.env.api` and ensure the PostgreSQL user has CREATE/ALTER TABLE privileges.

**Port already in use**
Change via `--api-port` / `--web-port` flags or the `HOSTPROOF_API_PORT` / `HOSTPROOF_WEB_PORT` env vars.
