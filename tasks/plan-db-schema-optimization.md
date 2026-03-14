# Plan DB Schema Optimization

## Tujuan

- Menutup gap performa dan integritas schema sebelum data klinik tumbuh besar.
- Memprioritaskan perubahan yang paling aman, paling kecil, dan paling berdampak.
- Menjaga konsistensi arsitektur multi-tenant dengan `clinic_id` sebagai isolasi utama.

## Batas Audit Saat Ini

- Audit ini berbasis schema Drizzle di `packages/db/src/schema`.
- Belum ada baseline query runtime, `EXPLAIN ANALYZE`, atau statistik produksi/staging.
- Karena itu, rekomendasi dibagi menjadi `quick wins`, `integrity hardening`, dan `scale preparation`.

## Ringkasan Temuan

### 1. Index operasional harian belum cukup query-shaped

- Banyak tabel sudah punya index dasar `clinic_id` dan FK, tetapi list screen harian biasanya butuh index gabungan tenant + filter + sort.
- Contoh yang perlu ditingkatkan:
  - `visit`: list pasien per hari/status/dokter/poli
  - `billing`: list tagihan per status/waktu
  - `payment`: histori pembayaran per waktu
  - `dispensing`, `stock_entry`, `stock_movement`, `stock_opname`: list operasional farmasi per status/waktu/lokasi

### 2. Soft delete belum diikuti partial index untuk active rows

- Tabel seperti `patient`, `visit`, `billing`, `payment`, `stock_entry`, `dispensing`, `stock_movement`, dan `stock_opname` sudah punya `deleted_at`.
- Jika query aplikasi dominan `deleted_at is null`, index aktif akan makin membengkak karena ikut membawa row histori.

### 3. Search/autocomplete masih lemah untuk PostgreSQL

- `patient.name`, `medicine.name`, `medical_action.name`, dan `icd10.display` belum disiapkan untuk `ILIKE` / contains search.
- B-tree biasa tidak optimal untuk autocomplete teks bebas.

### 4. Tenant integrity belum di-hard-enforce di level database

- Banyak relasi hanya FK ke `id`, tanpa memastikan parent dan child berasal dari `clinic_id` yang sama.
- Secara aplikasi ini bisa dijaga, tetapi level DB masih memungkinkan mismatch lintas tenant jika terjadi bug.

### 5. Belum ada check constraint untuk aturan bisnis penting

- Belum terlihat penggunaan `check()` untuk validasi seperti:
  - `day_of_week` harus 0-6
  - `qty`, `subtotal`, `discount`, `fee` tidak boleh negatif
  - `default_tax_pct` dan `profit_margin_pct` masuk range valid
  - `source_stock_location_id != target_stock_location_id`
  - `emr_diagnosis.is_primary` dan `is_secondary` tidak boleh konflik

### 6. Inventori belum punya tabel saldo stok teragregasi

- Saat ini schema masih berfokus pada tabel transaksi.
- Jika stok berjalan dihitung dari akumulasi semua transaksi, performa farmasi akan cepat turun saat volume naik.

## Prioritas Eksekusi

### Phase 0 - Baseline Query Nyata

Tujuan: jangan optimasi membabi buta.

- Kumpulkan 10-15 query utama dari modul:
  - pencarian pasien
  - registrasi kunjungan
  - antrean poli
  - autocomplete ICD-10
  - katalog obat
  - billing list
  - payment history
  - stock entry list
  - dispensing list
  - stock opname / movement list
- Jalankan `EXPLAIN (ANALYZE, BUFFERS)` di staging/dev data yang realistis.
- Catat baseline:
  - execution time
  - rows scanned
  - apakah seq scan muncul
  - apakah sort besar terjadi

Output phase ini:
- daftar query prioritas
- tabel panas (hot tables)
- kandidat index yang benar-benar dipakai

### Phase 1 - Quick Wins Indexing

Tujuan: perbaiki list screen dan lookup paling sering.

- Tambah composite index tenant-first untuk tabel operasional:
  - `visit (clinic_id, status, registered_at desc)` partial `deleted_at is null`
  - `visit (clinic_id, doctor_id, registered_at desc)` partial `deleted_at is null`
  - `visit (clinic_id, poly_id, registered_at desc)` partial `deleted_at is null`
  - `billing (clinic_id, status, created_at desc)` partial `deleted_at is null`
  - `payment (clinic_id, paid_at desc)` partial `deleted_at is null`
  - `stock_entry (clinic_id, status, entry_at desc)` partial `deleted_at is null`
  - `dispensing (clinic_id, status, dispensed_at desc)` partial `deleted_at is null`
  - `stock_movement (clinic_id, status, moved_at desc)` partial `deleted_at is null`
  - `stock_opname (clinic_id, status, opname_at desc)` partial `deleted_at is null`
- Evaluasi index status-only yang sekarang; drop jika benar-benar redundant setelah index gabungan terbukti dipakai.
- Tambah index lookup exact-match yang masih kurang bila query aplikasi membutuhkannya:
  - `employee (clinic_id, code)` jika `code` dipakai di UI/form
  - `clinic (code)` jika dipakai untuk slug/subdomain/routing

