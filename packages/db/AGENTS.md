# AGENTS.md — packages/db

Database package. Drizzle ORM schema, migrations, Docker PostgreSQL.

## Structure

```
db/
├── src/
│   ├── schema/          # 12 files: domain-grouped table definitions
│   │   ├── auth.ts      # user, session, account, verification (Better-Auth)
│   │   ├── tenant.ts    # clinic, clinic_member, employee
│   │   ├── master.ts    # ~15 tables: poly, room, medicine, tariff, stock_location...
│   │   ├── patient.ts   # patient, patient_allergy
│   │   ├── visit.ts     # visit, queue, vital_sign
│   │   ├── emr.ts       # emr_soap, emr_diagnosis, emr_action, prescription
│   │   ├── billing.ts   # billing, billing_item, payment
│   │   ├── inventory.ts # stock_entry, dispensing, stock_movement, stock_opname (+items)
│   │   ├── schedule.ts  # doctor_schedule
│   │   ├── reference.ts # icd10 (global, no clinic_id)
│   │   ├── relations.ts # ALL Drizzle relations centralized here
│   │   └── index.ts     # Barrel re-export
│   ├── migrations/      # SQL migrations + meta/ journal
│   └── index.ts         # DB connection pool export
├── drizzle.config.ts    # Reads .env from ../../apps/web/.env
└── docker-compose.yml   # Local PostgreSQL
```

## Conventions

- **Relations centralized**: ALL `relations()` calls go in `relations.ts`, never co-located.
- **Schema grouping**: One file per domain (e.g., `emr.ts` has SOAP + diagnosis + actions + prescriptions).
- **Multi-tenant tables**: Always include `clinicId` column + composite index `(clinic_id, ...)`.
- **Global tables**: Only `icd10` in `reference.ts` — no `clinic_id`.
- **Enums**: Use `pgEnum` at top of relevant schema file. Export from barrel.
- **Primary keys**: `text("id").primaryKey().$defaultFn(() => createId())` using `@paralleldrive/cuid2`.
- **Timestamps**: `created_at` + `updated_at` (all tables). Transactional tables add `deleted_at`.
- **CHECK constraints**: Range/non-negative for money/qty. Review generated SQL before applying.
- **Naming**: `snake_case` for DB columns/tables. Drizzle variable names match table name in camelCase.

## Where to Look

| Task | File | Notes |
|------|------|-------|
| Add new table | Domain file in `schema/` | Follow grouping. Add relations in `relations.ts`. Export from `index.ts`. |
| Add column to existing | Same domain file | Add to table definition. Generate migration. |
| Add relation | `relations.ts` ONLY | Never put relations in domain files. |
| Change enum values | Domain file with the enum | Generate migration. May need custom SQL for ALTER TYPE. |
| Seed data | `src/seed-icd10.ts` | Only seed script currently. |
| Migration workflow | Run from repo root | `bun run db:generate` → review SQL → `bun run db:migrate`. |

## Anti-Patterns

- Putting `relations()` in domain schema files instead of `relations.ts`.
- Using `db:push` after migrations exist — repo is in migration-first mode.
- Forgetting composite `(clinic_id, ...)` index on multi-tenant tables.
- Assuming `drizzle-kit generate` handles `CREATE EXTENSION` — add manually.
- Forgetting to export new tables/enums from `index.ts`.

## Notes

- `drizzle.config.ts` reads `.env` from `../../apps/web/.env` — not from package root.
- `master.ts` is the largest file (~1050 lines) — medicine subtables dominate.
- Migration ledger may be in `drizzle.__drizzle_migrations` (not `public`).
- After any schema change: `bun run db:generate` → review SQL → `bun run db:migrate`.
