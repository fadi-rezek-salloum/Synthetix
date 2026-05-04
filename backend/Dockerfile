# 1. Use a lightweight Python version
FROM python:3.13-slim

# 2. Prevent Python from writing .pyc files and buffer logs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Set the directory where code will live
WORKDIR /app

# 4. Install system tools needed for PostgreSQL and development
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 5. Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of the code
COPY . .

# 7. Collect static files (needed for production)
RUN python manage.py collectstatic --noinput || true

# 8. Expose port
EXPOSE 8000

# 9. Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health/ || exit 1

# 10. Start the server with gunicorn for production-like setup
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "core.wsgi:application"]
