FROM node:18-alpine

WORKDIR /app

# Install Python and dependencies for model downloads
RUN apk add --no-cache python3 py3-pip

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/

# Create directories for models and data
RUN mkdir -p ./models/cache ./data

# Copy environment file
COPY .env ./

# Build the application
RUN npm run build

# Download models during build (optional - can be done at runtime)
# RUN npm run download-models

# Expose the port
EXPOSE 8003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8003/health || exit 1

# Start the service
CMD ["npm", "start"]