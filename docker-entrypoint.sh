#!/bin/sh
set -e

# Extract the file path from the DATABASE_URL (assuming format "file:/path/to/db.sqlite")
DB_FILE=$(echo "$DATABASE_URL" | sed 's/file://')

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
