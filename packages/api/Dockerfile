# ---- Stage 1: Build ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace root files needed for npm workspaces
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/api/package.json packages/api/

# Install all dependencies (including dev for building)
RUN npm ci --workspace=@meal/api

# Copy API source code
COPY packages/api/ packages/api/

# Build TypeScript (tsc + tsc-alias rewrites src/... imports)
RUN npm run build --workspace=@meal/api


# ---- Stage 2: Production ----
FROM node:22-alpine AS runner
WORKDIR /app

ARG API_PORT
ARG NODE_ENV

# Copy workspace root package files
COPY package.json package-lock.json ./
COPY packages/api/package.json packages/api/

# Install production-only dependencies
RUN npm ci --workspace=@meal/api --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/packages/api/dist packages/api/dist

# Documentation only — the actual listening port comes from the API_PORT env var
EXPOSE ${API_PORT}

# Container-internal healthcheck; API_PORT is expanded at runtime by the shell
HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=5 \
  CMD wget -qO- "http://127.0.0.1:${API_PORT}/health" || exit 1

CMD ["node", "packages/api/dist/index.js"]
