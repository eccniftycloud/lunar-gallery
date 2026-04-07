#!/bin/sh
echo "🚀 Lunar Gallery Boot Sequence Initiated"
echo "📂 Synchronizing SQLite Database on Block Storage..."

# Ensure we have the Prisma CLI available
npx prisma db push --accept-data-loss

echo "🌟 Starting Next.js Production Server..."
exec node server.js
