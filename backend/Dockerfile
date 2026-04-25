# 1. Use a lightweight Python version
FROM python:3.13-slim

# 2. Prevent Python from writing .pyc files and buffer logs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Set the directory where code will live
WORKDIR /app

# 4. Install system tools needed for PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 5. Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of the code
COPY . .

# 7. Start the server
CMD ["gunicorn", "core.wsgi:application", "--bind", "127.0.0.1:8000"]
