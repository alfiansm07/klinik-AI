# Authenticated App Shell Implementation Plan

**Goal:** Build the first authenticated application shell so protected routes share one role-aware layout, public auth pages are separated from app pages, and future domain modules can plug into a stable structure.

**Architecture:** Keep the current auth/RBAC/tenant helpers as the foundation and reorganize the App Router into `(public)` and `(app)` route groups. Use a server-rendered authenticated layout for shell structure and role-aware navigation, while keeping interactive pieces like theme toggle and user menu as small client islands.

**Tech Stack:** Next.js App Router, React 19, Better Auth, Drizzle ORM, Tailwind CSS v4, shadcn/ui primitives already in repo, Bun, TypeScript

---

## Preconditions

- Do not add new dependencies.
- Reuse `apps/web/src/lib/auth-helpers.ts`, `apps/web/src/lib/rbac.ts`, and existing UI primitives/components.
- Preserve current auth flow behavior from `docs/ard/05-security.md` and current frontend status in `docs/ard/07-frontend.md`.
- Keep scope intentionally small: layout, navigation, route groups, dashboard placement. Do not start patient registry in this plan.
- Preserve the current MVP fallback for authenticated users without active clinic membership.

---

### Task 1: Add Navigation Model for Authenticated Shell

**Files:**
- Create: `apps/web/src/lib/app-navigation.ts`
- Test: `apps/web/src/lib/app-navigation.test.ts`

**Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getVisibleNavItems } from "./app-navigation";

