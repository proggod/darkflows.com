# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Add build-time environment variables
ENV MONGODB_URI="mongodb://admin:darkflows@mongodb:27017/darkflows?authSource=admin"
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3050
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV MONGODB_URI="mongodb://admin:darkflows@mongodb:27017/darkflows?authSource=admin"

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create uploads directory with proper permissions
RUN mkdir -p /app/public/uploads

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose the port
EXPOSE 3050

# Start the server with explicit host binding
CMD ["node", "server.js"] 