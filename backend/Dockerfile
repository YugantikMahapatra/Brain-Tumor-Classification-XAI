FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for OpenCV and compiling some python packages
RUN apt-get update && apt-get install -y libglib2.0-0 libsm6 libxext6 libxrender-dev && rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create the backend directory
RUN mkdir backend

# Copy the rest of the application into /app/backend
COPY . /app/backend/

# Expose the FastAPI port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
