# 🧬 AGENTS.md — Synthetix Project Constitution

> **This is the single source of truth for every AI agent working on this project.**
> **YOU MUST read this file IN FULL before writing a single line of code.**

---

## 1. Project Overview & Mission

**Synthetix** is a production-grade, premium e-commerce platform for high-end fashion and streetwear, powered by AI-driven style discovery.

| Attribute        | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Product**      | AI-powered luxury fashion e-commerce platform            |
| **Architecture** | Decoupled monolith — Django REST API + Next.js SPA       |
| **Deployment**   | Docker Compose (PostgreSQL, Redis, Backend, Frontend)    |
| **API Style**    | RESTful, versioned (`/api/v1/`), JWT via HttpOnly cookies |
| **Auth**         | `dj-rest-auth` + `django-allauth` + Google OAuth         |
| **AI Engine**    | Google Gemini API (`intelligence` app)                   |

### Mission Statement

Build the **cleanest, fastest, most maintainable** e-commerce codebase possible. Every line of code must be **production-ready**. Every decision must favor **simplicity over cleverness**.

---

## 2. Technology Stack

### Backend

| Component              | Version / Spec        | Purpose                          |
| ---------------------- | --------------------- | -------------------------------- |
| Python                 | 3.13-slim             | Runtime                          |
| Django                 | ≥4.2, <5.0 (LTS)     | Web framework                    |
| Django REST Framework  | ≥3.14                 | API layer                        |
| SimpleJWT              | ≥5.3                  | JWT authentication               |
| django-allauth         | ≥0.56                 | Social auth (Google OAuth)       |
| dj-rest-auth           | ≥5.0                  | REST auth endpoints              |
| PostgreSQL             | 15-alpine             | Primary database                 |
| Redis                  | alpine                | Cache / session store            |
| Gunicorn               | ≥21.2                 | Production WSGI server           |
| WhiteNoise             | ≥6.6                  | Static file serving              |
| Pillow                 | ≥10.1                 | Image processing                 |
| google-genai           | ≥0.3                  | AI product descriptions          |

### Frontend

| Component              | Version / Spec        | Purpose                          |
| ---------------------- | --------------------- | -------------------------------- |
| Node.js                | 20-alpine             | Runtime                          |
| Next.js                | 16.2.x                | React framework (App Router)     |
| React                  | 19.x                  | UI library                       |
| TypeScript             | 5.x                   | Type safety                      |
| Tailwind CSS           | 3.4.x                 | Utility-first styling            |
| Framer Motion          | 12.x                  | Animations                       |
| Lucide React           | 1.x                   | Icon library                     |

### Infrastructure

| Component              | Version / Spec        | Purpose                          |
| ---------------------- | --------------------- | -------------------------------- |
| Docker                 | Latest                | Containerization                 |
| Docker Compose         | Latest                | Orchestration                    |
| PostgreSQL             | 15-alpine             | Database container               |
| Redis                  | alpine                | Cache container                  |

> [!CAUTION]
> **YOU MUST NEVER** add a new dependency without explicit user approval. **YOU MUST NEVER** upgrade a major version without explicit user approval. Check `requirements.txt` and `package.json` before assuming any library is available.

---

## 3. Project Architecture

### 3.1 Folder Structure

