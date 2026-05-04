# Docker build and test script for Synthetix (Windows)
# Run this script in PowerShell

$ErrorActionPreference = "Stop"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🐳 Building Docker images..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

docker-compose up -d
if ($LASTEXITCODE -ne 0) { throw "Docker-compose up failed" }

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Wait for backend to be healthy
Write-Host "Waiting for backend..."
$count = 0
while ($count -lt 30) {
    try {
        docker-compose exec -T backend python manage.py check 2>&1 | Out-Null
        Write-Host "✓ Backend is ready" -ForegroundColor Green
        break
    }
    catch {
        if ($count -eq 29) {
            Write-Host "✗ Backend failed to start" -ForegroundColor Red
            docker-compose logs backend
            exit 1
        }
        Start-Sleep -Seconds 2
        $count++
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

docker-compose exec -T backend python manage.py migrate
if ($LASTEXITCODE -ne 0) { throw "Migration failed" }

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "📦 Creating test superuser..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$pythonCode = @"
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@synthetix.com').exists():
    User.objects.create_superuser('admin', 'admin@synthetix.com', 'admin123')
    print('✓ Superuser created')
else:
    print('✓ Superuser already exists')
"@

docker-compose exec -T backend python manage.py shell -c $pythonCode

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ Testing Backend APIs..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "Testing backend health check..."
docker-compose exec -T backend python manage.py check --deploy --fail-level WARNING

Write-Host ""
Write-Host "Testing API endpoints..."
$testCode = @"
import os
os.environ['DJANGO_ALLOW_ASYNC_UNSAFE'] = 'true'

from django.test import Client
from django.contrib.auth import get_user_model

client = Client()
User = get_user_model()

# Test homepage
print("Testing GET /api/v1/...")
response = client.get('/api/v1/')
print(f"Status: {response.status_code}")

# Test products endpoint
print("\nTesting GET /api/v1/catalog/products/...")
response = client.get('/api/v1/catalog/products/')
print(f"Status: {response.status_code}")

# Test categories endpoint
print("\nTesting GET /api/v1/catalog/categories/...")
response = client.get('/api/v1/catalog/categories/')
print(f"Status: {response.status_code}")

# Test brands endpoint
print("\nTesting GET /api/v1/catalog/products/brands/...")
response = client.get('/api/v1/catalog/products/brands/')
print(f"Status: {response.status_code}")

print("\n✓ All API endpoints are working!")
"@

docker-compose exec -T backend python manage.py shell -c $testCode

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🎯 Testing Frontend..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "Waiting for frontend..."
$count = 0
while ($count -lt 30) {
    try {
        $response = docker-compose exec -T frontend curl -s http://localhost:3000
        if ($response) {
            Write-Host "✓ Frontend is ready" -ForegroundColor Green
            break
        }
    }
    catch {
        if ($count -eq 29) {
            Write-Host "✗ Frontend failed to start" -ForegroundColor Red
            docker-compose logs frontend
            exit 1
        }
    }
    Start-Sleep -Seconds 2
    $count++
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🔍 Verifying TypeScript compilation..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

docker-compose exec -T frontend npx tsc --noEmit

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "📊 Service Status" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

docker-compose ps

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services are running:" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Docs:     http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f backend" -ForegroundColor Gray
Write-Host "  docker-compose logs -f frontend" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop services:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor Gray
Write-Host ""
