# Auth Guard, RBAC, and Tenant Context Implementation Plan

**Goal:** Add one consistent auth foundation for the Next.js app so protected routes, server pages, and future Server Actions can resolve the logged-in user, active clinic membership, and allowed module access without duplicating auth logic.

**Architecture:** Keep Better Auth in `@klinik-AI/auth` as the only authentication provider. Build thin app-layer helpers in `apps/web` for role rules, tenant membership selection, and server-side auth context, then use Next middleware only for coarse guest-vs-authenticated redirects while keeping final RBAC and tenant checks in server helpers and page code.

**Tech Stack:** Next.js App Router, Better Auth, Drizzle ORM, PostgreSQL, Bun test, TypeScript, existing workspace packages `@klinik-AI/auth`, `@klinik-AI/db`, `@klinik-AI/env`

---

## Preconditions

- Do not add new dependencies.
- Reuse `@klinik-AI/auth` for session lookup and `@klinik-AI/db` for membership lookup.
- Follow ARD security matrix in `docs/ard/05-security.md` and Server Action pattern in `docs/ard/06-api-routing.md`.
- Keep middleware lightweight; middleware is not the final source of truth for role or tenant safety.
- MVP rule for multi-clinic users: auto-pick the first active `clinic_member` row.
- If a logged-in user has no active clinic membership yet, do not silently grant clinic access.

---

### Task 1: Add RBAC Core Utilities

**Files:**
- Create: `apps/web/src/lib/rbac.ts`
- Test: `apps/web/src/lib/rbac.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, test } from "bun:test";

import { canAccessModule, hasAnyRole } from "./rbac";

describe("rbac", () => {
  test("receptionist can access registration", () => {
    expect(canAccessModule("receptionist", "registration")).toBe(true);
  });

  test("cashier cannot access emr", () => {
    expect(canAccessModule("cashier", "emr")).toBe(false);
  });

  test("admin matches one of many roles", () => {
    expect(hasAnyRole("admin", ["doctor", "admin"])).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/web/src/lib/rbac.test.ts`

Expected: FAIL with module-not-found for `./rbac`.

**Step 3: Write minimal implementation**

```ts
export const APP_ROLES = [
  "superadmin",
  "admin",
  "receptionist",
  "nurse",
  "doctor",
  "pharmacist",
  "cashier",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const APP_MODULES = [
  "dashboard",
  "master",
  "patients",
  "registration",
  "queue",
  "emr",
  "pharmacy",
  "cashier",
  "reports",
] as const;

export type AppModule = (typeof APP_MODULES)[number];

const MODULE_ACCESS: Record<AppRole, readonly AppModule[]> = {
  superadmin: ["dashboard", "master", "reports"],
  admin: [
    "dashboard",
    "master",
    "patients",
    "registration",
    "queue",
    "emr",
    "pharmacy",
    "cashier",
    "reports",
  ],
  receptionist: ["dashboard", "master", "patients", "registration", "queue", "reports"],
  nurse: ["dashboard", "master", "patients", "queue", "emr"],
  doctor: ["dashboard", "master", "patients", "queue", "emr", "reports"],
  pharmacist: ["dashboard", "master", "patients", "pharmacy", "reports"],
  cashier: ["dashboard", "master", "patients", "cashier", "reports"],
};

export function hasAnyRole(role: AppRole, allowedRoles: readonly AppRole[]) {
  return allowedRoles.includes(role);
}

export function canAccessModule(role: AppRole, module: AppModule) {
  return MODULE_ACCESS[role].includes(module);
}
```

**Step 4: Run test to verify it passes**

Run: `bun test apps/web/src/lib/rbac.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/lib/rbac.ts apps/web/src/lib/rbac.test.ts
git commit -m "feat: add RBAC module access helpers"
```

---

### Task 2: Add Tenant Membership Selection Helpers

