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
COPY backend/ /app/backend/

# Set working directory to backend
WORKDIR /app/backend

# Set Python path to include the backend directory
ENV PYTHONPATH=/app/backend

# Expose the API port (Hugging Face Spaces requires port 7860)
EXPOSE 7860

# Start backend using uvicorn (matching local cd backend & run command)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
