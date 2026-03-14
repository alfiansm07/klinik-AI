# 4. Arsitektur Data

[< Kembali ke Index](./README.md)

---

## Entity-Relationship Overview

```
                    +-------------+
                    |   clinic    |  (Tenant)
                    +------+------+
                           |
          +--------+-------+-------+--------+
          |        |               |        |
    +-----v----+ +-v--------+ +---v----+ +-v---------+
    |   user   | | employee | |  poly  | | patient   |
    +-----+----+ +----+-----+ +---+----+ +-----+-----+
          |           |           |             |
    +-----v----+ +----v----------v----+   +-----v-----+
    | clinic_  | | doctor_schedule   |   |   visit   |
    | member   | +-------------------+   +-----+-----+
    +----------+                               |
                                         +-----v-----+
                                         |    emr    |  (SOAP)
                                         +-----+-----+
                                               |
                                         +-----v-----+
                                         |prescription|
                                         +-----+-----+
                                               |
                                         +-----v-----+
                                         |  billing   |
                                         +-----------+
```

---

## Schema Categories

### A. System & Auth Tables

| Tabel | Deskripsi | Multi-Tenant |
|---|---|---|
| `user` | Akun pengguna (email, nama, avatar) | No (global) |
| `session` | Session aktif per user | No (global) |
| `account` | Provider auth (email/password, OAuth) | No (global) |
| `verification` | Token verifikasi email | No (global) |

### B. Tenant Management Tables

| Tabel | Deskripsi | Kolom Kunci |
|---|---|---|
| `clinic` | Data klinik (tenant) | `id`, `code`, `name`, `address`, `city`, `phone`, `email`, `website`, `owner_name`, `responsible_doctor`, `sip_number`, `license_number`, `npwp_number`, `npwp_file_url`, `skt_file_url`, `logo_url`, `settings` (JSONB: headerText, footerText, receiptNote, tagline, printNote, socialMedia) |
| `clinic_member` | Relasi user-klinik-role | `id`, `clinic_id`, `user_id`, `role`, `is_active` |
| `employee` | Data SDM klinik | `id`, `clinic_id`, `user_id`, `code`, `display_name`, `nik`, `sip_number`, `sip_expiry_date`, `str_number`, `str_expiry_date`, `bpjs_doctor_code`, `specialization`, `employment_type`, `integrations` (JSONB: satuSehat, iCare) |
| `doctor_schedule` | Jadwal praktik dokter | `id`, `clinic_id`, `employee_id`, `poly_id`, `shift_id`, `day_of_week`, `start_time`, `end_time`, `max_patients` |

### C. Master Data Tables

| Tabel | Deskripsi | Multi-Tenant | Status |
|---|---|---|---|
| `poly` | Unit pelayanan/poli | Yes (`clinic_id`) | Built |
| `room` | Data ruangan | Yes (`clinic_id`) | Built |
| `shift` | Definisi shift/jam praktek | Yes (`clinic_id`) | Built |
| `icd10` | Referensi diagnosa ICD-10 | No (global reference) | Built |
| `medical_action` | Katalog prosedur medis (tindakan/radiologi/lab) | Yes (`clinic_id`) | Built |
| `tariff_group` | Pengelompokan tarif tindakan | Yes (`clinic_id`) | Built |
| `action_tariff` | Tarif per tindakan per penjamin | Yes (`clinic_id`) | Built |
| `registration_tariff` | Tarif pendaftaran pasien | Yes (`clinic_id`) | Built |
| `medicine` | Master obat/alkes | Yes (`clinic_id`) | Built |
| `medicine_price` | Harga jual obat per tipe harga | Yes (`clinic_id`) | Built |
| `medicine_category` | Golongan obat (therapeutic group) | Yes (`clinic_id`) | Built |
| `medicine_unit` | Satuan obat (terkecil/terbesar) | Yes (`clinic_id`) | Built |
| `medicine_pharmacology` | Klasifikasi farmakologi obat | Yes (`clinic_id`) | Built |
| `manufacturer` | Pabrik/produsen obat & alkes | Yes (`clinic_id`) | Built |
| `supplier` | Distributor/PBF obat & alkes | Yes (`clinic_id`) | Built |
| `dosage_instruction` | Aturan pakai obat (signa) | Yes (`clinic_id`) | Built |
| `medicine_price_type` | Tipe harga jual obat | Yes (`clinic_id`) | Built |
| `payment_method` | Metode pembayaran | Yes (`clinic_id`) | Built |
| `guarantor` | Penjamin (Umum, Asuransi, BPJS) | Yes (`clinic_id`) | Built |
| `expense_category` | Kategori biaya operasional | Yes (`clinic_id`) | Built |
| `stock_location` | Lokasi stok inventori/farmasi | Yes (`clinic_id`) | Built |

### D. Patient Registry Tables

