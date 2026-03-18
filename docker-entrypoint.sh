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

# Check if the database file exists
if [ ! -f "$DB_FILE" ]; then
    echo "First run detected: Initializing SQLite database at $DB_FILE..."
    
    # Ensure the directory exists
    mkdir -p $(dirname "$DB_FILE")
    
    # Run Prisma db push to create the schema
    echo "Running prisma db push..."
    npx prisma db push --accept-data-loss
    
    echo "Database initialization complete."
else
    echo "Database already exists at $DB_FILE. Skipping initialization."
fi

# Execute the main command (starts the Next.js app)
echo "Starting application..."
exec "$@"