**Files:**
- Create: `apps/web/src/lib/tenant-context.ts`
- Test: `apps/web/src/lib/tenant-context.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, test } from "bun:test";

import { pickActiveMembership } from "./tenant-context";

describe("tenant-context", () => {
  test("picks the first active membership", () => {
    const membership = pickActiveMembership([
      { id: "m1", clinicId: "c1", role: "doctor", isActive: false },
      { id: "m2", clinicId: "c2", role: "admin", isActive: true },
      { id: "m3", clinicId: "c3", role: "cashier", isActive: true },
    ]);

    expect(membership?.id).toBe("m2");
  });

  test("returns null when no active membership exists", () => {
    const membership = pickActiveMembership([
      { id: "m1", clinicId: "c1", role: "doctor", isActive: false },
    ]);

    expect(membership).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/web/src/lib/tenant-context.test.ts`

Expected: FAIL with module-not-found for `./tenant-context`.

**Step 3: Write minimal implementation**

```ts
import type { AppRole } from "./rbac";

export type ClinicMembership = {
  id: string;
  clinicId: string;
  role: AppRole;
  isActive: boolean;
};

export function pickActiveMembership(memberships: readonly ClinicMembership[]) {
  return memberships.find((membership) => membership.isActive) ?? null;
}
```

**Step 4: Run test to verify it passes**

Run: `bun test apps/web/src/lib/tenant-context.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/lib/tenant-context.ts apps/web/src/lib/tenant-context.test.ts
git commit -m "feat: add tenant membership selection helper"
```

---

### Task 3: Build Server Auth Context Helpers

**Files:**
- Create: `apps/web/src/lib/auth-helpers.ts`
- Modify: `apps/web/src/app/dashboard/page.tsx`

**Step 1: Write the failing type-safe usage target**

Replace the manual session lookup in `apps/web/src/app/dashboard/page.tsx` with the intended API below so the file fails until `auth-helpers.ts` exists.

```ts
import { getPageAuthContext } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  const context = await getPageAuthContext();

  return <div>Welcome {context.session.user.name}</div>;
}
```

**Step 2: Run type-check to verify it fails**

Run: `bun run check-types`

Expected: FAIL because `@/lib/auth-helpers` and `getPageAuthContext` do not exist.

**Step 3: Write minimal implementation**

```ts
import "server-only";

import { auth } from "@klinik-AI/auth";
import { db } from "@klinik-AI/db";
import { clinic, clinicMember } from "@klinik-AI/db/schema/tenant";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { canAccessModule, hasAnyRole, type AppModule, type AppRole } from "./rbac";
import { pickActiveMembership } from "./tenant-context";

export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

export type AuthContext = {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  activeMembership: {
    id: string;
    clinicId: string;
    role: AppRole;
    clinicName: string;
  } | null;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return null;
  }

  const memberships = await db
    .select({
      id: clinicMember.id,
      clinicId: clinicMember.clinicId,
      role: clinicMember.role,
      isActive: clinicMember.isActive,
      clinicName: clinic.name,
    })
    .from(clinicMember)
    .innerJoin(clinic, eq(clinicMember.clinicId, clinic.id))
    .where(
      and(
        eq(clinicMember.userId, session.user.id),
        eq(clinicMember.isActive, true),
        eq(clinic.isActive, true),
      ),
    )
    .orderBy(asc(clinicMember.createdAt));

  const activeMembership = pickActiveMembership(memberships);

  return {
    session,
    activeMembership: activeMembership
      ? {
          id: activeMembership.id,
          clinicId: activeMembership.clinicId,
          role: activeMembership.role,
          clinicName: activeMembership.clinicName,
        }
      : null,
  };
}

export async function requireAuth() {
  const context = await getAuthContext();

  if (!context) {
    throw new UnauthorizedError("UNAUTHORIZED");
  }

  return context;
}

export function requireClinicAccess(context: AuthContext) {
  if (!context.activeMembership) {
    throw new ForbiddenError("NO_ACTIVE_CLINIC_MEMBERSHIP");
  }

  return context.activeMembership;
}

export function requireRole(context: AuthContext, allowedRoles: readonly AppRole[]) {
  const membership = requireClinicAccess(context);

  if (!hasAnyRole(membership.role, allowedRoles)) {
    throw new ForbiddenError("FORBIDDEN");
  }

  return context;
}

export function requireModuleAccess(context: AuthContext, module: AppModule) {
  const membership = requireClinicAccess(context);

  if (!canAccessModule(membership.role, module)) {
    throw new ForbiddenError("FORBIDDEN");
  }

  return context;
}

export async function getPageAuthContext(module?: AppModule) {
  const context = await getAuthContext();

  if (!context) {
    redirect("/login");
  }

  if (module) {
    requireModuleAccess(context, module);
  }

  return context;
}
```

