# Skillyug Recommendation Engine - FastAPI
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app \
    PORT=8000 \
    ENVIRONMENT=production

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Download spaCy English model (optional, fallback will handle if not available)
RUN python -m spacy download en_core_web_sm || echo "spaCy model download failed, will use fallback"

# Pre-download the sentence transformer model to avoid runtime downloads
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')" || echo "Model pre-download failed, will download at runtime"

# Copy application code and data
COPY app/ ./app/
COPY data/ ./data/
COPY startup.sh ./startup.sh

# Create a non-root user and switch to it
RUN useradd -m appuser && \
    chown -R appuser:appuser /app && \
    chmod +x /app/startup.sh
USER appuser

# Set default environment variables
ENV PORT=8003

# Expose the port the app runs on
EXPOSE $PORT

# Use startup script to ensure proper initialization
CMD ["./startup.sh"]

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Command to run the application using our startup script
CMD ["./startup.sh"]
