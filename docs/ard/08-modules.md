# 8. Dekomposisi Modul

[< Kembali ke Index](./README.md)

---

## Module Map

```
+--------------------------------------------------------------------+
|                        KLINIKAI APPLICATION                         |
+--------------------------------------------------------------------+
|                        MENU MVP FASE 1                              |
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  |  Menu A:         |  |  Menu B:         |  |  Menu C:         |  |
|  |  PENDAFTARAN     |  |  PELAYANAN       |  |  MANAJEMEN       |  |
|  |                  |  |                  |  |                  |  |
|  |  - Pasien        |  |  - Dashboard Poli|  |  - Jadwal Dokter |  |
|  |  - Pendaftaran   |  |  - Asesmen Awal  |  |  - Jadwal Shift  |  |
|  |  - Antrean       |  |  - SOAP/Diagnosa |  |  - Pengguna/RBAC |  |
|  |  - Ringkasan RM  |  |  - Tindakan      |  |  - Profil Klinik |  |
|  |                  |  |  - Resep Dasar   |  |                  |  |
|  |                  |  |  - Kasir Dasar   |  |                  |  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                    |
|  +------------------+  +------------------+                        |
|  |  Menu D:         |  |  Menu E:         |                        |
|  |  MASTER DATA     |  |  LAPORAN         |                        |
|  |                  |  |                  |                        |
|  |  - Klinik/Layanan|  |  - Dashboard     |                        |
|  |  - SDM           |  |    Harian        |                        |
|  |  - Poli/Ruangan  |  |  - Lap. Kunjungan|                        |
|  |  - Diagnosa      |  |  - Lap. Pendptn  |                        |
|  |  - Tindakan/Tarif|  |  - Lap. Tindakan |                        |
|  |  - Obat          |  |                  |                        |
|  |  - Penjamin      |  |                  |                        |
|  |  - Pembayaran    |  |                  |                        |
|  +------------------+  +------------------+                        |
|                                                                    |
+--------------------------------------------------------------------+
|  CROSS-CUTTING CONCERNS                                            |
|  +------------+ +--------+ +----------+ +---------+ +------------+ |
|  |    Auth    | |  RBAC  | |  Tenant  | |  Audit  | |   Print    | |
|  | (Better-   | | (Role  | | (clinic  | | (Trail  | | (Struk,    | |
|  |  Auth)     | | Guard) | |  Filter) | |  Log)   | |  Surat)    | |
|  +------------+ +--------+ +----------+ +---------+ +------------+ |
+--------------------------------------------------------------------+
```

### Prinsip Pemetaan Menu

- Struktur menu di ARD mengikuti pola aplikasi klinik yang familiar bagi pengguna, tetapi hanya sebagai acuan navigasi untuk MVP rawat jalan.
- Keberadaan label menu bukan komitmen bahwa semua subfitur aplikasi referensi akan diimplementasikan pada Fase 1.
- Setiap menu MVP harus terhubung langsung ke alur rawat jalan, master data inti, atau laporan operasional dasar.
- Domain yang tidak lolos filter ini harus ditandai sebagai `defer` atau `exclude`, bukan disisipkan diam-diam ke menu aktif.

---

## Sinkronisasi Dengan Schema Saat Ini

- **Pendaftaran** dipahami sebagai domain `patient registry` + `visit registration` + `queue` untuk alur kunjungan rawat jalan.
- **Pelayanan** sekarang memayungi `vital_sign`, `emr_soap`, `emr_diagnosis`, `emr_action`, `prescription`, tagihan kunjungan sederhana, item tagihan, dan `payment` sebagai alur pelayanan rawat jalan yang terlihat utuh dari sisi menu.
- **Master Data** tetap menjadi sumber referensi untuk klinik, SDM, fasilitas, diagnosa, tindakan, obat, penjamin, dan metode pembayaran.
- **Farmasi inventori detail** seperti `stock_location`, `stock_entry`, `stock_entry_item`, `dispensing`, `stock_opname`, dan `stock_movement` diperlakukan sebagai batch berikutnya, bukan menu aktif utama pada MVP awal.
- Untuk pembagian schema domain yang menjadi source of truth, lihat `docs/ard/04-data-architecture.md`.

### Pendaftaran Pasien: Ownership dan Detail MVP

#### Front Office / Wajib Saat Registrasi

| Area | Field / Aksi | Catatan |
|---|---|---|
| Pemilihan Pasien | Cari pasien lama | Entry point utama jika pasien sudah terdaftar |
| Pemilihan Pasien | Buat pasien baru | Dipakai jika pasien belum ada |
| Visit | Tanggal kunjungan | Default ke hari ini |
| Visit | Jenis kunjungan (`baru` / `lama`) | Kategori kunjungan administratif |
| Visit | Jenis pelayanan (`sakit` / `sehat`) | Membantu routing dasar |
| Visit | Asal pendaftaran | Sumber kedatangan pasien |
| Visit | Penjamin dasar | Minimal mendukung `umum` |
| Visit | Poli / layanan tujuan | Khusus rawat jalan |
| Visit | Tenaga medis tujuan | Diisi bila diperlukan pada alur klinik |

#### Opsional Dalam MVP

