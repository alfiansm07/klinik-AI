# Global Product Requirements Document (PRD)
**Nama Produk:** Klinikai (SaaS Manajemen Klinik)
**Fase Rilis:** Fase 1 - Minimum Viable Product (Fokus Rawat Jalan / Outpatient)
**Target Pengguna:** Klinik Pratama, Klinik Utama, Praktik Mandiri Dokter/Dokter Gigi

---

## 1. Visi Produk
Menyediakan sistem informasi klinik berbasis SaaS (*multi-tenant*) untuk operasional rawat jalan yang cepat dipakai, mudah dipahami staf klinik, dan cukup kuat sebagai fondasi pengembangan fase berikutnya.

## 2. Aktor & Hak Akses (User Roles)
Sistem ini akan mengakomodasi otorisasi berbasis peran (*Role-Based Access Control*):
* **Superadmin SaaS:** Mengelola pendaftaran *tenant* (klinik baru) dan administrasi langganan pada level platform.
* **Admin / Manajer Klinik:** Memiliki akses penuh ke konfigurasi Master Data, Manajemen, dan Laporan Operasional.
* **Pendaftaran / Resepsionis:** Akses ke modul Pasien, Antrean, dan Jadwal Dokter.
* **Perawat / Bidan:** Akses ke Asesmen Awal (Tanda vital, Anamnesa) dan antrean poli.
* **Dokter:** Akses ke Rekam Medis (SOAP), Diagnosa, Tindakan, dan E-Resep.
* **Apoteker / Asisten Apoteker:** Akses ke verifikasi resep dan pencatatan penyerahan obat rawat jalan dasar.
* **Kasir:** Akses ke kasir dasar, pembayaran, dan cetak struk.

---

## 3. Cakupan Modul Utama & Fitur (Fase 1)

### Prinsip Adaptasi Menu
Struktur menu Fase 1 mengambil inspirasi dari aplikasi klinik yang sudah umum dipakai di lapangan agar proses adopsi lebih cepat. Namun, struktur ini diperlakukan sebagai **acuan navigasi dan mental model pengguna**, bukan komitmen untuk meniru seluruh fitur aplikasi referensi secara 1:1.

Setiap item menu yang masuk Fase 1 harus memenuhi salah satu syarat berikut:
* Mendukung alur utama rawat jalan dari pendaftaran sampai pembayaran.
* Dibutuhkan sebagai master data inti untuk menjalankan alur tersebut.
* Dibutuhkan untuk laporan operasional dasar harian klinik.

### Menu MVP Fase 1

#### Menu A: Pendaftaran
* **Pasien:** Registrasi pasien baru, pencarian pasien lama, dan pembuatan nomor rekam medis otomatis.
* **Pendaftaran Kunjungan:** Pendaftaran rawat jalan ke poli/layanan tujuan, dokter tujuan, dan kategori penjamin dasar.
* **Antrean:** Status antrean kunjungan (menunggu, dipanggil, diperiksa, selesai) dan pemanggilan antrean sederhana.
* **Rekam Medis Ringkas:** Ringkasan identitas pasien dan riwayat kunjungan untuk membantu front office dan klinisi.

##### Spesifikasi Pendaftaran Pasien - Field Wajib MVP
* **Pemilihan Pasien:** Cari pasien lama atau buat pasien baru sebelum kunjungan dibuat.
* **Waktu Kunjungan:** Tanggal kunjungan, dengan default hari ini.
* **Jenis Kunjungan:** Baru atau lama.
* **Jenis Pelayanan:** Kunjungan sakit atau kunjungan sehat.
* **Asal Pendaftaran:** Sumber kedatangan pasien sebagai metadata registrasi, misalnya datang langsung atau rujukan internal sederhana.
* **Penjamin:** Kategori penjamin dasar, minimal umum.
* **Poli / Layanan Tujuan:** Poli pemeriksaan rawat jalan yang dituju.
* **Tenaga Medis Tujuan:** Dokter atau petugas klinis utama yang dituju, jika klinik memakai penugasan saat registrasi.

##### Spesifikasi Pendaftaran Pasien - Field Opsional MVP
* **Alasan Kedatangan Singkat:** Catatan ringkas untuk membantu routing antrean, bukan pengganti anamnesis klinis.
* **Alergi Dasar:** Penanda awal alergi yang dinyatakan pasien, dengan verifikasi dan detail di Asesmen Awal.
* **Penanda Prioritas Administrasi:** Penanda prioritas sederhana untuk antrean rawat jalan, bukan triase klinis.
* **Tinggi Badan dan Berat Badan:** Boleh diisi saat pendaftaran jika alur klinik membutuhkannya, tetapi tidak wajib untuk semua visit.
* **Catatan Administratif:** Catatan singkat front office yang tidak memuat keputusan klinis.
* **Rujukan Dasar:** Informasi sumber rujukan dan nama perujuk bila tersedia, hanya sebagai metadata registrasi tanpa alur otorisasi lanjutan.