describe("app-navigation", () => {
  test("receptionist sees patient and registration links", () => {
    const items = getVisibleNavItems("receptionist");

    assert.equal(items.some((item) => item.href === "/patients"), true);
    assert.equal(items.some((item) => item.href === "/registration"), true);
  });

  test("cashier does not see emr link", () => {
    const items = getVisibleNavItems("cashier");

    assert.equal(items.some((item) => item.href === "/emr"), false);
  });

  test("no role only sees dashboard link", () => {
    const items = getVisibleNavItems();

    assert.deepEqual(items.map((item) => item.href), ["/dashboard"]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/web/src/lib/app-navigation.test.ts`

Expected: FAIL with module-not-found for `./app-navigation`.

**Step 3: Write minimal implementation**

```ts
import { canAccessModule, type AppRole } from "./rbac";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", module: "dashboard" },
  { href: "/patients", label: "Patients", module: "patients" },
  { href: "/registration", label: "Registration", module: "registration" },
  { href: "/queue", label: "Queue", module: "queue" },
  { href: "/emr", label: "EMR", module: "emr" },
  { href: "/pharmacy", label: "Pharmacy", module: "pharmacy" },
  { href: "/cashier", label: "Cashier", module: "cashier" },
  { href: "/master", label: "Master Data", module: "master" },
  { href: "/reports", label: "Reports", module: "reports" },
 ] as const;

export type AppNavItem = (typeof NAV_ITEMS)[number];

export function getVisibleNavItems(role?: AppRole) {
  if (!role) {
    return NAV_ITEMS.filter((item) => item.href === "/dashboard");
  }

  return NAV_ITEMS.filter((item) => canAccessModule(role, item.module));
}
```

**Step 4: Run test to verify it passes**

Run: `bun test apps/web/src/lib/app-navigation.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/lib/app-navigation.ts apps/web/src/lib/app-navigation.test.ts
git commit -m "feat: add authenticated shell navigation model"
```

---

### Task 2: Create Shared Authenticated Layout Components

**Files:**
- Create: `apps/web/src/components/layout/app-sidebar.tsx`
- Create: `apps/web/src/components/layout/app-header.tsx`
- Create: `apps/web/src/components/layout/app-shell.tsx`

**Step 1: Write the failing type-safe usage target**

Create `apps/web/src/components/layout/app-shell.tsx` usage that expects these props:

```ts
type AppShellProps = {
  userName: string;
  clinicName?: string;
  role?: AppRole;
  children: React.ReactNode;
};
```

Then make the future layout import it so type-check fails until the components exist.

**Step 2: Run type-check to verify it fails**

Run: `bun run check-types`

Expected: FAIL because `@/components/layout/app-shell` does not exist.

**Step 3: Write minimal implementation**

- `app-sidebar.tsx`
  - server-safe presentational component
  - accepts visible nav items and current pathname
  - highlights the active route
- `app-header.tsx`
  - reuses `ModeToggle` and `UserMenu`
  - shows current clinic and role when present
- `app-shell.tsx`
  - composes sidebar + header + content area
  - responsive but simple, no overdesigned dashboard chrome

Use existing Tailwind tokens and shadcn button/link patterns. Do not add new global state.

**Step 4: Run type-check to verify it passes**

Run: `bun run check-types`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/components/layout/app-sidebar.tsx apps/web/src/components/layout/app-header.tsx apps/web/src/components/layout/app-shell.tsx
git commit -m "feat: add authenticated shell layout components"
```

---

### Task 3: Reorganize Routes Into Public and App Groups

**Files:**
- Create: `apps/web/src/app/(public)/layout.tsx`
- Create: `apps/web/src/app/(public)/page.tsx`
- Create: `apps/web/src/app/(public)/login/page.tsx`
- Create: `apps/web/src/app/(app)/layout.tsx`
- Create: `apps/web/src/app/(app)/dashboard/page.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Delete: `apps/web/src/app/page.tsx`
- Delete: `apps/web/src/app/login/page.tsx`
- Delete: `apps/web/src/app/dashboard/page.tsx`

**Step 1: Write the failing route move target**

Move the existing page exports into route groups and update imports so type-check fails until the new grouped files exist.

**Step 2: Run type-check to verify it fails**

Run: `bun run check-types`

Expected: FAIL because old route files are moved and new grouped files are not complete yet.

**Step 3: Write minimal implementation**

- `app/layout.tsx`
  - keep only root HTML/body/providers concerns
  - remove generic global header from root layout
- `app/(public)/layout.tsx`
  - lightweight public layout for landing + login
- `app/(public)/page.tsx`
  - preserve current landing content
- `app/(public)/login/page.tsx`
  - preserve current server login redirect behavior by reusing existing login page logic
- `app/(app)/layout.tsx`
  - call `getPageAuthContext()`
  - derive nav items from `getVisibleNavItems(context.activeMembership?.role)`
  - render `AppShell`
  - if no membership, still render shell with reduced navigation and let child pages decide fallback state
- `app/(app)/dashboard/page.tsx`
  - preserve current fallback state and module access check

Important:
- URL paths must remain `/`, `/login`, and `/dashboard`
- only filesystem route grouping changes
- do not break `/api/auth/[...all]`

**Step 4: Run type-check to verify it passes**

Run: `bun run check-types`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/app apps/web/src/components/layout apps/web/src/lib/app-navigation.ts apps/web/src/lib/app-navigation.test.ts
git commit -m "feat: organize public and app route groups"
```

---

### Task 4: Make Header and User Menu Fit the New Shell

**Files:**
- Modify: `apps/web/src/components/user-menu.tsx`
- Modify: `apps/web/src/components/header.tsx`
- Modify: `apps/web/src/app/layout.tsx`

**Step 1: Write the failing cleanup target**

After route grouping, the root-level `Header` should no longer be rendered globally. Type-check should fail if old imports remain unused or if the shell still depends on the old header shape.

**Step 2: Run type-check to verify it fails**

Run: `bun run check-types`

Expected: FAIL or report unused imports / stale references until cleanup is done.

**Step 3: Write minimal implementation**

- remove old global header usage from root layout
- either:
  - delete `header.tsx` if fully obsolete, or
  - keep it only if reused by new shell
- keep `UserMenu` reusable inside authenticated header
- avoid serializing unnecessary session data into client components

**Step 4: Run type-check to verify it passes**

Run: `bun run check-types`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/app/layout.tsx apps/web/src/components/header.tsx apps/web/src/components/user-menu.tsx
git commit -m "refactor: remove global header from root layout"
```

---

### Task 5: Verify Shell Behavior End to End

**Files:**
- No code changes required unless fixes are needed

**Step 1: Run automated verification**

Run:
- `bun test apps/web/src/lib/rbac.test.ts`
- `bun test apps/web/src/lib/tenant-context.test.ts`
- `bun test apps/web/src/lib/route-access.test.ts`
- `bun test apps/web/src/lib/app-navigation.test.ts`
- `bun run check-types`

Expected: PASS.

**Step 2: Run dev server**

Run: `bun run dev:web`

Expected: app starts on `http://localhost:3001`

**Step 3: Manual route checks**

Verify:
- guest opening `/dashboard` is redirected to `/login`
- authenticated user opening `/login` is redirected by the server page to `/dashboard`
- authenticated user without membership sees dashboard fallback inside the authenticated shell
- authenticated user with membership sees app shell with clinic label and role-aware nav
- `/api/auth/*` continues to work

**Step 4: Commit**

```bash
git add apps/web/src/app apps/web/src/components apps/web/src/lib
git commit -m "feat: add authenticated app shell"
```

---

## Notes for the Implementer

- Do not start building `/patients` UI in this plan.
- Keep shell copy neutral and operational; avoid marketing-style text in authenticated layout.
- The new shell should be intentionally simple and reusable for patient registry next.
- If a component becomes purely server-rendered, do not keep it client-only out of habit.
- Preserve the current MVP behavior for no-membership users until clinic switcher/onboarding exists.
