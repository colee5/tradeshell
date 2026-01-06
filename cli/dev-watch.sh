#!/bin/bash

# TradeShell CLI Development Watch Script
# Automatically restarts the CLI when you use the 'refresh' command

echo "🚀 Starting TradeShell CLI in watch mode..."
echo "   Use the 'refresh' command inside the CLI to reload code changes"
echo ""

while true; do
  DEV=true tsx source/cli.tsx
  EXIT_CODE=$?

  # Exit code 42 means user requested refresh
  if [ $EXIT_CODE -eq 42 ]; then
    echo ""
    echo "🔄 Reloading CLI..."
    sleep 0.3
  else
    # Any other exit code (including normal exit) stops the loop
    echo ""
    echo "TradeShell has exited"
    break
  fi
done