Notes for this task:
- `requireAuth()` and `requireRole()` stay throw-based for future Server Actions.
- `getPageAuthContext()` stays redirect-based for server pages.
- Do not accept `clinicId` from the client; use `context.activeMembership?.clinicId` only.

**Step 4: Run type-check to verify it passes**

Run: `bun run check-types`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/lib/auth-helpers.ts apps/web/src/app/dashboard/page.tsx
git commit -m "feat: add server auth context helpers"
```

---

### Task 4: Add Route Classification Helpers and Middleware

**Files:**
- Create: `apps/web/src/lib/route-access.ts`
- Create: `apps/web/src/lib/route-access.test.ts`
- Create: `apps/web/src/middleware.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, test } from "bun:test";

import { getRouteAccess } from "./route-access";

describe("route-access", () => {
  test("marks dashboard as protected", () => {
    expect(getRouteAccess("/dashboard")).toEqual({ protected: true, authOnly: false });
  });

  test("marks login as auth-only public route", () => {
    expect(getRouteAccess("/login")).toEqual({ protected: false, authOnly: true });
  });

  test("ignores public landing page", () => {
    expect(getRouteAccess("/")).toEqual({ protected: false, authOnly: false });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/web/src/lib/route-access.test.ts`

Expected: FAIL with module-not-found for `./route-access`.

**Step 3: Write minimal implementation**

```ts
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/patients",
  "/registration",
  "/queue",
  "/emr",
  "/pharmacy",
  "/cashier",
  "/master",
  "/reports",
] as const;

const AUTH_ONLY_PATHS = ["/login"] as const;

export function getRouteAccess(pathname: string) {
  const authOnly = AUTH_ONLY_PATHS.includes(pathname as (typeof AUTH_ONLY_PATHS)[number]);
  const protectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return {
    protected: protectedRoute,
    authOnly,
  };
}
```

Then create `apps/web/src/middleware.ts`:

```ts
import { auth } from "@klinik-AI/auth";
import { NextResponse, type NextRequest } from "next/server";

import { getRouteAccess } from "@/lib/route-access";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const route = getRouteAccess(pathname);

  if (!route.protected && !route.authOnly) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const isAuthenticated = Boolean(session?.user);

  if (route.protected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (route.authOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
```

Notes for this task:
- Middleware only answers guest-vs-authenticated redirects.
- Keep final tenant and role checks in `auth-helpers.ts`.
- If Better Auth session lookup in middleware has runtime issues, keep the helper functions and switch middleware to cookie-presence fallback in a follow-up patch rather than moving RBAC into middleware.

**Step 4: Run tests and type-check**

Run:
- `bun test apps/web/src/lib/route-access.test.ts`
- `bun run check-types`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/lib/route-access.ts apps/web/src/lib/route-access.test.ts apps/web/src/middleware.ts
git commit -m "feat: add route guard middleware"
```

---

### Task 5: Adopt the Helpers in Dashboard Page

**Files:**
- Modify: `apps/web/src/app/dashboard/page.tsx`
- Modify: `apps/web/src/app/dashboard/dashboard.tsx`

**Step 1: Write the failing usage target**

Replace the current page implementation so the page requires authenticated access through the shared helper and shows a clear fallback when the user is logged in but has no active clinic membership.

```ts
const context = await getPageAuthContext();

if (!context.activeMembership) {
  return <p>No active clinic membership found.</p>;
}

requireModuleAccess(context, "dashboard");
```

**Step 2: Run type-check to verify any missing imports or bad props fail**

Run: `bun run check-types`

Expected: FAIL until `dashboard/page.tsx` and `dashboard/dashboard.tsx` use the new types correctly.

**Step 3: Write minimal implementation**

```ts
import { getPageAuthContext, requireModuleAccess } from "@/lib/auth-helpers";

import Dashboard from "./dashboard";

export default async function DashboardPage() {
  const context = await getPageAuthContext();

  if (!context.activeMembership) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome {context.session.user.name}</p>
        <p>No active clinic membership found. Add a `clinic_member` record to continue.</p>
      </div>
    );
  }

  requireModuleAccess(context, "dashboard");

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {context.session.user.name}</p>
      <p>Clinic: {context.activeMembership.clinicName}</p>
      <Dashboard session={context.session} />
    </div>
  );
}
```

Keep `apps/web/src/app/dashboard/dashboard.tsx` dumb and client-only; remove anything unused, but do not add new global state.

**Step 4: Run type-check to verify it passes**

Run: `bun run check-types`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx apps/web/src/app/dashboard/dashboard.tsx
git commit -m "feat: apply shared auth guard to dashboard"
```

---

### Task 6: Verify End-to-End Behavior

**Files:**
- No code changes

**Step 1: Prepare database and dev server**

Run:
- `bun run db:start`
- `bun run dev:web`

Expected:
- PostgreSQL container is running
- Next dev server starts on `http://localhost:3001`

**Step 2: Prepare membership test data**

In Drizzle Studio, ensure the signed-in user has:
- one `clinic` row with `is_active = true`
- one `clinic_member` row pointing to that clinic and user with `is_active = true`

If you want to verify the no-membership fallback first, skip creating `clinic_member` temporarily.

**Step 3: Verify guest protection**

Manual checks:
- Open `http://localhost:3001/dashboard`
- Expected: redirected to `/login`

**Step 4: Verify authenticated redirect**

Manual checks:
- Sign in successfully
- Open `http://localhost:3001/login`
- Expected: redirected to `/dashboard`

**Step 5: Verify tenant and role behavior**

Manual checks:
- With no active membership, dashboard shows the fallback message
- With one active membership, dashboard renders clinic name
- After adding a future protected module page, call `requireModuleAccess(context, "<module>")` in that page before rendering data

**Step 6: Run final verification commands**

Run:
- `bun test apps/web/src/lib/rbac.test.ts`
- `bun test apps/web/src/lib/tenant-context.test.ts`
- `bun test apps/web/src/lib/route-access.test.ts`
- `bun run check-types`

Expected: PASS on all commands.

**Step 7: Commit**

```bash
git add apps/web/src/lib apps/web/src/middleware.ts apps/web/src/app/dashboard/page.tsx apps/web/src/app/dashboard/dashboard.tsx
git commit -m "feat: add auth guard and tenant-aware access foundation"
```

---

## Notes for the Implementer

- Do not move Better Auth configuration out of `packages/auth/src/index.ts`.
- Do not add a new auth state library.
- Do not put `clinicId` in client-controlled inputs.
- Use `requireAuth()` and `requireRole()` in future Server Actions.
- Use `getPageAuthContext()` in server pages.
- Add more module routes later by reusing `requireModuleAccess(context, "module")`.
- Keep the first implementation intentionally small; clinic switching, onboarding, and platform-level superadmin UX can come later.
