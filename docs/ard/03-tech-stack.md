# 3. Technology Stack & Monorepo

[< Kembali ke Index](./README.md)

---

## Core Stack

| Layer | Teknologi | Versi | Justifikasi |
|---|---|---|---|
| **Language** | TypeScript | ^5 | Type-safety, developer productivity, ecosystem |
| **Runtime** | Bun | 1.3.6 | Fast package management, native TypeScript execution |
| **Framework** | Next.js (App Router) | ^16.1.1 | Server Components, API Routes, typed routes, React Compiler |
| **UI Library** | React | ^19.2.3 | Server Components, Suspense, React Compiler support |
| **ORM** | Drizzle ORM | ^0.45.1 | Type-safe, lightweight, SQL-like API, excellent migrations |
| **Database** | PostgreSQL | latest (Docker) | ACID compliance, JSON support, excellent indexing |
| **Authentication** | Better-Auth | 1.5.2 | Session-based auth, Drizzle adapter, Next.js integration |

## Frontend Stack

| Kategori | Teknologi | Versi |
|---|---|---|
| **CSS Framework** | TailwindCSS v4 | ^4.1.10 |
| **UI Components** | shadcn/ui + @base-ui/react | ^3.6.2 / ^1.0.0 |
| **Form Management** | @tanstack/react-form | ^1.28.0 |
| **Validation** | Zod v4 | ^4.1.13 |
| **Icons** | Lucide React | ^0.546.0 |
| **Theme** | next-themes | ^0.4.6 |
| **Toast/Notification** | Sonner | ^2.0.5 |
| **Utility** | clsx + tailwind-merge (via `cn()`) | ^2.1.1 / ^3.3.1 |

## Tooling & Infrastructure

| Kategori | Teknologi | Versi |
|---|---|---|
| **Monorepo** | Turborepo | ^2.8.12 |
| **Env Validation** | @t3-oss/env | ^0.13.1 |
| **DB Migrations** | Drizzle Kit | ^0.31.8 |
| **Containerization** | Docker Compose | (PostgreSQL) |
| **React Compiler** | babel-plugin-react-compiler | ^1.0.0 |

---

## Arsitektur Monorepo & Workspace

### Struktur Workspace

```
klinik-AI/
├── apps/
│   └── web/                    # Next.js fullstack application
│       └── src/
│           ├── app/            # Pages & API routes (App Router)
│           ├── components/     # UI components
│           └── lib/            # Client utilities
├── packages/
│   ├── auth/                   # @klinik-AI/auth - Better-Auth server config
│   ├── db/                     # @klinik-AI/db   - Drizzle ORM, schemas, migrations
│   ├── config/                 # @klinik-AI/config - Shared TypeScript config
│   └── env/                    # @klinik-AI/env  - Type-safe env validation
├── turbo.json                  # Turborepo pipeline configuration
├── package.json                # Root workspace + catalog versions
└── bun.lock                    # Dependency lockfile
```

### Dependency Graph

```
apps/web
  ├── @klinik-AI/auth
  │     ├── @klinik-AI/db
  │     │     ├── @klinik-AI/env
  │     │     └── @klinik-AI/config
  │     └── @klinik-AI/env
  ├── @klinik-AI/env
  └── @klinik-AI/config
```

### Turborepo Pipeline

| Task | Dependencies | Cache |
|---|---|---|
| `build` | `^build` (deps built first) | Cacheable |
| `dev` | - | Not cached (persistent) |
| `check-types` | `^check-types` | Cacheable |
| `lint` | `^lint` | Cacheable |
| `db:push` | - | Not cached |
| `db:generate` | - | Not cached |
| `db:migrate` | - | Not cached |
| `db:studio` | - | Not cached (persistent) |

### Package Responsibilities

| Package | Tanggung Jawab | Boleh Mengimpor |
|---|---|---|
| `@klinik-AI/config` | TypeScript base config | Tidak ada |
| `@klinik-AI/env` | Validasi environment variables | `@klinik-AI/config` |
| `@klinik-AI/db` | Schema, ORM client, migrations | `@klinik-AI/env`, `@klinik-AI/config` |
| `@klinik-AI/auth` | Auth server config, session management | `@klinik-AI/db`, `@klinik-AI/env` |
| `apps/web` | UI, pages, API routes, business logic | Semua packages |
