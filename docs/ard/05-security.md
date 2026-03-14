# 5. Arsitektur Keamanan & Otorisasi

[< Kembali ke Index](./README.md)

---

## Authentication Flow

```
  [Browser]                    [Next.js Server]               [PostgreSQL]
      |                              |                              |
      |-- POST /api/auth/sign-in --> |                              |
      |                              |-- Query user + account ----->|
      |                              |<-- Return user data ---------|
      |                              |-- Create session ----------->|
      |                              |<-- Session created ----------|
      |<-- Set-Cookie (session) ---- |                              |
      |                              |                              |
      |-- GET /dashboard ----------> |                              |
      |   (Cookie: Better-Auth)      |-- Validate session --------->|
      |                              |<-- Session + User -----------|
      |<-- Render page (SSR) ------ |                              |
```

## Authentication Stack

| Komponen | Teknologi | Detail |
|---|---|---|
| **Library** | Better-Auth v1.5.2 | Session-based authentication |
| **Session Storage** | PostgreSQL (`session` table) | Server-side sessions, cookie-based |
| **Password Hashing** | Better-Auth internal (bcrypt/argon2) | Stored in `account.password` |
| **Cookie Management** | `nextCookies()` plugin | HttpOnly, Secure, SameSite cookies |
| **CORS** | `trustedOrigins` config | Configured via `CORS_ORIGIN` env var |

---

## Role-Based Access Control (RBAC)

### Roles

| Role | Kode | Level |
|---|---|---|
| Superadmin SaaS | `superadmin` | Platform-level |
| Admin / Manajer Klinik | `admin` | Clinic-level |
| Pendaftaran / Resepsionis | `receptionist` | Clinic-level |
| Perawat / Bidan | `nurse` | Clinic-level |
| Dokter | `doctor` | Clinic-level |
| Apoteker | `pharmacist` | Clinic-level |
| Kasir | `cashier` | Clinic-level |

### Authorization Matrix

| Modul / Aksi | Superadmin | Admin | Resepsionis | Perawat | Dokter | Apoteker | Kasir |
|---|---|---|---|---|---|---|---|
| **Tenant Management** | CRUD | - | - | - | - | - | - |
| **Master Data** | R | CRUD | R | R | R | R | R |
| **Patient Registration** | - | CRUD | CRUD | R | R | R | R |
| **Queue Management** | - | R | CRUD | R | R | R | - |
| **Vital Signs (Asesmen)** | - | R | - | CRUD | R | - | - |
| **EMR / SOAP** | - | R | - | R | CRUD | - | - |
| **E-Prescription** | - | R | - | - | CRUD | R | - |
| **Pharmacy / Dispensing** | - | R | - | - | R | CRUD | - |
| **Billing / Payment** | - | R | - | - | - | - | CRUD |
| **Reports** | R | CRUD | R (limited) | - | R (own) | R (pharmacy) | R (cashier) |

### Implementation Strategy

```typescript
// Hybrid authorization check pattern
// packages/auth remains the Better-Auth source of truth

// 1. clinic_member table stores user-clinic-role mapping
// 2. Middleware only does coarse route gating (guest vs protected route)
// 3. Server helpers resolve session -> clinic_member -> clinic context
// 4. Each Server Component / Server Action declares required permission
// 5. Helper: requireRole("doctor", "admin") throws 403 if not authorized

type Permission = {
  module: string;      // e.g., "emr", "pharmacy", "billing"
  action: "create" | "read" | "update" | "delete";
};

// Permission check applied at:
// - API Route handlers (route.ts)
// - Server Actions
// - Server Components (conditional rendering)
// - Client Components (UI-level hiding via session data)
```

### Current Implementation Status (2026-03-07)

- Better-Auth session flow is active in `packages/auth/src/index.ts` and consumed by `apps/web`.
- App-layer auth helpers now exist in `apps/web/src/lib/auth-helpers.ts`:
  - `getAuthContext()`
  - `requireAuth()`
  - `requireClinicAccess()`
  - `requireRole()`
  - `requireModuleAccess()`
  - `getPageAuthContext()`
- Current tenant context strategy for MVP is clinic-level and implicit: resolve active `clinic_member` rows, order by `created_at`, and auto-pick the first active membership.
- `apps/web/src/middleware.ts` currently protects app routes using Better-Auth session cookie presence only; full session validation and RBAC stay enforced in server pages/helpers.
- `/login` now performs server-side session validation before redirecting authenticated users to `/dashboard`, which avoids stale-cookie redirect loops.
- Authenticated routes now live under a shared app shell route group, while public routes stay separated from protected application routes.
- Current implementation covers module-level RBAC first; action-level permission objects remain the intended next layer for future Server Actions.

---

## Data Security

| Aspek | Strategi |
|---|---|
| **Data Isolation** | `clinic_id` filter pada setiap query (enforced di ORM helper layer) |
| **Sensitive Data** | Password di-hash; data medis dienkripsi at-rest (database-level encryption) |
| **Audit Trail** | `created_at`, `updated_at`, `created_by`, `updated_by` pada tabel transaksional |
| **Session Security** | HttpOnly cookies, short-lived sessions, IP/User-Agent tracking |
| **Input Validation** | Zod schemas pada setiap endpoint dan Server Action |
| **CORS** | Strict origin checking via `trustedOrigins` |
| **Environment Secrets** | Validated via `@t3-oss/env`, never exposed to client bundle |