##### Yang Tidak Masuk Form Registrasi MVP
* Pemeriksaan klinis rinci, tanda vital lengkap, dan skrining keperawatan detail dipindahkan ke tahap **Asesmen Awal**.
* Diagnosa, tindakan, resep, dan keputusan medis dipindahkan ke tahap **Pelayanan**.
* Daftar item yang ditunda dari layar referensi dicatat terpisah di `docs/backlog/pendaftaran-pasien-deferred.md`.

#### Menu B: Pelayanan
* **Dashboard Poli:** Daftar pasien yang menunggu di poli spesifik.
* **Asesmen Awal:** Input tanda vital, keluhan awal, alergi, dan catatan perawat/bidan.
* **Pemeriksaan Dokter:** Input SOAP, diagnosa, dan rencana terapi.
* **Tindakan:** Pencatatan tindakan medis yang otomatis terhubung ke tagihan.
* **Resep Rawat Jalan Dasar:** Pembuatan resep elektronik dan pencatatan obat pasien untuk alur rawat jalan dasar.
* **Surat Medis Dasar:** Cetak surat sakit dan rujukan eksternal manual.
* **Kasir Dasar:** Penyelesaian tagihan kunjungan rawat jalan sederhana dan cetak struk, tanpa akuntansi lanjutan.

#### Menu C: Manajemen
* **Jadwal Dokter:** Pengaturan jadwal praktik dokter per hari atau sesi.
* **Jadwal Shift:** Pengaturan shift dasar untuk operasional klinik.
* **Pengguna & Hak Akses:** Pengelolaan akun pengguna internal dan peran operasional.
* **Profil Klinik:** Identitas klinik dan konfigurasi dasar yang memengaruhi operasional harian.

#### Menu D: Master Data
* **Master Klinik & Layanan:** Poli/klinik, ruang pemeriksaan rawat jalan, dan layanan yang dipakai pada rawat jalan.
* **Master SDM:** Dokter, pegawai, dan referensi petugas yang muncul pada operasional harian.
* **Master Medis:** Diagnosa, tindakan, tarif tindakan, dan komponen tarif yang diperlukan pada visit rawat jalan.
* **Master Obat:** Referensi obat/alkes untuk resep rawat jalan dasar, bukan modul inventori farmasi.
* **Master Penjamin & Pembayaran:** Penjamin dasar dan metode pembayaran.

#### Menu E: Laporan
* **Dashboard Harian:** Ringkasan kunjungan dan pendapatan harian.
* **Laporan Kunjungan:** Berdasarkan tanggal, poli, dokter, dan penjamin.
* **Laporan Pendapatan:** Rekap pembayaran kasir harian atau per shift.
* **Laporan Tindakan:** Rekap tindakan yang dilakukan pada kunjungan rawat jalan.

### Item Referensi yang Ditunda Setelah MVP
* **Farmasi Lanjutan:** Pengelolaan obat detail, stok opname, kartu stok, penerimaan barang, distribusi, retur, dan pengadaan.
* **Penunjang Medis:** Laboratorium, radiologi, MCU, dan layanan penunjang lain di luar alur rawat jalan dasar.
* **BPJS & Integrasi Nasional:** Bridging BPJS, VClaim, SEP, antrean JKN, PCare, dan Satu Sehat.
* **Operasional Lanjutan:** Dashboard antrean lanjutan, template print lanjutan, survey kepuasan, dan grafik analitik kompleks.
* **Backoffice Non-MVP:** Akuntansi penuh, gudang farmasi, pengadaan, kepegawaian detail, dan konfigurasi enterprise lain.

---

## 4. Di Luar Cakupan (Roadmap Fase 2 & Selanjutnya)
*Fitur berikut tidak akan dikembangkan di rilis MVP Fase 1:*
* *Bridging* BPJS (VClaim, PCare, Antrean JKN, SEP, approval SEP, bridging lanjutan).
* *Bridging* SatuSehat Kemenkes (IHS) dan integrasi nasional sejenis.
* Modul Rawat Inap, IGD, kamar & bed, serta alur kunjungan non-rawat-jalan.
* Modul Laboratorium, Radiologi, MCU, dan layanan penunjang klinis lain.
* Farmasi inventori penuh: pengadaan, gudang, distribusi, retur, stok opname, dan audit stok detail.
* Akuntansi jurnal lanjutan, procurement, HR/payroll, dan backoffice enterprise.
* Portal mandiri pasien, booking online, dan grafik analitik lanjutan.
