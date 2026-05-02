#!/bin/bash
# Pixel Studio - Development server startup
# Run this at the start of each session to verify the app works.

set -e

echo "=== Pixel Studio Init Script ==="

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start dev server in background
echo "Starting dev server..."
npm run dev &
DEV_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
for i in $(seq 1 30); do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "Server is ready at http://localhost:3000"
    break
  fi
  sleep 1
done

echo "Dev server PID: $DEV_PID"
echo "To stop: kill $DEV_PID"
