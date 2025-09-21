# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Install codemate package from src
ENV PYTHONPATH=/app/src

# Expose port for uvicorn
EXPOSE 8000

# Run the app
#CMD ["uvicorn", "codemate.webhook.server:app", "--host", "0.0.0.0", "--port", "8000"]

# Start server
CMD ["uvicorn", "src.codemate.webhook.server:app", "--host", "0.0.0.0", "--port", "8000"]
