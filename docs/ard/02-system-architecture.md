# 2. Arsitektur Sistem (High-Level)

[< Kembali ke Index](./README.md)

---

## Diagram Arsitektur

```
                           +---------------------------+
                           |       BROWSER (Client)     |
                           |  React 19 + Next.js CSR    |
                           +-------------+-------------+
                                         |
                                   HTTPS / WSS
                                         |
                           +-------------v-------------+
                           |     NEXT.JS APP (v16+)     |
                           |     (App Router + API)      |
                           |                             |
                           |  +--------+ +------------+ |
                           |  | Server | | API Routes | |
                           |  | Comps  | | /api/auth  | |
                           |  |        | | /api/v1/*  | |
                           |  +--------+ +------+-----+ |
                           |         |          |        |
                           |  +------v----------v-----+ |
                           |  |   Business Logic Layer | |
                           |  |   (Server Actions /    | |
                           |  |    Route Handlers)     | |
                           |  +-----------+------------+ |
                           |              |              |
                           |  +-----------v------------+ |
                           |  |    Drizzle ORM Layer   | |
                           |  |    (@klinik-AI/db)     | |
                           |  +-----------+------------+ |
                           +--------------|--------------|
                                          |
                           +--------------v--------------+
                           |        POSTGRESQL           |
                           |   (Multi-Tenant Database)   |
                           +-----------------------------+
```

## Pola Arsitektur

| Aspek | Keputusan | Justifikasi |
|---|---|---|
| **Deployment Model** | Monolith (Next.js fullstack) | Simplicity untuk MVP; mudah di-refactor ke microservices jika diperlukan |
| **Multi-Tenancy** | Shared Database, Row-Level Isolation (`clinic_id` per tabel) | Cost-effective; satu database untuk semua tenant dengan `clinic_id` sebagai discriminator |
| **Backend Pattern** | "Self" backend (Next.js API Routes + Server Actions) | Tidak perlu server terpisah; mengurangi infrastructure complexity |
| **Data Access** | Repository Pattern via Drizzle ORM | Type-safe queries, migrasi terkelola, dan abstraksi database |
| **Caching Strategy** | React Server Components cache + HTTP Cache Headers | Built-in Next.js caching; ditambah query-level cache jika diperlukan |

## Multi-Tenancy Strategy

```
+---------------------------------------------------+
|                 POSTGRESQL DATABASE                |
|                                                   |
|  +----------+  +----------+  +----------+        |
|  | clinic_a |  | clinic_b |  | clinic_c |  ...   |
|  | (rows)   |  | (rows)   |  | (rows)   |        |
|  +----------+  +----------+  +----------+        |
|                                                   |
|  Setiap tabel domain memiliki kolom `clinic_id`   |
|  yang menjadi bagian dari composite index         |
|  Row-Level Security (RLS) diterapkan di level ORM |
+---------------------------------------------------+
```

**Strategi:**
- Setiap tabel domain (pasien, kunjungan, obat, dll.) memiliki kolom `clinic_id` (UUID/text, NOT NULL, FK ke `clinic`).
- Middleware/helper function menambahkan filter `WHERE clinic_id = ?` secara otomatis pada setiap query.
- Tabel referensi global (ICD-10, satuan standar) tidak memiliki `clinic_id`.
- Index composite `(clinic_id, ...)` pada setiap tabel untuk performa query.
