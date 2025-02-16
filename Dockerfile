# Build dependencies stage
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Allow NODE_ENV to be set at build time
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Copy dependency files from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_DB_CONNECT="true"
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Allow NODE_ENV to be set at build time
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Add only necessary production dependencies
RUN apk add --no-cache curl

# Set production environment
ENV PORT=3050
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create uploads directory with proper permissions
RUN mkdir -p /app/public/uploads && \
    addgroup -S -g 998 appgroup && \
    adduser -S -u 998 -G appgroup appuser && \
    chown -R appuser:appgroup /app

USER appuser:appgroup

EXPOSE 3050

CMD ["node", "server.js"] 