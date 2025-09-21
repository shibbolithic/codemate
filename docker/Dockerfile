# docker/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Expose FastAPI port
EXPOSE 8000

# Start server
CMD ["uvicorn", "codemate.webhook.server:app", "--host", "0.0.0.0", "--port", "8000"]
