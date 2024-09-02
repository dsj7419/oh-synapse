FROM node:18-alpine AS base

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with cache mount
RUN --mount=type=cache,id=s/75fa00b7-9cb4-45db-b050-367643bf0e29-/root/.pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Use Railway environment variables
ARG RAILWAY_ENVIRONMENT
ARG DATABASE_URL
ARG PORT

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE ${PORT:-3000}

# Start the application
CMD ["pnpm", "start"]