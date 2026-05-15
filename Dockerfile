# syntax=docker/dockerfile:1

# ────────────────────────────────────────────────────────────
# Stage 1: deps — install production + dev dependencies
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# to understand why libc6-compat may be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy lockfiles first for layer-cache efficiency
COPY package.json package-lock.json ./

# Install all deps (dev deps needed for the build stage)
RUN npm ci

# ────────────────────────────────────────────────────────────
# Stage 2: builder — compile the application
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source
COPY . .

# Generate Prisma client — does not require DATABASE_URL at build time
RUN npx prisma generate

# Next.js collects anonymous telemetry data — disable it
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application. Requires output: 'standalone' in next.config.ts
RUN npm run build

# ────────────────────────────────────────────────────────────
# Stage 3: runner — lean production image
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets into the expected location for the standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# The standalone output produces server.js at the root of the standalone dir
CMD ["node", "server.js"]
