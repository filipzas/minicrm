#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

if [ -f "$HOME/.nvm/nvm.sh" ]; then
  # Use Node 20 to avoid better-sqlite3 build issues on shared hosting.
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  nvm use 20 >/dev/null
fi

echo "Updating repository..."
old_rev="$(git rev-parse HEAD)"
git pull --ff-only
new_rev="$(git rev-parse HEAD)"

if [ "$old_rev" = "$new_rev" ]; then
  echo "No changes to deploy."
  exit 0
fi

changed_files="$(git diff --name-only "$old_rev" "$new_rev")"

needs_frontend_deps=0
needs_frontend_build=0
needs_backend_deps=0

echo "$changed_files" | grep -E -q '^(package.json|package-lock.json|vite.config.js|tailwind.config.cjs|postcss.config.cjs|svelte.config.js|tsconfig.json)' && needs_frontend_deps=1
echo "$changed_files" | grep -E -q '^(src/|static/|vite.config.js|tailwind.config.cjs|postcss.config.cjs|svelte.config.js|tsconfig.json)' && needs_frontend_build=1
echo "$changed_files" | grep -E -q '^server/(package.json|package-lock.json)' && needs_backend_deps=1

if [ "$needs_frontend_deps" -eq 1 ]; then
  echo "Installing frontend dependencies..."
  if [ -f package-lock.json ]; then
    npm ci --no-audit --no-fund
  else
    npm install --no-audit --no-fund
  fi
fi

if [ "$needs_frontend_build" -eq 1 ]; then
  echo "Syncing SvelteKit..."
  npx svelte-kit sync

  echo "Building frontend..."
  npm run build
fi

if [ "$needs_backend_deps" -eq 1 ]; then
  echo "Installing backend dependencies..."
  cd "$ROOT_DIR/server"
  if [ -f package-lock.json ]; then
    npm ci --omit=dev --no-audit --no-fund
  else
    npm install --omit=dev --no-audit --no-fund
  fi
  cd "$ROOT_DIR"
fi

echo "Restarting server..."
pkill -f "node server/src/index.js" || true
nohup node server/src/index.js > server.log 2>&1 &
echo "Done."
