# ---------- Base Dependencies Stage ----------
    FROM node:20-alpine AS base
    WORKDIR /app
    RUN apk add --no-cache libc6-compat \
        && npm install -g pnpm  # Install pnpm here
    
    # Copy Prisma schema
    COPY prisma ./prisma
    
    # ---------- Dependencies Stage ----------
    FROM base AS deps
    # Copy package files
    COPY package.json pnpm-lock.yaml ./
    # Install dependencies
    RUN pnpm install --frozen-lockfile
    
    # ---------- Build Stage ----------
    FROM base AS build
    # Copy dependencies
    COPY --from=deps /app/node_modules ./node_modules
    # Copy application source code
    COPY . .
    # Build the application
    RUN pnpm run build
    
    # ---------- Production Stage ----------
    FROM node:20-alpine AS production
    WORKDIR /app
    ENV NODE_ENV=production
    
    # Copy built application and necessary files
    COPY --from=build /app/.next/standalone ./
    COPY --from=build /app/.next/static ./.next/static
    COPY --from=build /app/public ./public
    COPY --from=deps /app/node_modules ./node_modules
    COPY package.json ./
    
    # Expose port and start application
    EXPOSE 3000
    CMD ["node", "server.js"]
    