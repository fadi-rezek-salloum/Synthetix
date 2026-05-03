# Synthetix Project Architecture & Context

This document serves as a persistent knowledge base for the Synthetix project. It outlines the technology stack, architectural decisions, completed features, and known configurations to prevent AI assistants from needing to read the entire codebase from scratch.

## Technology Stack
- **Backend**: Django 6.0.4, Django REST Framework, PostgreSQL, Redis (for caching/celery if needed).
- **Frontend**: Next.js 14+ (App Router), React, TailwindCSS, Framer Motion, TypeScript.
- **Authentication**: `dj-rest-auth` (with SimpleJWT), Google OAuth 2.0 (`@react-oauth/google`), HttpOnly Cookies.
- **Infrastructure**: Docker Compose (backend, frontend, db, redis).

## Core Architecture Decisions

### 1. Authentication Flow (High Security)
- **Strategy**: Single Page Application (SPA) authenticating against an external API using **HttpOnly Cookies**.
- **Backend Configuration**: 
  - `dj-rest-auth` configured with `USE_JWT = True` and `JWT_AUTH_COOKIE = 'synthetix-auth'`.
  - Django uses `dj_rest_auth.jwt_auth.JWTCookieAuthentication` instead of the default header-based JWT authentication. This allows Django to natively read the HttpOnly cookies sent by the browser.
  - **CORS**: Strict CORS is enforced. `CORS_ALLOW_CREDENTIALS = True` is paired with explicitly defined `CORS_ALLOWED_ORIGINS` (localhost:3000). Wildcards (`CORS_ALLOW_ALL_ORIGINS`) are disabled to satisfy browser security requirements for credentialed requests.
- **Frontend Configuration**:
  - `apiFetch` utility (`frontend/src/lib/api.ts`) automatically attaches `credentials: "include"` to every request and features an automatic silent token refresh interceptor.
  - **Google OAuth**: Handled entirely on the client-side using `@react-oauth/google`. The popup retrieves an `access_token` from Google, which is POSTed to the Django backend. Django validates the token, registers/logs in the user, and sets the secure session cookies.

### 2. Frontend Layout & State
- **State Management**: A global `AuthContext` tracks the user session. It is completely decoupled from the Next.js `router` dependency to prevent infinite re-fetching loops during navigation.
- **UI System**: Premium Glassmorphism. The application relies on unified components like the global `Header.tsx` wrapped at the root `layout.tsx` level.
- **Route Protection**: Next.js client-side route guards (via `useEffect`) protect private routes and actively redirect logged-in users away from onboarding flows (e.g., `/auth/login`, `/auth/register`).

### 3. Database & Models
- Custom User Model (`accounts.User`) with roles (Customer, Seller).
- Signals automatically generate `CustomerProfile` or `SellerProfile` upon user registration based on the selected role.
- Catalog application managing Categories, Products, Variants, Images, Reviews, and Stock Logs.

## Current State & Completed Milestones
- [x] Complete database containerization.
- [x] Custom User model and profile generation.
- [x] Email sending configurations (`resend`).
- [x] Full JWT Authentication flow (Login, Register, Logout, Password Reset, Email Verification).
- [x] Next.js Context API integration with automatic token refreshing.
- [x] Native React-Side Google OAuth integration.
- [x] Resolution of CORS conflicts and infinite looping bugs.
- [x] Global unified Glassmorphism Header with animated `UserMenu`.

## Notes for Future Development
- **New Features**: When building out the "Intelligence" (AI Curations) or "Seller Dashboards", ensure all requests utilize `apiFetch` to inherit the cookie-based authentication.
- **Styling**: Stick to Tailwind CSS with Framer Motion. Avoid generic colors; use `zinc` scales and `indigo/purple` gradients for the premium feel. Always maintain the `glass` utility class patterns for depth.
