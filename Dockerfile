# Base stage for deps
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./
RUN npm ci

# Development stage
FROM node:18-alpine AS dev
WORKDIR /app

# Copy deps and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set development environment
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set up entrypoint
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Production build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Install wget for healthcheck
RUN apk add --no-cache wget

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

CMD ["node", "server.js"] 