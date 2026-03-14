# 10. Risiko, Roadmap & Appendix

[< Kembali ke Index](./README.md)

---

## Risiko & Mitigasi Arsitektural

| # | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| R-1 | **Data leakage antar tenant** -- query tanpa `clinic_id` filter | Tinggi | Medium | ORM helper layer yang enforce `clinic_id`; code review checklist; integration tests |
| R-2 | **Database bottleneck** -- shared database untuk semua tenant | Medium | Medium | Connection pooling; read replicas; query monitoring; prepared to shard jika perlu |
| R-3 | **Monolith complexity** -- codebase tumbuh terlalu besar | Medium | Low | Strict module boundaries; package separation; potential future extraction ke microservices |
| R-4 | **Better-Auth limitations** -- fitur RBAC custom tidak didukung | Medium | Medium | Extend Better-Auth dengan custom plugin atau build authorization layer terpisah |
| R-5 | **Schema migration conflicts** -- multiple developers mengubah schema bersamaan | Low | Medium | Drizzle Kit migrations; PR review; schema change coordination |
| R-6 | **Performance degradation** dengan bertambahnya data | Medium | Medium | Pagination wajib; composite indexes; query analysis tools; archival strategy |
| R-7 | **Next.js version breaking changes** -- menggunakan versi canary/edge (v16) | Medium | Low | Pin dependency versions; thorough testing sebelum upgrade; Turborepo caching |

---

## Roadmap Arsitektur

### Fase 1 (Current - MVP)

```
[Sprint 1-2]  Auth + RBAC + Multi-Tenant Foundation
[Sprint 2-4]  Master Data (Klinik, SDM, Poli, Obat, Tindakan, Tarif)
[Sprint 3-5]  Front Office (Pasien, Pendaftaran, Antrean)
[Sprint 5-7]  EMR (SOAP, Vital Signs, Diagnosa, Tindakan, E-Resep)
[Sprint 6-8]  Farmasi (Dispensing, Inventori Dasar)
[Sprint 8-9]  Kasir & Billing
[Sprint 9-10] Reporting & Dashboard
[Sprint 10]   QA, Performance Testing, Production Deployment
```

### Fase 2 (Future)

| Komponen | Perubahan Arsitektur |
|---|---|
| **BPJS Bridging** | API Routes `/api/v1/bpjs/*` sebagai adapter layer ke VClaim/PCare API |
| **SatuSehat Integration** | FHIR-compliant data mapping layer; outbound webhook ke IHS |
| **Rawat Inap** | Extend schema (bed management, visite); new page routes |
| **Lab & Radiologi** | New module; order-result workflow pattern |
| **Patient Portal** | Separate Next.js app atau route group; public-facing pages |
| **Mobile App** | React Native app di `apps/native`; shared packages |

---

## Appendix A: Decision Log

| # | Keputusan | Alternatif yang Dipertimbangkan | Alasan Pemilihan |
|---|---|---|---|
| D-1 | **Next.js fullstack** (no separate backend) | Hono + Next.js, Express + React SPA | Simplicity untuk MVP; satu deployment; Server Components |
| D-2 | **Drizzle ORM** | Prisma, Kysely, raw SQL | Type-safe, lightweight, SQL-like API, no code generation |
| D-3 | **Better-Auth** | NextAuth/Auth.js, Lucia, Clerk | Self-hosted, Drizzle integration, flexible plugins |
| D-4 | **Row-level multi-tenancy** | Schema-per-tenant, DB-per-tenant | Cost-effective, simpler ops, sufficient for Phase 1 scale |
| D-5 | **Bun + Turborepo** | pnpm + Nx, yarn + Lerna | Better-T-Stack default; Bun speed; Turbo caching |
| D-6 | **TailwindCSS v4 + shadcn/ui** | Material UI, Ant Design, Chakra UI | Customizable, lightweight, good DX, active community |
| D-7 | **Server Actions** (no tRPC) | tRPC, REST API layer | Simpler for Next.js-only setup; progressive enhancement |
| D-8 | **Zod v4** | Valibot, ArkType, Yup | Standard in T3 ecosystem; broad library support |
| D-9 | **@tanstack/react-form** | React Hook Form, Formik | Better TypeScript integration; framework-agnostic |
| D-10 | **PostgreSQL** (single DB) | Supabase, PlanetScale, MongoDB | ACID compliance critical for medical/financial data; self-managed flexibility |

---

## Appendix B: Environment Setup

### Prerequisites

- Bun >= 1.3.6
- Docker & Docker Compose
- Node.js >= 20 (optional, for some tooling)

### Quick Start

```bash
# 1. Clone repository
git clone <repo-url> && cd klinik-AI

# 2. Install dependencies
bun install

# 3. Start PostgreSQL
bun run db:start

# 4. Push database schema
bun run db:push

# 5. Start development server
bun run dev
```

### Development URLs

| Service | URL |
|---|---|
| Web App | http://localhost:3001 |
| Drizzle Studio | http://localhost:4983 (via `bun run db:studio`) |
| PostgreSQL | localhost:5432 |
