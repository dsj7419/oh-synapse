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
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG DISCORD_CLIENT_ID
ARG DISCORD_CLIENT_SECRET
ARG UPLOADTHING_SECRET
ARG UPLOADTHING_APP_ID

ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
ENV DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
ENV UPLOADTHING_SECRET=${UPLOADTHING_SECRET}
ENV UPLOADTHING_APP_ID=${UPLOADTHING_APP_ID}

RUN pnpm run build

# Migrate database
RUN pnpm prisma migrate deploy

# Start the application
CMD ["pnpm", "start"]

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1