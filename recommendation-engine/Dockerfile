FROM node:18

WORKDIR /app

# Install dependencies for Sharp, ONNX Runtime, and Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libssl-dev \
    curl \
    build-essential \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Set Sharp to use pre-built binaries
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci
# Rebuild Sharp for the current platform
RUN npm rebuild sharp --platform=linux --arch=x64

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