FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (libgomp1 is required by LightGBM)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy necessary files for backend services
COPY backend/ ./backend/

# Set Python path to include the root directory
ENV PYTHONPATH=/app

# Expose the API port
EXPOSE 8000

# Start backend using uvicorn
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
