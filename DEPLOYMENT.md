# Deploying caracarriers on Coolify

This guide covers deploying the app to a self-hosted [Coolify](https://coolify.io) instance from the GitHub repository.

---

## Prerequisites

- A running Coolify instance (v4+)
- A GitHub repository containing this code
- A Supabase project (auth + database)
- Stripe, Twilio, Resend, and Documenso accounts with the relevant API keys

---

## 1. Connect the GitHub Repository

1. In Coolify, go to **Sources** and add your GitHub account (or organisation) via the GitHub App integration.
2. Navigate to **Projects** → **New Project** → **New Resource** → **Application**.
3. Select **GitHub** as the source and choose the `caracarriers` repository and the `main` branch.

---

## 2. Choose a Build Method

Coolify supports two build methods for this app. Pick one.

### Option A — Dockerfile (recommended)

- In the application settings, set **Build Method** to **Dockerfile**.
- Coolify will detect the `Dockerfile` in the repository root automatically.
- The multi-stage build produces a lean `node:20-alpine` image using Next.js standalone output.

### Option B — Nixpacks

- In the application settings, set **Build Method** to **Nixpacks**.
- Coolify will read `nixpacks.toml` from the repository root.
- Nixpacks installs Node 20, runs `npm ci`, then `npm run build`, and starts with `npm start`.

> **Note:** The Dockerfile build produces a smaller, more reproducible image and is preferred for production.

---

## 3. Environment Variables

In the application's **Environment** tab in Coolify, add the following variables. Use `.env.example` as your reference — it contains descriptions for every key.

### Required for the app to start

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of this deployment, e.g. `https://tms.example.com` |
| `NEXTAUTH_SECRET` | Random 32-byte hex secret (`openssl rand -hex 32`) |
| `NEXTAUTH_URL` | Same value as `NEXT_PUBLIC_APP_URL` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret |
| `DATABASE_URL` | Pooled Postgres connection string (port 6543) |
| `DATABASE_URL_DIRECT` | Direct Postgres connection string (port 5432, used for migrations) |

### Stripe

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRICE_ID_STARTER` | Price ID for Starter plan |
| `STRIPE_PRICE_ID_PRO` | Price ID for Pro plan |
| `STRIPE_PRICE_ID_ENTERPRISE` | Price ID for Enterprise plan |

### Twilio

| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio sending number in E.164 format |

### Resend

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender email address |

### Documenso

| Variable | Description |
|---|---|
| `DOCUMENSO_API_URL` | Documenso API base URL |
| `DOCUMENSO_API_TOKEN` | Documenso API token |
| `DOCUMENSO_WEBHOOK_SECRET` | Documenso webhook secret (if used) |

---

## 4. Health Check

Coolify can monitor container health via HTTP. In the application's **Health Check** settings:

- **Path:** `/api/health`
- **Port:** `3000`
- **Protocol:** `HTTP`
- **Interval:** `30s`
- **Timeout:** `5s`
- **Retries:** `3`

The endpoint returns `{ "status": "ok", "timestamp": "..." }` with HTTP 200 when the app is running.

---

## 5. Prisma Migrations (Pre-deploy Hook)

Run database migrations before each deploy so the schema is always up to date before traffic is switched.

In the application's **Pre-deploy Command** field (under **Advanced** or **Hooks** depending on your Coolify version), set:

```sh
npx prisma migrate deploy
```

This command uses `DATABASE_URL_DIRECT` (the non-pooled connection) which Prisma requires for migration commands. Make sure that variable is set in the Environment tab.

> **Important:** `prisma migrate deploy` applies only pending migrations. It does not reset data. Always test migrations against a staging environment before running against production.

---

## 6. Port Configuration

- The container exposes port **3000**.
- Coolify's reverse proxy (Caddy or Traefik) will forward HTTPS traffic to that port automatically.
- No additional port mapping is required.

---

## 7. Deploying

1. Click **Deploy** (or push to the `main` branch if auto-deploy is enabled).
2. Coolify will clone the repo, run the build, start the container, run the pre-deploy hook, and switch traffic.
3. Watch the build logs in the Coolify UI for any errors.
4. Once the health check passes, the deployment is live.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Build fails with `prisma: command not found` | Prisma is a dev dependency — ensure `npm ci` installs all deps before the build step. The Dockerfile `deps` stage handles this. |
| App crashes on start with "missing env var" | A required environment variable is not set in Coolify. Check the Environment tab. |
| Health check failing | The container is still starting. Increase the initial delay or retry count in Coolify health check settings. |
| Migrations fail with "connection refused" | `DATABASE_URL_DIRECT` is not set or points to the pooled port (6543). Migrations must use port 5432 (direct connection). |
| Static assets return 404 | The Dockerfile copies `.next/static` into the standalone directory. If you customised the Dockerfile, verify that `COPY` step is present. |
