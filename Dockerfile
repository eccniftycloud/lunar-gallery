FROM node:18-alpine AS base

# Install dependencies needed for node-gyp, sharp etc.
RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Force DATABASE_URL to a persistent path during build
ENV DATABASE_URL="file:./prisma/prod.db"
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Direct SQLite to the persistent prisma folder
ENV DATABASE_URL="file:./prisma/prod.db"

# Install prisma globally to allow entrypoint to push db
RUN npm install -g prisma

# Create persistence directories
RUN mkdir -p public/uploads
RUN chown -R node:node public/uploads

RUN mkdir -p prisma
RUN chown -R node:node prisma

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Add entrypoint for db sync
COPY --from=builder /app/scripts/entrypoint.sh ./scripts/
RUN chmod +x ./scripts/entrypoint.sh
RUN chown -R node:node /app

USER node

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/bin/sh", "./scripts/entrypoint.sh"]
