FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN --mount=type=cache,id=s/75fa00b7-9cb4-45db-b050-367643bf0e29-pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Build the application
RUN pnpm run build

# migrate
RUN pnpm prisma migrate deploy

# Start the application
CMD ["pnpm", "start"]

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1