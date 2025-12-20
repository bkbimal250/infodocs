#!/bin/bash
# Production Server Startup Script
# Optimized for 500+ concurrent users

# Configuration
WORKERS=${WORKERS:-4}
HOST=${HOST:-0.0.0.0}
PORT=${PORT:-8000}
LOG_LEVEL=${LOG_LEVEL:-info}

echo "Starting FastAPI server with $WORKERS workers..."
echo "Host: $HOST, Port: $PORT"

# Check if gunicorn is available
if command -v gunicorn &> /dev/null; then
    echo "Using Gunicorn + Uvicorn Workers"
    exec gunicorn main:app \
        --workers $WORKERS \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind $HOST:$PORT \
        --timeout 120 \
        --keep-alive 5 \
        --max-requests 1000 \
        --max-requests-jitter 100 \
        --log-level $LOG_LEVEL \
        --access-logfile - \
        --error-logfile -
else
    echo "Using Uvicorn (Gunicorn not found, install with: pip install gunicorn)"
    exec uvicorn main:app \
        --host $HOST \
        --port $PORT \
        --workers $WORKERS \
        --limit-concurrency 1000 \
        --timeout-keep-alive 5 \
        --backlog 2048 \
        --log-level $LOG_LEVEL
fi
