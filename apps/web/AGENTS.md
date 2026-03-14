# AGENTS.md — apps/web

Next.js 16 fullstack app. React 19, Tailwind v4, shadcn/ui (base-lyra).

## Structure

```
web/src/
├── app/
│   ├── (app)/           # Authenticated routes (AppShell layout)
│   │   └── dashboard/   # Only authed page so far
│   ├── (public)/        # Guest routes (login, landing, ui-testing)
│   ├── api/auth/        # Better-Auth catch-all (ONLY API route)
│   ├── dashboard/       # Legacy redirect (outside route group)
│   └── layout.tsx       # Root layout: fonts (Figtree, Noto Sans, JetBrains Mono)
├── components/
│   ├── layout/          # app-shell, app-header, app-sidebar
│   ├── ui/              # 18 shadcn components
│   └── *.tsx            # Auth forms, providers, theme, user-menu, loader
├── lib/                 # Auth helpers, RBAC, tenant context, navigation (see lib/AGENTS.md)
├── middleware.ts         # Cookie-based auth gate
└── index.css            # Tailwind v4 CSS-first config
```

## Conventions

- **Route groups**: `(app)` for authenticated, `(public)` for guest. Never mix.
- **Auth in pages**: Use `requireAuth()` or `getPageAuthContext()` in server components. Never call DB in middleware.
- **Data mutations**: Server Actions only. No API routes (except `/api/auth`).
- **Data fetching**: Server Components + direct Drizzle queries. No client-side fetching for core data.
- **Forms**: `@tanstack/react-form` (not react-hook-form).
- **Styling**: Tailwind v4 (CSS-first config in `index.css`), `tw-animate-css`, `class-variance-authority`.
- **shadcn style**: `base-lyra`. Config in `components.json` with `rsc: false`.
- **Animations**: `motion` library (Framer Motion successor).
- **Icons**: `lucide-react`.
- **Responsive-first UI**: Every new page and component must start mobile-first, be verified at 375px, 768px, 1024px, and 1440px, avoid horizontal overflow, scale from 1-column to larger grids progressively, and keep a mobile navigation/action path whenever desktop controls are hidden.

## Where to Look

| Task | Location | Notes |
|------|----------|-------|
| New authenticated page | `src/app/(app)/` | Add `requireAuth()` in server component. |
| New public page | `src/app/(public)/` | No auth required. |
| Middleware changes | `src/middleware.ts` | Cookie check only — no DB. Matcher excludes `/api/auth`. |
| Add shadcn component | `src/components/ui/` | `bunx shadcn@latest add <component>`. |
| Layout changes | `src/components/layout/` | AppShell, header, sidebar. |
| Navigation items | `src/lib/app-navigation.ts` | 3 groups: main, operations, management. Role-based visibility. |
| Theme/providers | `src/components/providers.tsx` | QueryClientProvider not yet included. |
| CSS variables/tokens | `src/index.css` | Tailwind v4 theme config. |

## Anti-Patterns

- Adding API routes for data mutations (use Server Actions).
- Calling session resolver in middleware (use cookie presence check only).
- Using `react-hook-form` (project uses `@tanstack/react-form`).
- Client-side data fetching for data that can be server-fetched.

## Notes

- `next.config.ts`: `typedRoutes: true` + `reactCompiler: true` (React Compiler enabled).
- No test runner configured. Test files exist (`.test.ts`) but no vitest/jest.
- Dev server: port 3001 (`next dev --port 3001`).
- Login redirect loops: if stale cookie, server page handles final redirect (not middleware).
