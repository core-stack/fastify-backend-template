# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build
# ============================================
FROM deps AS builder
WORKDIR /app

COPY . .

# prisma generate precisa de DATABASE_URL (não conecta; só valida o config)
ARG DATABASE_URL=postgresql://localhost:5432/db
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma Client and build
RUN pnpm exec prisma generate && pnpm run build

# ============================================
# Stage 3: Production dependencies + Prisma generate
# ============================================
FROM node:22-alpine AS prod-deps
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY prisma ./prisma
COPY prisma.config.ts ./
ARG DATABASE_URL=postgresql://localhost:5432/db
ENV DATABASE_URL=${DATABASE_URL}
RUN pnpm exec prisma generate

# ============================================
# Stage 4: Final image
# ============================================
FROM node:22-alpine AS runner

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 8852

CMD ["node", "dist/index.js"]
