#!/bin/sh
set -e

# Robustly extract the file path from DATABASE_URL
# Handles "file:path", "file:/path", "file://path", etc.
DB_FILE=$(echo "$DATABASE_URL" | sed 's|^file:/*|/|')

# Ensure path is absolute for internal logic
case "$DB_FILE" in
  /*) ;;
  *) DB_FILE="/app/$DB_FILE" ;;
esac

echo "Target database file: $DB_FILE"
echo "Directory: $(dirname "$DB_FILE")"

# Check permissions of the data directory
if [ -d "$(dirname "$DB_FILE")" ]; then
    ls -ld "$(dirname "$DB_FILE")"
else
    echo "Directory $(dirname "$DB_FILE") does not exist yet."
fi

# Ensure the database directory exists
mkdir -p $(dirname "$DB_FILE")

echo "Synchronizing database schema with Prisma..."
# Always run db push on boot to seamlessly apply software updates to existing volumes
npx prisma db push --accept-data-loss

# Execute the main command (starts the Next.js app)
echo "Starting application..."
exec "$@"
