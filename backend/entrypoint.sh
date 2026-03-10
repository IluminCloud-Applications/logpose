#!/bin/bash
set -e

echo "=== Log Pose Starting ==="
echo "Running database migrations..."

# Execute the main command
exec "$@"
