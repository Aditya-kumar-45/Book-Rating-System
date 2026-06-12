# ---- Build stage ----
FROM node:20-alpine

WORKDIR /app

# Install production dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

CMD ["node", "src/server.js"]
