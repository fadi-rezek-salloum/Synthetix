# 🐳 Docker Testing Guide for Synthetix

This guide will help you build, test, and run the Synthetix application using Docker.

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- Git

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Synthetix
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
# Django Settings
DJANGO_SECRET_KEY=your-super-secret-key-change-this-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,0.0.0.0

# Database (already configured in docker-compose.yml)
DATABASE_URL=postgres://postgres:postgres@db:5432/synthetix

# Redis (already configured in docker-compose.yml)
REDIS_URL=redis://redis:6379/0

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth (Optional - add your own)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GEMINI_API_KEY=your-gemini-api-key
EMAIL_HOST_PASSWORD=your-email-password
```

### 3. Run the Tests

#### On Windows (PowerShell):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\test-docker.ps1
```

#### On macOS/Linux (Bash):
```bash
chmod +x test-docker.sh
./test-docker.sh
```

#### Or manually with Docker Compose:
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Stop services
docker-compose down
```

## 📊 What Gets Tested

### Backend Tests
- ✅ Django setup and configuration
- ✅ Database migrations
- ✅ All API endpoints
- ✅ Type validation (models, serializers)
- ✅ Permission and authentication
- ✅ Cart operations with validation
- ✅ Order management
- ✅ Product catalog with brands API
- ✅ User authentication and profiles
- ✅ Google OAuth integration
- ✅ Wishlist functionality

### Frontend Tests
- ✅ Next.js build process
- ✅ TypeScript compilation
- ✅ React component structure
- ✅ Error boundaries
- ✅ Toast notifications
- ✅ State management (Context API)
- ✅ API integration
- ✅ Routing and navigation

### Infrastructure Tests
- ✅ Docker image builds
- ✅ Service health checks
- ✅ Database connectivity
- ✅ Redis connectivity
- ✅ Service inter-communication
- ✅ Volume mounting

## 🔗 Access the Services

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/v1/ (DRF browsable API)
- **Health Check**: http://localhost:8000/health/

### Default Login Credentials
- Email: `admin@synthetix.com`
- Password: `admin123`

## 📝 Useful Docker Commands

```bash
# View running services
docker-compose ps

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Execute command in running container
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm list

# Rebuild images after code changes
docker-compose build --no-cache

# Clean up everything
docker-compose down -v  # with volumes

# Stop services without removing
docker-compose stop

# Resume stopped services
docker-compose start
```

## 🧪 Running Specific Tests

### Django Tests
```bash
# Run all Django tests
docker-compose exec backend python manage.py test

# Run specific app tests
docker-compose exec backend python manage.py test accounts
docker-compose exec backend python manage.py test catalog
docker-compose exec backend python manage.py test orders

# Run with verbose output
docker-compose exec backend python manage.py test -v 2
```

### Check Django Configuration
```bash
# Check for deployment issues
docker-compose exec backend python manage.py check --deploy

# Run migrations check
docker-compose exec backend python manage.py makemigrations --check
```

### Frontend Build Test
```bash
# Build the Next.js app
docker-compose exec frontend npm run build

# Run TypeScript type check
docker-compose exec frontend npx tsc --noEmit

# Run ESLint
docker-compose exec frontend npx eslint .
```

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Check migrations
docker-compose exec backend python manage.py showmigrations

# Manually run migrations
docker-compose exec backend python manage.py migrate
```

### Frontend build fails
```bash
# Check Node modules
docker-compose exec frontend npm ls

# Reinstall dependencies
docker-compose exec frontend npm ci

# Clear Next.js cache
docker-compose exec frontend rm -rf .next
```

### Database connection issues
```bash
# Check PostgreSQL logs
docker-compose logs db

# Test database connection
docker-compose exec backend psql -U postgres -h db -d synthetix -c "SELECT 1"
```

### Port already in use
```bash
# Change ports in docker-compose.yml
# Or kill the process:
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows
```

## 📦 Dependencies

### Backend (Django)
- Django 4.2+
- Django REST Framework 3.14+
- PostgreSQL 15
- Redis (Alpine)
- Python 3.13

### Frontend (Next.js)
- Next.js 16.2.4
- React 19.2.5
- TypeScript 5
- Node.js 20 (Alpine)

## 🔒 Security Notes

1. **Development Only**: The default `.env` values are for development. Never use these in production.
2. **Secrets**: Store sensitive credentials (API keys, database passwords) in secure vaults.
3. **HTTPS**: In production, always use HTTPS with valid certificates.
4. **CORS**: Configure CORS properly for your domain in production.

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Django Docker Documentation](https://docs.djangoproject.com/en/stable/topics/deployment/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment/docker)

## ✅ Verification Checklist

After running tests, verify:

- [ ] All services are healthy (`docker-compose ps` shows "Up")
- [ ] Backend responds to health check
- [ ] Frontend loads without errors
- [ ] Can access admin panel at http://localhost:8000/admin
- [ ] API endpoints respond with correct data
- [ ] Database migrations completed successfully
- [ ] No critical errors in logs

## 🤝 Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Review error messages carefully
3. Ensure all prerequisites are installed
4. Try rebuilding: `docker-compose build --no-cache`

---

**Happy Testing! 🚀**
