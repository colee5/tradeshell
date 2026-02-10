#!/bin/bash

# Automatically restarts the CLI when we use the 'refresh' command

echo "Starting TradeShell CLI in watch mode..."
echo ""

while true; do
  DEV=true bun source/cli.tsx
  EXIT_CODE=$?

  # Exit code 42 means user requested refresh
  if [ $EXIT_CODE -eq 42 ]; then
  echo ""
  else
    # Any other exit code (including normal exit) stops the loop
    echo ""
    echo "TradeShell has exited"
    break
  fi
done