| Tabel | Deskripsi | Multi-Tenant | Status |
|---|---|---|---|
| `patient` | Data inti/registri pasien | Yes (`clinic_id`) | Built |
| `patient_allergy` | Alergi pasien | Yes (via `patient.clinic_id`) | Built |

### E. Visit & Operational Tables

| Tabel | Deskripsi | Multi-Tenant | Status |
|---|---|---|---|
| `visit` | Registrasi kunjungan rawat jalan | Yes (`clinic_id`) | Built |
| `queue` | Antrean poli per kunjungan | Yes (`clinic_id`) | Built |
| `vital_sign` | Tanda vital / asesmen awal per kunjungan | Yes (via `visit.clinic_id`) | Built |

### F. Clinical / EMR Tables

| Tabel | Deskripsi | Multi-Tenant | Status |
|---|---|---|---|
| `emr_soap` | Rekam medis SOAP per kunjungan | Yes (via `visit.clinic_id`) | Built |
| `emr_diagnosis` | Diagnosa ICD-10 per kunjungan | Yes (via `visit.clinic_id`) | Built |
| `emr_action` | Tindakan medis per kunjungan | Yes (via `visit.clinic_id`) | Built |
| `prescription` | Resep elektronik (header) | Yes (via `visit.clinic_id`) | Built |
| `prescription_item` | Item obat/detail resep | Yes (via `prescription`) | Built |

### G. Pharmacy & Billing Tables

| Tabel | Deskripsi | Multi-Tenant | Status |
|---|---|---|---|
| `dispensing` | Penyerahan/penjualan obat apotek (header) | Yes (`clinic_id`) | |
| `dispensing_item` | Detail item penyerahan/penjualan obat | Yes (via `dispensing`) | |
| `stock_entry` | Penerimaan barang / pembelian langsung | Yes (`clinic_id`) | Built |
| `stock_entry_item` | Item penerimaan barang | Yes (via `stock_entry`) | Built |
| `stock_opname` | Stok opname / adjustment (header) | Yes (`clinic_id`) | |
| `stock_opname_item` | Detail item stok opname / adjustment | Yes (via `stock_opname`) | |
| `stock_movement` | Mutasi/pergerakan stok antar lokasi (header) | Yes (`clinic_id`) | |
| `stock_movement_item` | Detail item mutasi/pergerakan stok | Yes (via `stock_movement`) | |
| `billing` | Tagihan (header) | Yes (`clinic_id`) | Built |
| `billing_item` | Item tagihan | Yes (via `billing`) | Built |
| `payment` | Pembayaran | Yes (`clinic_id`) | Built |

---

## Konvensi Database

| Aspek | Konvensi |
|---|---|
| **Naming** | `snake_case` untuk tabel dan kolom |
| **Primary Key** | `id` bertipe `text` (nanoid/cuid2), bukan auto-increment integer |
| **Timestamps** | Setiap tabel memiliki `created_at` dan `updated_at` |
| **Soft Delete** | `deleted_at` (timestamp, nullable) untuk tabel operasional/klinis yang membutuhkan histori |
| **Foreign Key** | `<entity>_id` (e.g., `patient_id`, `clinic_id`) |
| **Index** | Composite index `(clinic_id, ...)` untuk semua tabel multi-tenant; untuk tabel operasional dengan `deleted_at`, prioritaskan partial index aktif `WHERE deleted_at IS NULL`; untuk search/autocomplete PostgreSQL, gunakan GIN trigram index sesuai pola query |
| **Check Constraint** | Gunakan `CHECK` untuk validasi level database yang stabil dan lokal: range enum numerik (`day_of_week`), persentase (`0..100`), nilai qty/amount non-negatif, dan sanity rule seperti source/target lokasi berbeda |
| **JSONB** | Digunakan untuk data semi-structured (settings, metadata) |
| **Enum** | Drizzle `pgEnum` untuk status fields (e.g., `visit_status`, `queue_status`) |

## Migration Strategy

| Fase | Strategi |
|---|---|
| **Development** | `drizzle-kit generate` + review SQL + `drizzle-kit migrate`; `push` hanya untuk eksperimen lokal yang tidak menjadi baseline repo |
| **Staging/Production** | `drizzle-kit generate` + `drizzle-kit migrate` (versioned migration files) |

### Catatan Implementasi Saat Ini

- Riwayat migration sekarang sudah disimpan di `packages/db/src/migrations`
- Baseline schema awal telah diterapkan melalui Drizzle migration, bukan `push`
- PostgreSQL search optimization menggunakan extension `pg_trgm` + GIN trigram indexes untuk `patient.name`, `medicine.name`, `medical_action.name`, dan `icd10.display`
- Constraint hardening sudah mulai diterapkan lewat migration terpisah untuk menjaga validitas nilai numerik, range persen, dan integritas operasional dasar
- Ledger migration Drizzle tersimpan di schema `drizzle` (`drizzle.__drizzle_migrations`)
