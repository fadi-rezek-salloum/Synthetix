# 📦 Docker Testing Guide — Synthetix

This document describes how to build, run, and verify the fully containerised Synthetix stack.

---

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Docker Desktop | 24.x |
| Docker Compose | v2.x (bundled with Docker Desktop) |
| Git | any |

---

## 1. Initial Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Synthetix

# 2. Create your environment file from the template
cp .env.example .env
# Edit .env and fill in all required values

# 3. Build all images
docker-compose build
```

---

## 2. Starting the Stack

```bash
# Start all services in detached mode
docker-compose up -d

# Watch live logs (all services)
docker-compose logs -f

# Watch logs for a specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 3. First-Run Database Setup

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create a superuser (admin panel access)
docker-compose exec backend python manage.py createsuperuser

# (Optional) Seed sample data
docker-compose exec backend python manage.py seed_products
```

---

## 4. Health Checks

```bash
# All services should show "Up (healthy)"
docker-compose ps

# Backend health endpoint
curl http://localhost:8000/health/
# Expected: {"status": "ok"}

# Frontend
curl -I http://localhost:3000
# Expected: HTTP 200 OK

# Django admin panel
open http://localhost:8000/admin/
```

---

## 5. Running Tests

```bash
# Backend unit tests
docker-compose exec backend python manage.py test

# Backend deploy check
docker-compose exec backend python manage.py check --deploy --fail-level WARNING

# Frontend TypeScript check
docker-compose exec frontend npx tsc --noEmit

# Frontend lint
docker-compose exec frontend npx eslint .
```

---

## 6. Teardown

```bash
# Stop all services (keeps volumes)
docker-compose down

# Full teardown — removes volumes and images
docker-compose down -v --rmi local

# Remove dangling images
docker image prune -f
```

---

## 7. Service Port Reference

| Service | Internal Port | Host Port |
|---------|--------------|-----------|
| `db` (PostgreSQL) | 5432 | 5432 |
| `redis` | 6379 | 6379 |
| `backend` (Django) | 8000 | 8000 |
| `frontend` (Next.js) | 3000 | 3000 |

---

## 8. Common Issues

| Problem | Solution |
|---------|----------|
| `backend` exits immediately | Check `docker-compose logs backend` — likely a missing env variable |
| `frontend` can't reach API | Verify `NEXT_PUBLIC_API_URL` points to `http://backend:8000/api/v1` inside Docker |
| Migrations fail | Ensure `db` is healthy before running: `docker-compose ps` |
| Static files 404 | Run `python manage.py collectstatic --noinput` inside backend container |
| CORS errors in browser | Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL in `.env` |
