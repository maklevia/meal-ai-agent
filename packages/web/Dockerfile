# ---- Stage 1: Build ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/web/package.json packages/web/

RUN npm ci --workspace=@meal/web

COPY packages/web/ packages/web/

# Vite bakes VITE_* variables into the bundle at BUILD time.
# VITE_API_BASE_URL is provided as a build arg (nginx proxy contract: the web container proxies /api -> api service).
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build --workspace=@meal/web


# ---- Stage 2: Serve with nginx ----
FROM nginx:alpine AS runner

# nginx's entrypoint runs envsubst on /etc/nginx/templates/*.template
# and writes the result to /etc/nginx/conf.d/<name without .template>.
# API_HOST / API_PORT come from the container environment (docker-compose).
COPY packages/web/nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy built static files
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

ARG WEB_CONTAINER_PORT
EXPOSE ${WEB_CONTAINER_PORT}

CMD ["nginx", "-g", "daemon off;"]
