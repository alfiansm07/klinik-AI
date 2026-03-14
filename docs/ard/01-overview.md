# 1. Overview & Prinsip Arsitektur

[< Kembali ke Index](./README.md)

---

## 1.1 Latar Belakang

Klinikai adalah sistem informasi klinik berbasis SaaS (Software as a Service) multi-tenant yang dirancang untuk mengakomodasi operasional rawat jalan pada Klinik Pratama, Klinik Utama, dan Praktik Mandiri Dokter/Dokter Gigi di Indonesia. Dokumen ini mendefinisikan keputusan arsitektur, batasan teknis, dan panduan implementasi untuk seluruh tim engineering.

## 1.2 Ruang Lingkup

Dokumen ini mencakup arsitektur teknis untuk **Fase 1 (MVP)** dengan pertimbangan forward-compatibility terhadap Fase 2+ (integrasi BPJS, SatuSehat, Rawat Inap, dll).

## 1.3 Stakeholder Teknis

| Peran | Tanggung Jawab |
|---|---|
| Product Owner | Mendefinisikan prioritas fitur dan acceptance criteria |
| Lead Engineer | Keputusan arsitektur dan code review |
| Frontend Engineer | Implementasi UI/UX dan state management |
| Fullstack Engineer | API routes, business logic, dan integrasi database |
| DevOps / Infra | CI/CD, monitoring, dan deployment |

---

## 2. Tujuan Arsitektur

| # | Tujuan | Deskripsi |
|---|---|---|
| AG-1 | **Multi-Tenancy** | Satu deployment melayani banyak klinik dengan isolasi data yang ketat |
| AG-2 | **Skalabilitas** | Arsitektur mampu menangani pertumbuhan tenant dan volume data tanpa perombakan besar |
| AG-3 | **Keamanan Data Medis** | Perlindungan data pasien sesuai standar regulasi kesehatan Indonesia |
| AG-4 | **Developer Experience** | Monorepo terstruktur, type-safety end-to-end, dan fast iteration cycle |
| AG-5 | **Extensibility** | Mudah menambah modul baru (Rawat Inap, Lab, dll.) dan integrasi eksternal (BPJS, SatuSehat) |
| AG-6 | **Reliability** | Sistem tersedia 99.5%+ dengan mekanisme recovery yang jelas |

## 3. Prinsip Arsitektur

1. **Server-First Rendering** -- Prioritaskan Server Components untuk performa dan SEO. Client Components hanya untuk interaktivitas.
2. **Type-Safety End-to-End** -- TypeScript strict mode dari database schema hingga UI components.
3. **Colocation** -- Kode yang berhubungan ditempatkan berdekatan (schema bersama model, component bersama styles).
4. **Separation of Concerns** -- Shared packages (`auth`, `db`, `env`) terpisah dari application layer.
5. **Convention over Configuration** -- Mengikuti konvensi framework (Next.js App Router, Drizzle ORM) untuk mengurangi boilerplate.
6. **Progressive Enhancement** -- Fitur bekerja tanpa JavaScript di sisi klien jika memungkinkan.
7. **Fail-Fast Validation** -- Environment variables dan input divalidasi sedini mungkin (startup time untuk env, request time untuk input).

## 4. Batasan (Constraints)

| # | Batasan | Alasan |
|---|---|---|
| C-1 | Self-hosted backend (Next.js API Routes) | Menyederhanakan deployment; tidak ada server terpisah |
| C-2 | PostgreSQL sebagai satu-satunya database | Konsistensi ACID untuk data medis dan keuangan |
| C-3 | Bun sebagai package manager | Konsistensi dengan scaffolding Better-T-Stack |
| C-4 | Tidak ada pembayaran online di Fase 1 | Pembayaran dicatat manual oleh Kasir |
| C-5 | Bahasa antarmuka: Bahasa Indonesia | Target pasar domestik |