```
Synthetix/
├── backend/                    # Django REST API
│   ├── core/                   # Django project settings
│   │   ├── settings.py         # ALL config lives here
│   │   ├── urls.py             # Root URL routing (/api/v1/*)
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── accounts/               # Auth, Users, Profiles, Addresses
│   │   ├── models.py           # User, SellerProfile, CustomerProfile, Address
│   │   ├── views.py            # Auth views, profile CRUD
│   │   ├── services.py         # GoogleAuthService (reusable business logic)
│   │   ├── serializers.py      # User/Profile serializers
│   │   ├── auth_serializers.py # Registration serializers
│   │   ├── authentication.py   # SafeJWTCookieAuthentication
│   │   ├── permissions.py      # Role-based permissions
│   │   ├── adapters.py         # Custom allauth adapter
│   │   ├── signals.py          # Post-save profile creation
│   │   └── urls.py
│   ├── catalog/                # Products, Categories, Reviews, Wishlist
│   │   ├── models.py           # Product, Category, Variant, Review, Wishlist, PriceHistory, StockLog
│   │   ├── views.py            # ProductViewSet, CategoryViewSet, ReviewViewSet, WishlistView
│   │   ├── serializers.py
│   │   ├── permissions.py      # IsVendorOrReadOnly
│   │   ├── signals.py          # Auto-generate AI descriptions
│   │   └── urls.py
│   ├── orders/                 # Cart, Orders, Checkout
│   │   ├── models.py           # Cart, CartItem, Order, OrderItem
│   │   ├── views.py            # Cart CRUD, checkout, order history
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── intelligence/           # AI-powered features
│   │   ├── services.py         # Gemini API integration
│   │   ├── views.py            # AI endpoints
│   │   └── urls.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
├── frontend/                   # Next.js App Router SPA
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── layout.tsx      # Root layout (providers, header, footer)
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── auth/           # Login, Register, Verify pages
│   │   │   ├── catalog/        # Product listing & detail
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── checkout/       # Checkout flow
│   │   │   ├── orders/         # Order history
│   │   │   ├── profile/        # User profile
│   │   │   ├── wishlist/       # Wishlist
│   │   │   ├── intelligence/   # AI features
│   │   │   └── settings/       # User settings
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/         # Header, Footer, Navigation
│   │   │   ├── ui/             # Buttons, inputs, cards
│   │   │   ├── auth/           # Auth-specific components
│   │   │   ├── sections/       # Page sections (Hero, etc.)
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ToastContainer.tsx
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.tsx  # Auth state management
│   │   │   ├── CartContext.tsx  # Cart state
│   │   │   └── WishlistContext.tsx
│   │   ├── services/           # API service layer
│   │   │   ├── authService.ts
│   │   │   ├── productService.ts
│   │   │   └── categoryService.ts
│   │   ├── lib/                # Utilities
│   │   │   ├── api.ts          # Central fetch wrapper (apiFetch)
│   │   │   ├── logger.ts       # Structured logging (NO console.*)
│   │   │   ├── notificationService.ts  # Toast notifications
│   │   │   └── utils.ts
│   │   ├── types/              # TypeScript type definitions
│   │   │   └── index.ts        # ALL shared types
│   │   ├── hooks/              # Custom React hooks
│   │   └── styles/             # Additional stylesheets
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── tsconfig.json
├── docker-compose.yml          # Full-stack orchestration
├── .env                        # Local environment (NEVER commit)
├── .env.example                # Template for .env
├── .gitignore
├── AGENTS.md                   # THIS FILE — project constitution
├── DOCKER_TESTING.md           # Docker testing guide
├── IMPROVEMENTS_SUMMARY.md     # Change log
└── VERIFICATION_REPORT.md      # QA verification
```

### 3.2 Data Flow

```
Browser → Next.js (port 3000) → apiFetch() → Django REST API (port 8000) → PostgreSQL / Redis
                                     ↑
                              JWT HttpOnly Cookies
                              (auto-refresh on 401)
```

### 3.3 Service Architecture (Docker Compose)

| Service      | Image              | Port  | Depends On         |
| ------------ | ------------------ | ----- | ------------------ |
| `db`         | postgres:15-alpine | 5432  | —                  |
| `redis`      | redis:alpine       | 6379  | —                  |
| `backend`    | ./backend          | 8000  | db (healthy), redis |
| `frontend`   | ./frontend         | 3000  | backend (healthy)  |

### 3.4 Authentication Flow

1. User submits credentials → `POST /api/v1/accounts/auth/login/`
2. Backend sets `synthetix-auth` (access) and `synthetix-refresh` (refresh) as **HttpOnly cookies**
3. Frontend `apiFetch()` sends cookies via `credentials: "include"`
4. On 401 → `apiFetch()` auto-refreshes via `POST /api/v1/accounts/auth/token/refresh/`
5. Google OAuth → `@react-oauth/google` → backend verifies token → issues JWT cookies

