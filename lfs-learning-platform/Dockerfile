# Multi-stage build for Next.js application
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY lfs-learning-platform/package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Save node_modules for builder stage
RUN npm ci

# ============================================================
# Builder Stage
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY lfs-learning-platform .

# Build the Next.js application
RUN npm run build

# ============================================================
# Production Runtime
# ============================================================
FROM node:20-alpine AS runtime

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy runtime dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next ./.next
COPY lfs-learning-platform/public ./public
COPY lfs-learning-platform/package.json ./package.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node_modules/.bin/next", "start", "-p", "8080"]
