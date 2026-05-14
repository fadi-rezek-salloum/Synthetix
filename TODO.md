# 📝 Synthetix Project TODO List

This document tracks missing features, files, and optimizations based on the **AGENTS.md** constitution.

---

## 🏗️ 1. Infrastructure & Documentation
- [ ] **Create `.env.example`**: Define all required environment variables (Google OAuth, Gemini API, Database URLs, etc.) for local development setup.
- [ ] **Create `DOCKER_TESTING.md`**: Document the workflow for building, running, and verifying the containerized application as specified in `AGENTS.md`.
- [ ] **Create `IMPROVEMENTS_SUMMARY.md`**: Initialize the changelog to track every logical change, refactor, and feature addition.

---

## ⚙️ 2. Backend (Django REST API)
### 🏎️ Performance & Optimization
- [ ] **Optimize `WishlistViewSet`**: Update `get_queryset()` in `backend/catalog/views.py` to include missing `select_related` and `prefetch_related` calls for nested serialization:
  - `select_related("products__category", "products__vendor")`
  - `prefetch_related("products__images", "products__variants", "products__reviews__user")`
- [ ] **Audit `OrderViewSet`**: Check `backend/orders/views.py` for potential N+1 queries when serializing `OrderItem` and nested `Product` data.
- [ ] **Audit `CartViewSet`**: Ensure cart items prefetch their associated product variants and images.

### 🧪 Validation & Testing
- [ ] **Enhanced Input Validation**: Review all serializers to ensure `min_value`, `max_value`, and regex validators are used where applicable (e.g., quantities, phone numbers).
- [ ] **Unit Tests**: Ensure `accounts/tests.py` covers Google OAuth service logic and JWT cookie handling.

---

## 🎨 3. Frontend (Next.js SPA)
### 🔍 SEO & Metadata
- [ ] **Page-Specific Metadata**: Ensure every `page.tsx` in `src/app/` (Catalog, Cart, Checkout, Profile, etc.) exports a unique and descriptive `Metadata` object.
- [ ] **OpenGraph Images**: Add dynamic OG image generation or static assets for sharing.

### 🧱 Component Library
- [ ] **Premium UI Polish**: Audit `src/components/ui/` to ensure consistency in glassmorphism, gold/silver/rose accents, and Framer Motion micro-animations.
- [ ] **Loading/Empty States**: Verify that every data-driven page handles `loading`, `error`, and `empty` states gracefully with premium skeletons or illustrations.

### 🔐 Authentication & Profile
- [ ] **Profile Settings**: Complete the UI for `src/app/settings/page.tsx` allowing users to manage addresses and preferences.
- [ ] **Seller Dashboard**: If not fully implemented, ensure the seller-specific views for product management are functional and styled.

---

## ✅ Completed (Verified)
- [x] **Project Structure**: Folder hierarchy matches `AGENTS.md` perfectly.
- [x] **Auth Flow**: JWT via HttpOnly cookies and Google OAuth service integration.
- [x] **AI Engine**: Gemini API integration in `intelligence` app using `google-genai`.
- [x] **Global Styling**: Tailwind CSS configuration with luxury color tokens and fonts.
- [x] **Core Rules**: `ATOMIC_REQUESTS` enabled, `apiFetch` implemented, `logger` used, and `gettext_lazy` for models.