### 3.5 Key API Endpoints

| Method | Endpoint                              | Purpose                |
| ------ | ------------------------------------- | ---------------------- |
| GET    | `/health/`                            | Health check           |
| POST   | `/api/v1/accounts/auth/login/`        | Login                  |
| POST   | `/api/v1/accounts/auth/registration/` | Register               |
| POST   | `/api/v1/accounts/auth/token/refresh/`| Refresh JWT            |
| GET    | `/api/v1/catalog/products/`           | List products          |
| GET    | `/api/v1/catalog/products/brands/`    | List brands            |
| GET    | `/api/v1/catalog/categories/`         | List categories        |
| GET    | `/api/v1/orders/cart/`                | Get cart               |
| POST   | `/api/v1/orders/cart/add/`            | Add to cart            |
| POST   | `/api/v1/orders/cart/checkout/`       | Checkout               |
| GET    | `/api/v1/intelligence/`               | AI features            |

---

## 4. Agent Roles & Strict Boundaries

### Role: Backend Agent

**YOU MUST** only modify files inside `backend/`.
**YOU MUST NEVER** touch `frontend/` files.

- Write Django models, views, serializers, and services
- Use `select_related()` / `prefetch_related()` for **every** queryset
- Place reusable business logic in `services.py`, **not** in views
- Use Django's `TextChoices` for all enum fields
- Validate all inputs in serializers — **NEVER** trust client data

### Role: Frontend Agent

**YOU MUST** only modify files inside `frontend/src/`.
**YOU MUST NEVER** touch `backend/` files.

- Use `apiFetch()` from `@/lib/api.ts` for **all** API calls — **NEVER** use raw `fetch()`
- Use `logger` from `@/lib/logger.ts` — **NEVER** use `console.log/warn/error`
- All types go in `@/types/index.ts`
- All API calls go through `@/services/` — **NEVER** put API calls in components
- Use `notificationService` for user feedback — **NEVER** use `alert()`

### Role: Infrastructure Agent

- Modify only `docker-compose.yml`, `Dockerfile`s, `.env.example`, and scripts
- **NEVER** modify application code

### Role: Full-Stack Agent

- May touch both `backend/` and `frontend/`, but **MUST** follow the rules of each domain above

---

## 5. Golden Rules & Token Efficiency

### 🏆 The 10 Golden Rules

| #  | Rule                                                                 |
| -- | -------------------------------------------------------------------- |
| 1  | **READ before you WRITE.** Always read the existing file before editing. |
| 2  | **Minimal changes.** Change only what's needed. Never rewrite entire files. |
| 3  | **No new dependencies** without user approval.                        |
| 4  | **No `console.*`** in frontend. Use `logger` from `@/lib/logger.ts`. |
| 5  | **No hardcoded URLs.** Use `process.env.NEXT_PUBLIC_API_URL` or `settings`. |
| 6  | **No hardcoded secrets.** All secrets go in `.env`.                   |
| 7  | **Types are sacred.** Backend `TextChoices` MUST match `frontend/src/types/index.ts`. |
| 8  | **Optimize queries.** Every `ViewSet.get_queryset()` MUST use `select_related` / `prefetch_related`. |
| 9  | **Validate everything.** All inputs validated in serializers / backend views. |
| 10 | **Test your work.** Verify changes compile and don't break existing functionality. |

### Token Efficiency Commandments

- **YOU MUST** read only the files you need. Do not read the entire codebase.
- **YOU MUST** make surgical edits. Never output unchanged lines.
- **YOU MUST** check if a utility/helper already exists before creating a new one.
- **YOU MUST** reuse existing patterns — look at similar files first.
- **YOU MUST NEVER** duplicate code that exists in `services.py`, `api.ts`, or context providers.

---

## 6. Development Workflows

### 6.1 Adding a New Backend Feature

