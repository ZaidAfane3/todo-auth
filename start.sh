#!/bin/sh

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until node scripts/setup-db.js test; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
node scripts/migrate.js migrate

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi

# Start the auth service
echo "🚀 Starting auth service..."
exec node server.js
