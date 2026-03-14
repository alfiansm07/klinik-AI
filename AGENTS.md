# AGENTS.md — klinik-AI

Repository guide for agentic coding tools working in `C:\coding\klinik-AI`.

## Project Snapshot

- Monorepo: Bun workspaces + Turborepo.
- Main app: `apps/web` (Next.js 16 App Router, React 19, TypeScript, Tailwind v4).
- Database package: `packages/db` (Drizzle ORM + PostgreSQL via Docker).
- Auth/data model: Better Auth + multi-tenant clinic isolation.
- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- No Copilot rules found in `.github/copilot-instructions.md`.

## Repo Layout

```text
klinik-AI/
|- apps/web/               # Next.js fullstack app, runs on port 3001
|- packages/db/            # Drizzle schema, migrations, local DB scripts
|- packages/auth/          # Better Auth setup
|- packages/env/           # Environment validation
|- packages/config/        # Shared TS config
|- docs/                   # Product, architecture, plans, audits
|- tasks/                  # lessons.md and task notes
|- design-system/          # UI reference docs
```

## Read First

- Read `tasks/lessons.md` before non-trivial work.
- Read nested instructions when working in scoped areas:
  - `apps/web/AGENTS.md`
  - `apps/web/src/lib/AGENTS.md`
  - `packages/db/AGENTS.md`
- Treat nested AGENTS files as more specific than this root file.

## Build, Typecheck, and Test Commands

Run commands from the repo root unless noted otherwise.

### Core Commands

```bash
bun install
bun run dev
bun run dev:web
bun run build
bun run check-types
```

### Web App Commands

```bash
bun run dev:web                 # starts Next.js on :3001
turbo -F web build
turbo -F web check-types
```

Equivalent from `apps/web/`:

```bash
bun run dev
bun run build
bun run check-types
```

### Database Commands

```bash
bun run db:start
bun run db:generate
bun run db:migrate
bun run db:studio
bun run db:stop
bun run db:down
```

Important:

- This repo is migration-first now. Prefer `db:generate` + `db:migrate`.
- Avoid `db:push` after migrations already exist unless the user explicitly wants that workflow.

### Test Commands

There is no global `test` script in `package.json`, but Bun can run the existing `*.test.ts` files directly.

Run all discovered tests in a folder:

```bash
bun test apps/web/src/lib
```

Run a single test file:

```bash
bun test "apps/web/src/lib/select-utils.test.ts"
bun test "apps/web/src/lib/app-navigation.test.ts"
bun test "apps/web/src/app/(app)/pendaftaran/pasien/patient-shared.test.ts"
```

Run from the package directory:

```bash
bun test "src/lib/select-utils.test.ts"
```

Notes for single-test work:

- Bun test files use `node:test` style (`describe`, `test`, `assert`).
- There is no Vitest/Jest setup in the repo.
- There is no lint command configured today. Use `bun run check-types` as the main static gate.

## Expected Verification Before Claiming Success

For most TypeScript/UI changes:

```bash
bun test "path/to/test-file.test.ts"
bun run check-types
```

For DB schema changes:

```bash
bun run db:generate
bun run db:migrate
bun run check-types
```

For Next.js route or form changes, also do a manual browser check when practical.

## Architecture Rules

- Use Server Components + direct server-side queries for core data reads.
- Use Server Actions for data mutations.
- Do not add API routes for normal CRUD; `/api/auth` is the accepted exception.
- Keep middleware lightweight: cookie/session presence checks only, never DB queries.
- Respect route groups:
  - `(app)` = authenticated
  - `(public)` = guest/public

## Code Style Guidelines

### General Style

- Prefer small, surgical changes over broad rewrites.
- Reuse existing components, helpers, and patterns before introducing new abstractions.
- Preserve the existing file's style. Do not reformat unrelated code.
- Use ASCII by default unless the file already relies on non-ASCII text.
- Keep comments sparse. Add them only when intent is not obvious from the code.

### Imports

- Group imports in this order:
  1. framework / external packages
  2. internal `@/` imports
  3. local relative imports
- Prefer `import type` for type-only imports.
- Use the `@/*` alias inside `apps/web` instead of deep relative paths.
- Avoid unused imports; remove them immediately.

### Formatting

- Follow the surrounding file instead of imposing one universal style.
- App/business logic files often use semicolons and slightly wider spacing.
- shadcn-style UI wrapper files often omit semicolons and use tighter formatting.
- Keep JSX readable: one prop per line when lines get long.
- Avoid one-letter variable names except for tiny local callback values.

### Naming

- `PascalCase` for React components, types, and interfaces.
- `camelCase` for functions, variables, props, and helpers.
- `SCREAMING_SNAKE_CASE` for true constants shared within a file.
- Database tables/columns stay `snake_case` in Drizzle schema definitions.
- Match domain names already present in the repo: `guarantor`, `visit`, `room`, `clinic`, `patient`.

### TypeScript

- The repo runs in `strict` mode. Do not weaken types to get past errors.
- Prefer explicit domain types over `any`.
- Avoid `as` casts unless you have no cleaner option.
- Encode nullable/optional states honestly in types and UI.
- When a field is optional in data, the UI must provide a real way to clear it.

### React / Next.js

- Prefer server-first data flow; only mark components with `"use client"` when needed.
- Keep client components focused on interactivity, local state, and browser APIs.
- Use `useTransition` for async form submits where the repo already follows that pattern.
- Use `next/navigation` helpers consistently.
- Respect `typedRoutes: true`; avoid stringly-typed routing shortcuts when route types are available.

### Forms and UI

- In `apps/web`, prefer `@tanstack/react-form`, not `react-hook-form`.
- Use existing UI primitives from `apps/web/src/components/ui/`.
- Follow shared master-data patterns from `apps/web/src/components/shared/`.
- Mobile-first layouts are required. Verify 375px, 768px, 1024px, and 1440px mentally or manually.
- Avoid horizontal overflow and hidden critical actions on mobile.
- For relational selects, keep storing IDs in state/payloads but always render human-readable labels in the trigger.

### Error Handling

- Fail honestly. Do not hide broken or missing states behind placeholders that imply success.
- For async loads, provide an explicit empty/error state when data cannot load.
- For form submits, return or surface clear user-facing errors via existing toast/error patterns.
- Validate tenant ownership on the server for incoming foreign keys; do not trust the client.

### Database / Drizzle

- Add new relations in `packages/db/src/schema/relations.ts`, not beside table definitions.
- Keep schema files grouped by domain.
- Multi-tenant tables require `clinicId` and the right `(clinic_id, ...)` indexing strategy.
- Export new schema objects from the relevant barrel files.
- Review generated migration SQL before applying it.

## Anti-Patterns to Avoid

- Adding a new dependency when an existing package already solves the problem.
- Adding API routes for features that should be Server Actions.
- Moving logic into middleware that needs DB access.
- Rewriting large files just to match a preferred style.
- Returning raw internal IDs, UUIDs, or enum codes in user-facing labels unless that is the intentional business label.
- Marking work complete without fresh verification output.

## Practical Workflow for Agents

- Read local AGENTS instructions for the directory you are touching.
- Check `tasks/lessons.md` for prior mistakes before changing behavior.
- Make the smallest correct change.
- Run the narrowest useful test first, then `bun run check-types`.
- If browser behavior matters and you cannot run it, say so explicitly.
- If a new lesson emerges from user correction, update `tasks/lessons.md`.
