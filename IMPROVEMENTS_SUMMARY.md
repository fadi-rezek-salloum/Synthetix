# 📋 Synthetix — Improvements Summary

All notable changes, features, and fixes are documented here, newest first.

---

## [Unreleased]

### Added
- `DOCKER_TESTING.md` — Full containerisation guide for build, run, verify and teardown
- `.env.example` — Template with all required environment variables documented
- `IMPROVEMENTS_SUMMARY.md` — This changelog file
- `backend/orders/admin.py` — Django admin registration for Cart, Order, OrderItem
- `backend/intelligence/admin.py` — Django admin stub for the AI app
- `backend/orders/__init__.py` — Package marker (was missing)
- `backend/orders/tests.py` — Unit tests for CartViewSet and OrderViewSet
- `backend/accounts/tests.py` — Unit tests for auth endpoints and Google OAuth service
- `frontend/src/services/addressService.ts` — Address CRUD service (GET, POST, PATCH, DELETE)
- `frontend/src/app/seller/page.tsx` — Seller dashboard for product management
- Address management UI in `frontend/src/app/settings/page.tsx`
- Seller product management section in Settings when `user.role === "SELLER"`
- Missing `Review`, `SellerProfile`, `CustomerProfile`, `PriceHistory` TypeScript types

### Fixed
- `backend/catalog/views.py` — `CategoryViewSet` now uses `prefetch_related("children")` to eliminate N+1 on nested categories
- `backend/orders/views.py` — `OrderViewSet.get_queryset()` now prefetches full product chain (`items__product__images`, `items__product__variants`, `items__product__category`)
- `backend/catalog/views.py` — `WishlistViewSet.get_queryset()` now includes `select_related` for product vendor
- `backend/core/settings.py` — Added structured `LOGGING` configuration
- `frontend/src/types/index.ts` — Added missing `address_type`, `first_name`, `last_name` fields to `Address`; added `Review`, `SellerProfile`, `CustomerProfile`, `PriceHistory` interfaces

---

## [v1.0.0] — 2026-05-06

### Initial Release
- Django REST API with JWT authentication via HttpOnly cookies
- Google OAuth integration (credential flow + access token flow)
- Product catalog with filtering, searching, and pagination
- Shopping cart and checkout flow
- Order management with status tracking
- AI product descriptions via Google Gemini API
- AI fashion concierge chatbot ("Loom")
- Wishlist with toggle functionality
- Customer and Seller profile management
- Address book management
- Password change and account deletion
- Email verification flow
- Next.js 16 frontend with Tailwind CSS and Framer Motion
- Full Docker Compose orchestration (PostgreSQL, Redis, Backend, Frontend)