```
Step 1: Read `core/settings.py` → verify app is in INSTALLED_APPS
Step 2: Read existing `models.py` in the target app → understand the schema
Step 3: Add/modify model → run `python manage.py makemigrations`
Step 4: Add serializer in `serializers.py` (or `auth_serializers.py` for auth)
Step 5: Add view in `views.py` — use ViewSets when possible
Step 6: Register URL in app's `urls.py`
Step 7: Verify: `python manage.py check --deploy`
```

### 6.2 Adding a New Frontend Page

```
Step 1: Read `@/types/index.ts` → check if types exist, add if not
Step 2: Read `@/services/` → check if API service exists, add if not
Step 3: Create page in `src/app/<route>/page.tsx`
Step 4: Use `apiFetch()` via service layer — NEVER raw fetch
Step 5: Use existing components from `@/components/ui/`
Step 6: Add error handling with try/catch + logger + notificationService
Step 7: Verify: `npx tsc --noEmit` (zero errors)
```

### 6.3 Adding a New API Endpoint

```
Step 1: Read the relevant app's `views.py` and `urls.py`
Step 2: Add view function or ViewSet action
Step 3: Add serializer if needed (in the app's `serializers.py`)
Step 4: Register URL pattern in the app's `urls.py`
Step 5: Add corresponding frontend service method
Step 6: Add TypeScript types if new data shapes are introduced
Step 7: Verify both backend and frontend compile
```

### 6.4 Docker Workflow

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Full teardown
docker-compose down -v
```

---

## 7. Common Pitfalls & How to Avoid Them

| Pitfall | Why It Happens | How to Avoid |
| ------- | -------------- | ------------ |
| **Type mismatch** (frontend ↔ backend) | Backend uses `CUSTOMER`, frontend used `customer` | **ALWAYS** check `types/index.ts` matches Django `TextChoices` exactly |
| **N+1 queries** | Forgetting `select_related` | **ALWAYS** add `select_related` / `prefetch_related` to every queryset |
| **Console logging in prod** | Using `console.log` directly | **ALWAYS** use `logger` from `@/lib/logger.ts` |
| **Hardcoded localhost** | Using `http://localhost:8000` | **ALWAYS** use `process.env.NEXT_PUBLIC_API_URL` |
| **Raw fetch calls** | Bypassing `apiFetch()` | **ALWAYS** use `apiFetch()` — it handles JWT refresh automatically |
| **Missing input validation** | Trusting client data | **ALWAYS** validate in serializer or view before processing |
| **Duplicate business logic** | Putting logic in views | **ALWAYS** extract to `services.py` if logic is reusable |
| **Breaking existing imports** | Renaming/moving files | **ALWAYS** search for all usages before renaming |
| **Secret in code** | Hardcoding API keys | **ALWAYS** use `os.environ.get()` or `.env` variables |
| **Missing migration** | Editing models without migrating | **ALWAYS** run `makemigrations` after model changes |

---

## 8. Senior Engineer Coding Standards

### 8.1 Python / Django Standards

```python
# ✅ CORRECT: Service layer pattern
class GoogleAuthService:
    """Encapsulates Google OAuth business logic."""
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify Google OAuth token and return user info."""
        # Implementation here
        pass

# ❌ WRONG: Business logic in views
class GoogleLoginView(APIView):
    def post(self, request):
        # 100 lines of business logic here — NEVER DO THIS
        pass
```

```python
# ✅ CORRECT: Optimized queryset
class ProductViewSet(ModelViewSet):
    def get_queryset(self):
        return Product.objects.select_related(
            "category", "vendor"
        ).prefetch_related(
            "images", "variants", "reviews__user"
        )

# ❌ WRONG: Bare queryset (causes N+1)
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
```

```python
# ✅ CORRECT: Input validation
def add_item(request):
    quantity = request.data.get("quantity", 1)
    if not isinstance(quantity, int) or quantity < 1 or quantity > 999:
        return Response({"error": "Quantity must be 1-999"}, status=400)

# ❌ WRONG: No validation
def add_item(request):
    quantity = request.data.get("quantity")  # Could be anything!
```