### Phase 2 - Search Optimization

Tujuan: autocomplete dan pencarian teks tetap cepat.

- Aktifkan extension `pg_trgm`.
- Tambah GIN trigram index untuk:
  - `patient.lower(name)` partial `deleted_at is null`
  - `medicine.lower(name)`
  - `medical_action.lower(name)`
  - `icd10.lower(display)`
- Pertahankan B-tree unique/exact index untuk `code` dan identifier seperti `mr_number`.
- Jika pencarian ICD-10 dominan prefix by code, pastikan query memanfaatkan `code` lebih dulu sebelum `display`.

### Phase 3 - Integrity Hardening

Tujuan: mencegah data salah sejak di DB.

- Tambah `check constraint` bertahap untuk rule yang aman:
  - `doctor_schedule.day_of_week between 0 and 6`
  - `qty >= 0`, `subtotal >= 0`, `discount >= 0`, `fee >= 0`
  - `default_tax_pct between 0 and 100`
  - `profit_margin_pct >= 0`
  - `stock_movement.source_stock_location_id <> target_stock_location_id`
- Perbaiki rule diagnosis:
  - minimal tambah check agar `is_primary` dan `is_secondary` tidak keduanya `true`
  - lebih baik lagi: ubah jadi satu enum diagnosis role di iterasi berikutnya
- Audit nullable business numbers:
  - `billing.billing_number`
  - `dispensing.billing_number`
  - pastikan memang boleh `null` selama draft

### Phase 4 - Tenant-Safe Foreign Keys

Tujuan: isolasi tenant tidak hanya di application layer.

- Untuk tabel penting, pertimbangkan pola FK komposit berbasis `(clinic_id, id)` atau unique composite pada parent lalu reference dari child.
- Kandidat utama:
  - `visit -> patient`
  - `visit -> employee`
  - `visit -> poly`
  - `billing -> visit`
  - `payment -> billing`
  - `dispensing -> visit`
  - `stock_entry -> stock_location`
- Ini perubahan lebih invasif; kerjakan setelah Phase 1-3 stabil.

### Phase 5 - Inventory Scalability

Tujuan: farmasi tetap cepat saat transaksi membesar.

- Tambah tabel saldo stok teragregasi, mis. `stock_balance`.
- Struktur minimal yang disarankan:
  - `clinic_id`
  - `stock_location_id`
  - `medicine_id`
  - `batch_number` nullable
  - `expired_date` nullable
  - `qty_on_hand`
  - `avg_cost`
  - `updated_at`
- Unique key yang disarankan:
  - `(clinic_id, stock_location_id, medicine_id, batch_number, expired_date)`
- Semua layar stok berjalan dan validasi dispensing sebaiknya baca dari tabel saldo ini, bukan menghitung ulang dari semua transaksi.

## Rekomendasi Per Modul

### Patient

- Pertahankan `mr_number` unique per klinik.
- Tambah trigram index untuk `name`.
- Evaluasi apakah `nik` dan `bpjs_number` perlu unique per klinik setelah data lama dibersihkan.

### Visit dan Queue

- Bentuk index berdasarkan list harian dan antrean aktif.
- Evaluasi `queue_date`: jika bisnisnya per hari, lebih baik query menggunakan tanggal yang stabil; hindari filter `date(queue_date)` tanpa index pendukung.

### EMR

- `emr_diagnosis` perlu hardening rule primary/secondary.
- Search ICD-10 harus ditopang trigram/full text, bukan B-tree `display` saja.

### Billing dan Payment

- Tambah index waktu + status + tenant.
- Pastikan histori pembayaran dan rekap kasir tidak bergantung pada status-only index.

### Inventory

- Ini area paling berisiko untuk bottleneck jangka menengah.
- Prioritasnya bukan menambah banyak index detail, tetapi menyiapkan model `stock_balance` dan query stok aktif.

## Urutan Kerja yang Disarankan

1. Kumpulkan query nyata + `EXPLAIN ANALYZE`.
2. Tambah index composite/partial untuk list operasional aktif.
3. Tambah trigram index untuk search/autocomplete.
4. Tambah check constraints yang aman.
5. Desain dan implement `stock_balance`.
6. Baru evaluasi tenant-safe composite foreign keys.

## Hal yang Jangan Dilakukan Sekarang

- Jangan menambah banyak index sekaligus tanpa mengukur write impact.
- Jangan ubah semua FK ke composite FK dalam satu batch besar.
- Jangan membuat partitioning dulu; volume schema saat ini belum menunjukkan kebutuhan itu.
- Jangan menghapus index lama sebelum ada bukti dari `EXPLAIN` atau `pg_stat_statements`.

## Definition of Done

- Query list utama sudah punya baseline sebelum/sesudah.
- Tidak ada seq scan besar pada query operasional utama.
- Search pasien/obat/ICD-10 terasa responsif pada data realistis.
- Soft-delete tables memakai index yang fokus ke active rows.
- Rule bisnis inti sudah dijaga oleh constraint DB, bukan hanya aplikasi.
- Farmasi punya jalur menuju `stock_balance` agar tidak menghitung stok dari nol setiap saat.
