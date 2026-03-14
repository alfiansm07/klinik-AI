# 9. Infrastruktur & Non-Functional Requirements

[< Kembali ke Index](./README.md)

---

## Development Environment

```
+---------------------------+
|   Developer Machine       |
|                           |
|   Bun Runtime             |
|   +-------------------+   |
|   | Next.js Dev Server|   |
|   | (Port 3001)       |   |
|   +-------------------+   |
|                           |
|   Docker Compose          |
|   +-------------------+   |
|   | PostgreSQL        |   |
|   | (Port 5432)       |   |
|   | User: postgres    |   |
|   | DB: klinik-AI     |   |
|   +-------------------+   |
+---------------------------+
```

## Production Architecture (Recommended)

```
                         +--------------------+
                         |   CDN / Edge       |
                         |   (Cloudflare /    |
                         |    Vercel Edge)    |
                         +---------+----------+
                                   |
                         +---------v----------+
                         |   Load Balancer    |
                         +---------+----------+
                                   |
                    +--------------+--------------+
                    |                             |
           +--------v--------+          +--------v--------+
           | Next.js Instance|          | Next.js Instance|
           | (Container 1)   |          | (Container 2)   |
           +---------+-------+          +---------+-------+
                     |                            |
                     +------------+---------------+
                                  |
                     +------------v---------------+
                     |     PostgreSQL (Managed)    |
                     |     - Primary (Write)       |
                     |     - Read Replica (Read)   |
                     +----------------------------+
```

## Environment Variables

| Variable | Development | Production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/klinik-AI` | Managed PostgreSQL connection string (SSL) |
| `BETTER_AUTH_SECRET` | 32-char random string | 64-char cryptographically secure random |
| `BETTER_AUTH_URL` | `http://localhost:3001` | `https://app.klinikai.com` |
| `CORS_ORIGIN` | `http://localhost:3001` | `https://app.klinikai.com` |

## Deployment Checklist (Production Readiness)

- [ ] Managed PostgreSQL dengan automated backups (daily)
- [ ] SSL/TLS termination di load balancer
- [ ] Environment variables via secrets manager (bukan file `.env`)
- [ ] Database connection pooling (PgBouncer atau built-in pool)
- [ ] Health check endpoint (`/api/health`)
- [ ] Error tracking (Sentry atau equivalent)
- [ ] Log aggregation (structured JSON logs)
- [ ] Database migration CI/CD pipeline
- [ ] Automated backup verification
- [ ] Rate limiting pada auth endpoints

---

## Performance

| Metrik | Target | Strategi |
|---|---|---|
| **Time to First Byte (TTFB)** | < 200ms | Server Components, database connection pooling |
| **Largest Contentful Paint (LCP)** | < 2.5s | Static assets via CDN, optimized images |
| **First Input Delay (FID)** | < 100ms | React Compiler auto-optimization, minimal client JS |
| **API Response Time (P95)** | < 500ms | Indexed queries, query optimization |
| **Database Query Time (P95)** | < 100ms | Composite indexes, connection pooling |
| **Concurrent Users per Instance** | 100+ | Stateless server design, horizontal scaling |

## Availability & Reliability

| Metrik | Target |
|---|---|
| **Uptime SLA** | 99.5% (monthly) |
| **Recovery Time Objective (RTO)** | < 1 jam |
| **Recovery Point Objective (RPO)** | < 15 menit (database point-in-time recovery) |
| **Planned Maintenance Window** | Minggu, 02:00-04:00 WIB |

## Scalability

| Dimensi | Target Fase 1 | Strategi Scale-Up |
|---|---|---|
| **Tenant (Klinik)** | 50 klinik | Horizontal scaling + read replicas |
| **Users per Tenant** | 20 users | Session-based, database-backed |
| **Patients per Tenant** | 50.000 records | Composite indexes, pagination |
| **Visits per Day (per Tenant)** | 200 kunjungan | Efficient query patterns |
| **Total Database Size** | 10 GB | Managed PostgreSQL with auto-scaling storage |

## Security

| Requirement | Implementation |
|---|---|
| **Data Encryption at Rest** | Database-level encryption (managed PostgreSQL) |
| **Data Encryption in Transit** | TLS 1.3 (HTTPS everywhere) |
| **Password Policy** | Min 8 chars, enforced by Zod schema |
| **Session Expiry** | 7 days (configurable per tenant) |
| **Brute Force Protection** | Rate limiting on `/api/auth/*` endpoints |
| **SQL Injection** | Parameterized queries via Drizzle ORM |
| **XSS** | React auto-escaping + Content Security Policy |
| **CSRF** | SameSite cookies + Better-Auth CSRF protection |

## Compliance Considerations

| Regulasi | Relevansi | Status |
|---|---|---|
| **Permenkes No. 24/2022** (Rekam Medis Elektronik) | Standar penyimpanan dan keamanan RME | Perlu diperhatikan dalam implementasi EMR |
| **UU PDP (Perlindungan Data Pribadi)** | Pengelolaan data pasien | Consent management, data minimization |
| **Standar SatuSehat / FHIR** | Interoperabilitas data kesehatan | Fase 2 (schema dirancang forward-compatible) |
| **Standar BPJS** | Klaim dan rujukan | Fase 2 |
