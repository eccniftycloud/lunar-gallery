FROM node:18-alpine AS base

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

# Run the build script.
# We also run prisma generate to ensure the client is ready
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# We want to persist the uploads directory
# Create the directory and set permissions
RUN mkdir -p public/uploads
RUN chown node:node public/uploads

# Create a place for the sqlite db if not exists
RUN mkdir -p prisma
RUN chown node:node prisma

# Copy the standalone output
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# Copy schema for migrations if needed, though usually migrations are run separatedly
COPY --from=builder --chown=node:node /app/prisma ./prisma

USER node

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
