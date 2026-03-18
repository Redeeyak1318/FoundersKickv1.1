# Auth (Login + Signup) — Connection Analysis

## Files Reviewed

| Layer | File | Status |
|-------|------|--------|
| Frontend | [src/pages/Login.jsx](file:///c:/projects/antifounderskick/src/pages/Login.jsx) | ⚠️ Issues found |
| Frontend | [src/pages/Signup.jsx](file:///c:/projects/antifounderskick/src/pages/Signup.jsx) | ⚠️ Issues found |
| Frontend | [src/lib/supabase.js](file:///c:/projects/antifounderskick/src/lib/supabase.js) | ✅ OK |
| Frontend | [src/services/api.js](file:///c:/projects/antifounderskick/src/services/api.js) | ⚠️ No auth helpers |
| Frontend | [src/App.jsx](file:///c:/projects/antifounderskick/src/App.jsx) | ❌ No auth guard |
| Frontend | [src/components/layout/AppLayout.jsx](file:///c:/projects/antifounderskick/src/components/layout/AppLayout.jsx) | ⚠️ No redirect on unauthenticated |
| Backend | [backend/routes/authRoutes.js](file:///c:/projects/antifounderskick/backend/routes/authRoutes.js) | ✅ OK |
| Backend | [backend/controllers/authController.js](file:///c:/projects/antifounderskick/backend/controllers/authController.js) | ✅ OK |
| Backend | [backend/services/authService.js](file:///c:/projects/antifounderskick/backend/services/authService.js) | ⚠️ Bug in logout |
| Backend | [backend/middleware/authMiddleware.js](file:///c:/projects/antifounderskick/backend/middleware/authMiddleware.js) | ✅ OK |
| Backend | [backend/config/supabaseClient.js](file:///c:/projects/antifounderskick/backend/config/supabaseClient.js) | ✅ OK |
| Backend | [backend/server.js](file:///c:/projects/antifounderskick/backend/server.js) | ⚠️ CORS origin mismatch |
| Database | `profiles` table | ✅ Schema exists |

## Issues Found

### 🔴 Critical Issues

1. **CORS origin mismatch** — Backend [server.js](file:///c:/projects/antifounderskick/backend/server.js) defaults to `http://localhost:5173` but Vite runs on port **3000** (per [vite.config.js](file:///c:/projects/antifounderskick/vite.config.js)). Backend [.env](file:///c:/projects/antifounderskick/.env) also says `CLIENT_URL=http://localhost:5173`. Any frontend→backend API call will be **CORS-blocked**.

2. **No AuthContext / AuthProvider** — There is **no React context** for auth state. Each component fetches auth independently. [AppLayout](file:///c:/projects/antifounderskick/src/components/layout/AppLayout.jsx#25-147) fetches user inline but doesn't redirect if unauthenticated. No shared auth state exists across the app.

3. **No route protection** — [App.jsx](file:///c:/projects/antifounderskick/src/App.jsx) has no `<ProtectedRoute>` wrapper. Any route like `/dashboard`, `/messages`, etc. is accessible without login. Unauthenticated users see broken pages.

4. **Signup doesn't create a profile row** — After `supabase.auth.signUp()`, the `profiles` table needs a row with the user's [id](file:///c:/projects/antifounderskick/backend/middleware/authMiddleware.js#3-35) (FK to `auth.users.id`). Currently signup just calls Supabase Auth and navigates — **no profile row is created**. Every subsequent page that queries `profiles` will get empty/null data.

5. **Backend logout uses wrong API** — `authService.logout()` calls `supabaseAdmin.auth.admin.signOut(token)` but the [Admin API's `signOut`](https://supabase.com/docs/reference/javascript/auth-admin-signout) doesn't exist as shown. The correct admin method is `supabaseAdmin.auth.admin.deleteUser()` for deleting, or for session revocation you need a different approach.

### 🟡 Medium Issues

6. **No frontend → backend auth helper** — [api.js](file:///c:/projects/antifounderskick/src/services/api.js) only has Supabase-direct calls. There's no helper function that hits the Express backend with the Bearer token (e.g., for `/api/auth/session` or `/api/auth/logout`). The backend auth endpoints exist but are never called.

7. **Forgot password link is dead** — [Login.jsx](file:///c:/projects/antifounderskick/src/pages/Login.jsx) has `<a href="#">Forgot password?</a>` — it does nothing. Should call `supabase.auth.resetPasswordForEmail()`.

8. **Google OAuth redirectTo mismatch** — Frontend sends `redirectTo: window.location.origin + "/dashboard"` which resolves to `http://localhost:3000/dashboard`. This needs to be registered in Supabase Auth → URL Configuration → Redirect URLs.

## Fixes to Apply

1. Fix backend `CLIENT_URL` to match Vite port 3000
2. Create `AuthContext` + `AuthProvider` 
3. Create `ProtectedRoute` component
4. Wire up App.jsx with auth protection
5. Fix Signup to auto-create profile row after auth
6. Fix backend `authService.logout()` 
7. Add frontend auth API helpers (session check, logout via backend)
8. Implement forgot password flow
9. Wire AppLayout to redirect when unauthenticated