**Python Rules:**
- **ALWAYS** use type hints for function parameters and return values
- **ALWAYS** use `gettext_lazy` (`_()`) for model field labels
- **ALWAYS** use `TextChoices` for choice fields, **NEVER** raw tuples
- **ALWAYS** add `db_index=True` on fields used in filters/lookups
- **ALWAYS** use `ATOMIC_REQUESTS = True` (already configured)
- **NEVER** catch bare `except:` — always catch specific exceptions
- **NEVER** use `print()` — use Django's `logging` module

### 8.2 TypeScript / React Standards

```typescript
// ✅ CORRECT: API call through service layer
// services/productService.ts
export const productService = {
  getAll: () => apiFetch<PaginatedResponse<Product>>("/catalog/products/"),
  getBrands: () => apiFetch<string[]>("/catalog/products/brands/"),
};

// ❌ WRONG: Raw fetch in component
const res = await fetch("http://localhost:8000/api/v1/catalog/products/");
```

```typescript
// ✅ CORRECT: Error handling with logger
try {
  const data = await productService.getAll();
  setProducts(data.results);
} catch (error) {
  logger.error("Failed to load products", { error });
  notificationService.error("Could not load products. Please try again.");
}

// ❌ WRONG: console.error and alert
try {
  const data = await fetch(url);
} catch (e) {
  console.error(e);  // NEVER
  alert("Error!");     // NEVER
}
```

**TypeScript/React Rules:**
- **ALWAYS** define types in `@/types/index.ts` — **NEVER** inline type definitions
- **ALWAYS** use `"use client"` directive for client components
- **ALWAYS** handle loading, error, and empty states in every page
- **ALWAYS** use `notificationService` for user-facing feedback
- **NEVER** use `any` type — define proper interfaces
- **NEVER** use `@ts-ignore` or `@ts-expect-error`
- **NEVER** store sensitive data in `localStorage`

### 8.3 CSS / Tailwind Standards

- **USE** the design tokens defined in `tailwind.config.ts` (luxury colors, custom animations)
- **USE** the `clsx` + `tailwind-merge` combo for conditional classes
- **MAINTAIN** the premium dark aesthetic (`#0F0F0F` primary, gold/silver/rose accents)
- **NEVER** use inline styles unless absolutely necessary
- **NEVER** override Tailwind config tokens with hardcoded values

### 8.4 Git & Code Organization

- One logical change per commit
- Keep files under 300 lines — split if larger
- Group imports: stdlib → third-party → local (Python) or external → internal (TypeScript)

---

## 9. Verification & Self-Check Protocol

### Before Submitting ANY Change

Run this mental checklist:

```
□ Did I READ the existing file before modifying it?
□ Does my change follow the existing patterns in this codebase?
□ Did I check types/index.ts for type consistency?
□ Did I use apiFetch() instead of raw fetch? (frontend)
□ Did I use logger instead of console.*? (frontend)
□ Did I add select_related/prefetch_related? (backend querysets)
□ Did I validate all inputs? (backend)
□ Did I use environment variables for URLs/secrets?
□ Did I handle errors with try/catch?
□ Will this compile without TypeScript errors?
□ Will this pass `python manage.py check --deploy`?
□ Did I avoid adding unnecessary dependencies?
□ Did I avoid duplicating existing code?
```

### Backend Verification Commands

```bash
python manage.py check --deploy --fail-level WARNING
python manage.py makemigrations --check --dry-run
python manage.py test
```

### Frontend Verification Commands

```bash
npx tsc --noEmit          # Zero TypeScript errors
npm run build             # Production build succeeds
npx eslint .              # No linting errors
```

### Docker Verification

```bash
docker-compose build      # All images build
docker-compose up -d      # All services start
docker-compose ps         # All services show "Up (healthy)"
curl http://localhost:8000/health/  # Returns {"status": "ok"}
curl http://localhost:3000          # Returns 200 OK
```

---

## 10. Quick Reference

### Environment Variables