| Area | Field / Aksi | Catatan |
|---|---|---|
| Administratif | Alasan kedatangan singkat | Untuk routing antrean, bukan anamnesis |
| Administratif | Alergi dasar (`ya/tidak`) | Penanda awal; verifikasi detail di asesmen awal |
| Administratif | Penanda prioritas administrasi sederhana | Untuk antrean rawat jalan, bukan triase klinis |
| Skrining ringan | Tinggi badan, berat badan | Boleh diisi di front office bila operasional membutuhkan |
| Administratif | Catatan front office | Catatan non-klinis |
| Administratif | Rujukan dasar dan nama perujuk | Tanpa bridging, SEP, atau otorisasi |

#### Bukan Tanggung Jawab Registrasi MVP

- **Asesmen Awal / Perawat**: tanda vital lengkap, skrining klinis rinci, detail alergi, dan penilaian kondisi pasien.
- **Pelayanan Klinis / Dokter**: anamnesis penuh, SOAP, diagnosa, tindakan, resep, surat medis, dan keputusan medis.
- **Kasir / Backoffice**: status bayar operasional, pembayaran detail, dan proses kasir penuh.
- **Deferred backlog** untuk layar referensi ini dicatat di `docs/backlog/pendaftaran-pasien-deferred.md`.

---

## Data Flow: Alur Kunjungan Rawat Jalan

```
[Resepsionis]          [Perawat]           [Dokter]           [Apoteker]          [Kasir]
     |                     |                   |                   |                  |
     | 1. Registri Pasien  |                   |                   |                  |
     |    (jika belum ada) |                   |                   |                  |
     | 2. Buat Visit /     |                   |                   |                  |
     |    Registrasi RJ    |                   |                   |                  |
     | 3. Masuk Antrean    |                   |                   |                  |
     |-------------------->|                   |                   |                  |
     |                     | 4. Panggil Pasien |                   |                  |
     |                     | 5. Input Vital    |                   |                  |
     |                     |    Sign / Asesmen |                   |                  |
     |                     |------------------>|                   |                  |
     |                     |                   | 6. Input SOAP     |                  |
     |                     |                   | 7. Input Diagnosa |                  |
     |                     |                   | 8. Input Tindakan |                  |
     |                     |                   | 9. Buat E-Resep   |                  |
     |                     |                   |------------------>|                  |
     |                     |                   |                   | 10. Verifikasi   |
     |                     |                   |                   |     Resep        |
     |                     |                   |                   | 11. Catat Obat   |
     |                     |                   |                   |     Diserahkan   |
     |                     |                   |                   | 12. Serah Obat   |
     |                     |                   |                   |----------------->|
     |                     |                   |                   |                  | 13. Proses
     |                     |                   |                   |                  |     Tagihan
     |                     |                   |                   |                  | 14. Terima
     |                     |                   |                   |                  |     Bayar
     |                     |                   |                   |                  | 15. Cetak
     |                     |                   |                   |                  |     Struk
```

---

## Implementation Priority (Fase 1)

| Prioritas | Modul | Justifikasi | Estimasi |
|---|---|---|---|
| **P0** | Auth + RBAC + Tenant Setup | Fondasi untuk semua menu dan pembatasan akses | Sprint 1-2 |
| **P0** | Manajemen + Master Data Inti | Profil klinik, pengguna, dokter, poli, diagnosa, tindakan, obat, penjamin, pembayaran | Sprint 2-3 |
| **P1** | Pendaftaran | Entry point alur utama rawat jalan: pasien, registrasi visit, antrean | Sprint 3-4 |
| **P2** | Pelayanan Klinis | Asesmen, SOAP, diagnosa, tindakan, resep dasar, surat medis dasar | Sprint 5-7 |
| **P3** | Kasir Dasar di Menu Pelayanan | Penyelesaian tagihan kunjungan rawat jalan tanpa akuntansi lanjutan | Sprint 7-8 |
| **P3** | Laporan Operasional | Dashboard harian, kunjungan, pendapatan, tindakan | Sprint 8-9 |

## Deferred and Excluded Domains

### Defer (setelah MVP stabil)

- Farmasi lanjutan: pengelolaan obat detail, stok opname, kartu stok, penerimaan barang, retur, distribusi.
- Dashboard antrean lanjutan, template print lanjutan, dan analitik/grafik yang lebih kompleks.
- Konfigurasi operasional tambahan yang tidak dibutuhkan untuk alur kunjungan rawat jalan dasar.
- Detail non-MVP dari layar `Pendaftaran Pasien` disimpan terpisah di `docs/backlog/pendaftaran-pasien-deferred.md` agar dapat dieksekusi satu per satu setelah MVP stabil.

### Exclude dari Fase 1

- Rawat inap, IGD, kamar & bed, dan domain non-outpatient lain.
- Laboratorium, radiologi, MCU, dan penunjang medis lain.
- Bridging BPJS, SEP, VClaim, PCare, antrean JKN, dan Satu Sehat.
- Gudang farmasi, pengadaan, akuntansi penuh, HR/payroll, dan backoffice enterprise.

### Current Implementation Status (2026-03-07)

- **Auth + RBAC + Tenant Setup**: implemented as the current application foundation:
  - Better-Auth login/session flow is running
  - protected route middleware exists
  - server auth helpers and tenant context helpers exist
  - module-level RBAC helpers exist
  - authenticated app shell with separated public/app route groups exists
  - role-aware sidebar/header layout exists
- **Still not finished in this milestone**:
  - domain module pages beyond landing/login/dashboard
  - action-level authorization pattern on Server Actions
- Because of that, the next recommended implementation step is now: **Pendaftaran / Patient Registry**, followed by **Visit Registration + Queue**, then **Pelayanan**.
