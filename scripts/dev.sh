#!/usr/bin/env bash
# Run the full stack in Docker, loading env files with and explicit priority chain:
#   .env < .env.dev < .env.local   (later files win)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_ARGS=()
for f in .env .env.dev .env.local; do
  if [[ -f "$f" ]]; then
    ENV_ARGS+=(--env-file "$f")
  fi
done

if [[ ${#ENV_ARGS[@]} -eq 0 ]]; then
  echo "No env file found. Copy .env.example to .env (or .env.dev / .env.local)." >&2
  exit 1
fi

# Development override enables API hot-reload (tsx watch + bind-mounted src).
COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.dev.yml)

echo "Using env files: ${ENV_ARGS[*]}"
echo "Using compose files: ${COMPOSE_FILES[*]}"
exec docker compose "${ENV_ARGS[@]}" "${COMPOSE_FILES[@]}" up --build "$@"
