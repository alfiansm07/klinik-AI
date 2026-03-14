# 7. Arsitektur Frontend

[< Kembali ke Index](./README.md)

---

## Component Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public landing + auth pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── login/
│   ├── (app)/                    # Authenticated app layout group
│   │   ├── layout.tsx            # Sidebar + header shell
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── emr/
│   │   ├── pharmacy/
│   │   ├── cashier/
│   │   ├── master/
│   │   └── reports/
│   └── api/

### Current Implementation Status (2026-03-07)

- `app/layout.tsx` now only provides root HTML/body/providers concerns.
- Route groups are now active:
  - `(public)` for landing page and login
  - `(app)` for authenticated application pages such as dashboard
- Auth flow is already split into:
  - server login page wrapper in `app/(public)/login/page.tsx`
  - client login UI in `app/login/login-view.tsx`
- Shared frontend auth primitives now exist in `lib/`:
  - `auth-client.ts`
  - `auth-helpers.ts`
  - `rbac.ts`
  - `tenant-context.ts`
  - `route-access.ts`
- Protected application shell now exists with:
  - `components/layout/app-shell.tsx`
  - `components/layout/app-header.tsx`
  - `components/layout/app-sidebar.tsx`
  - role-aware nav model in `lib/app-navigation.ts`
├── components/
│   ├── ui/                       # shadcn/ui primitives (Button, Input, etc.)
│   ├── forms/                    # Reusable form components
│   ├── tables/                   # Data table components
│   ├── layout/                   # Sidebar, Header, Breadcrumb
│   └── domain/                   # Domain-specific components
│       ├── patient/              # PatientCard, PatientSearch, etc.
│       ├── emr/                  # SOAPForm, VitalSignsInput, etc.
│       ├── pharmacy/             # PrescriptionCard, StockTable, etc.
│       └── queue/                # QueueBoard, QueueTicket, etc.
├── lib/
│   ├── auth-client.ts            # Better-Auth client hooks
│   ├── utils.ts                  # cn() and common utilities
│   ├── constants.ts              # App-wide constants
│   └── hooks/                    # Custom React hooks
└── types/                        # Shared TypeScript types
```

## Rendering Strategy

| Komponen | Rendering | Alasan |
|---|---|---|
| Layout (Sidebar, Header) | Server Component | Static structure, session data |
| Data Tables (Patient list, etc.) | Server Component + Suspense | Initial data loaded server-side |
| Forms (SOAP, Registration) | Client Component | Interactivity, real-time validation |
| Queue Display | Client Component + Polling/SSE | Real-time updates |
| Dashboard Charts | Client Component (lazy-loaded) | Interactive charts, heavy JS |
| Print Views (Struk, Surat) | Server Component | Print-optimized, no JS needed |

## State Management Strategy

| State Type | Solution | Scope |
|---|---|---|
| **Server State** | React Server Components (direct DB access) | Page-level |
| **Auth State** | `authClient.useSession()` (Better-Auth) | Global |
| **Form State** | `@tanstack/react-form` + Zod | Component-level |
| **UI State** | React `useState` / `useReducer` | Component-level |
| **Theme State** | `next-themes` (ThemeProvider) | Global |
| **URL State** | `useSearchParams()`, `usePathname()` | Page-level |
| **Toast State** | Sonner (imperative API) | Global |

> **Catatan:** Tidak ada global state management library (Redux, Zustand, dll.) yang diperlukan untuk Fase 1. Server Components dan React 19 patterns sudah mencukupi. Jika kebutuhan client-side state menjadi kompleks, pertimbangkan Zustand.

### Current Frontend Foundation Notes

- Current auth guard strategy is hybrid:
  - middleware for coarse route gating on protected paths
  - server page helpers for real session validation and tenant/RBAC checks
- `web` package now has an explicit `check-types` script for frontend verification.
- Dashboard currently supports an MVP fallback state for authenticated users without an active clinic membership inside the authenticated app shell.
- The next frontend milestone is no longer the shell itself, but the first business pages that plug into it, starting with patient registry and registration flow.
