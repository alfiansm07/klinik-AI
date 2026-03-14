# AGENTS.md — apps/web/src/lib

Auth, RBAC, tenant context, and navigation helpers. Cross-cutting logic for the web app.

## Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `auth-helpers.ts` | Session resolution + auth guards | `getAuthContext()` (cached), `requireAuth()`, `requireClinicAccess()`, `requireRole()`, `requireModuleAccess()`, `getPageAuthContext()` |
| `rbac.ts` | Role-based access control matrix | `hasModuleAccess()`, `hasRoleLevel()`, roles enum, modules enum |
| `tenant-context.ts` | Active clinic membership picker | `pickActiveMembership()` |
| `route-access.ts` | Route protection classification | `getRouteAccess()`, protected route prefixes |
| `auth-client.ts` | Better-Auth client instance | `authClient` (browser-side) |
| `app-navigation.ts` | Sidebar nav items | `getNavigationItems()` — 3 groups, role-filtered |
| `utils.ts` | Tailwind `cn()` helper | `cn()` |

## Conventions

- **`getAuthContext()`**: Cached via React `cache()`. Call freely in server components — deduped per request.
- **Auth guard chain**: `requireAuth()` → `requireClinicAccess()` → `requireRole()` / `requireModuleAccess()`. Throws redirect on failure.
- **RBAC model**: 7 roles (superadmin, owner, admin, doctor, nurse, pharmacist, cashier). 9 modules. Access matrix in `rbac.ts`.
- **Tenant resolution**: `pickActiveMembership()` selects first membership. No clinic switcher UI yet.
- **Route classification**: `getRouteAccess()` returns `{ protected, authOnly }` based on prefix matching.
- **Navigation**: Items grouped (main/operations/management), filtered by role via `hasModuleAccess()`.

## Anti-Patterns

- Calling `getAuthContext()` on the client — server-only (uses `headers()`, `cache()`).
- Bypassing auth guard chain with direct DB session queries in pages.
- Hardcoding role checks instead of using `hasModuleAccess()` / `hasRoleLevel()`.
- Duplicating route protection logic outside `route-access.ts`.

## Notes

- 4 test files exist (`*.test.ts`) but no test runner is configured.
- `auth-client.ts` is the ONLY file here used client-side.
- All auth guards redirect (not throw errors) — use in server components at page level.