| Variable                       | Required | Where Used | Example                          |
| ------------------------------ | -------- | ---------- | -------------------------------- |
| `DJANGO_SECRET_KEY`            | Prod     | Backend    | Random 50+ char string           |
| `DJANGO_DEBUG`                 | Yes      | Backend    | `True` / `False`                 |
| `DATABASE_URL`                 | Docker   | Backend    | `postgres://user:pass@db:5432/synthetix` |
| `REDIS_URL`                    | Docker   | Backend    | `redis://redis:6379/0`           |
| `GEMINI_API_KEY`               | Yes      | Backend    | Google AI API key                |
| `EMAIL_HOST_PASSWORD`          | Yes      | Backend    | Resend API key                   |
| `FRONTEND_URL`                 | Yes      | Backend    | `http://localhost:3000`          |
| `NEXT_PUBLIC_API_URL`          | Yes      | Frontend   | `http://localhost:8000/api/v1`   |
| `NEXT_PUBLIC_SITE_URL`         | Yes      | Frontend   | `http://localhost:3000`          |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes      | Frontend   | Google OAuth client ID           |

### User Roles

| Role       | Backend Enum | Frontend Type | Permissions                     |
| ---------- | ------------ | ------------- | ------------------------------- |
| Customer   | `CUSTOMER`   | `"CUSTOMER"`  | Browse, cart, orders, reviews   |
| Seller     | `SELLER`     | `"SELLER"`    | + Product CRUD, store management |
| Admin      | `ADMIN`      | `"ADMIN"`     | Full access                     |

### Django Apps → Responsibilities

| App            | Responsibility                               |
| -------------- | -------------------------------------------- |
| `accounts`     | Auth, users, profiles, addresses, Google OAuth |
| `catalog`      | Products, categories, variants, reviews, wishlists, stock/price history |
| `orders`       | Cart, cart items, orders, checkout            |
| `intelligence` | Gemini AI integration, style recommendations |
| `core`         | Settings, root URLs, WSGI/ASGI               |

### Import Aliases (Frontend)

| Alias      | Maps To              | Usage                         |
| ---------- | -------------------- | ----------------------------- |
| `@/`       | `frontend/src/`      | All frontend imports          |
| `@/lib/`   | `frontend/src/lib/`  | `api.ts`, `logger.ts`, `utils.ts` |
| `@/types/` | `frontend/src/types/`| Type definitions              |

---

## 11. Maintenance Rules

### When Adding a New Django App

1. Create app with `python manage.py startapp <name>`
2. Add to `USER_APPS` in `core/settings.py`
3. Register URLs in `core/urls.py` under `/api/v1/<name>/`
4. Create `services.py` for business logic
5. Add corresponding frontend service in `frontend/src/services/`

### When Modifying Models

1. **ALWAYS** run `python manage.py makemigrations` after model changes
2. **ALWAYS** add `db_index=True` on filter/lookup fields
3. **ALWAYS** update `frontend/src/types/index.ts` to match
4. **NEVER** delete migrations — create new ones

### When Modifying the API Contract

1. Update backend serializer / view
2. Update `frontend/src/types/index.ts`
3. Update the relevant service in `frontend/src/services/`
4. Update any context providers that consume the data
5. Verify TypeScript compilation: `npx tsc --noEmit`

### File Ownership

| File / Directory               | Owner        | Change Approval |
| ------------------------------ | ------------ | --------------- |
| `core/settings.py`             | Lead         | Required        |
| `docker-compose.yml`           | Infra        | Required        |
| `requirements.txt`             | Backend Lead | Required        |
| `package.json`                 | Frontend Lead| Required        |
| `AGENTS.md`                    | Lead         | Required        |
| `frontend/src/types/index.ts`  | Shared       | Must sync both sides |
| `frontend/src/lib/api.ts`      | Frontend Lead| Required        |

### Documentation Updates

- **ALWAYS** update `AGENTS.md` when architecture changes
- **ALWAYS** update `.env.example` when new env vars are added
- **ALWAYS** update `DOCKER_TESTING.md` when Docker config changes
- **NEVER** leave outdated comments — update or remove them

---

## Last Updated
May 05, 2026
