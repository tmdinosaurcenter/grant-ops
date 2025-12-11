# =============================================================================
# Job Ops - Unified Docker Image
# Contains: Orchestrator (Node.js), Job Crawler, Resume Generator (Python/Playwright)
# =============================================================================

FROM mcr.microsoft.com/playwright:v1.49.1-jammy

# Set working directory
WORKDIR /app

# Install Node.js 20.x and Python
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs python3 python3-pip && \
    npm install -g pnpm

# Install Python dependencies for resume generator
RUN pip3 install --no-cache-dir playwright

# Copy package files first for better caching
COPY orchestrator/package*.json ./orchestrator/
COPY job-extractor/package*.json ./job-extractor/

# Install Node.js dependencies
WORKDIR /app/orchestrator
RUN npm install --production=false

WORKDIR /app/job-extractor
RUN npm install --production=false

# Copy source code
WORKDIR /app
COPY orchestrator ./orchestrator
COPY job-extractor ./job-extractor
COPY resume-generator ./resume-generator

# Build the orchestrator (client + server)
WORKDIR /app/orchestrator
RUN npm run build

# Create data directories
RUN mkdir -p /app/data/pdfs

# Expose ports
EXPOSE 3001

# Environment variables (can be overridden)
ENV NODE_ENV=production
ENV PORT=3001
ENV PYTHON_PATH=/usr/bin/python3
ENV DATA_DIR=/app/data
ENV RESUME_GEN_DIR=/app/resume-generator

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Run migrations and start the server
WORKDIR /app/orchestrator
CMD ["sh", "-c", "npm run db:migrate && npm run start"]
