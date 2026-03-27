FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies
COPY apps/image-worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY apps/image-worker/ .

# Create uploads directory (will be overridden by volume mount in Docker Compose)
RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
