# Backlog Tunda - Pendaftaran Pasien

Dokumen ini menampung item dari layar referensi `Pendaftaran -> Pendaftaran Pasien` yang sengaja tidak masuk ke MVP Phase 1 rawat jalan. Tujuannya agar item tunda tidak hilang, tetapi juga tidak bocor menjadi komitmen MVP.

## Cara Pakai

- Setiap item di dokumen ini diperlakukan sebagai backlog terpisah.
- Setelah MVP stabil, item bisa dieksekusi satu per satu sebagai spesifikasi lanjutan.
- Item hanya boleh dipindahkan ke scope aktif jika ada keputusan produk baru dan penyesuaian `PRD/ARD`.

## Deferred Items dari Layar Referensi

| Item | Terlihat di layar referensi | Alasan ditunda |
|---|---|---|
| Fitur `Daftar Laboratorium` | Tombol aksi di daftar pendaftaran | Di luar scope rawat jalan dasar dan membuka alur penunjang medis |
| Fitur `Daftar Rencana Kontrol` | Tombol aksi di daftar pendaftaran | Membutuhkan alur kontrol/follow-up yang lebih matang |
| `Print` dan `Export Excel` pada daftar | Tombol aksi massal | Bukan prioritas MVP awal; bisa ditambahkan setelah operasional inti stabil |
| `Status Pembayaran` di daftar pendaftaran | Kolom list + filter | Berpotensi mencampur registrasi dengan domain kasir |
| `Status BPJS` | Kolom list + filter | Membuka integrasi BPJS, SEP, dan eligibility flow |
| `Status Pelayanan` yang lebih rinci | Kolom list | Perlu definisi state machine lintas modul yang lebih lengkap |
| `Status General Consent` | Kolom list + filter | Perlu desain consent flow dan dokumen pendukung |
| `Cetak` multi-aksi dari daftar | Tombol aksi dropdown | Bergantung pada desain dokumen cetak dan hak akses yang lebih rinci |
| `Lihat Riwayat` dan `Pembayaran` dari detail daftar | Tombol aksi cepat | Membuka flow riwayat longitudinal dan kasir dari layar registrasi |
| `Cetak Surat Berobat` | Tombol aksi detail | Perlu definisi dokumen, template, dan aturan penerbitan |
| `Ubah Pasien` langsung dari detail registrasi | Tombol aksi detail | Bisa memicu konflik ownership dengan modul master pasien |
| `Pendaftaran Sekaligus (Massal)` | Tombol di halaman registrasi | Use case khusus dan menambah kompleksitas validasi |
| `Tarif Pendaftaran` manual + `Status Bayar` | Field di form registrasi | Berisiko menarik logika billing ke front office |
| `Promotif Preventif` | Field pilihan pada form | Perlu definisi program layanan yang lebih jelas |
| `Tindakan` di form registrasi | Field bebas di area data pelayanan | Seharusnya milik tahap pelayanan klinis |
| `Skrining visual` tiga tingkat penuh | Opsi stabil/risiko/darurat | Versi penuh lebih dekat ke triase dan butuh aturan klinis |
| Detail tanda vital lebih lengkap | Tinggi, berat, sistole, diastole, dan potensi field lain | Lebih tepat dimiliki asesmen awal, bukan registrasi wajib |
| `Keadaan/Kelainan Pasien` | Checkbox handaya, difabel, lansia, lain-lain | Perlu desain data dan aturan pelayanan yang lebih matang |
| `Penanggung Jawab Pasien` dan relasinya | Nama, usia, hubungan, no HP | Penting untuk kasus tertentu, tetapi tidak wajib untuk semua visit MVP |
| `Rujukan Dari` detail | Dropdown khusus + nama perujuk | Versi sederhana masih boleh; versi detail ditunda |
| `Instalasi` dengan `Gawat Darurat` dan `Rawat Inap` | Pilihan rawat jalan, gawat darurat, rawat inap | Bertentangan dengan scope outpatient-only MVP |
| Multi pilihan `Poli / Ruangan` bergaya kartu | Banyak opsi layanan sekaligus | Butuh aturan alokasi layanan dan UI yang lebih kompleks |
| `Simpan & Daftarkan Lainnya` | Tombol aksi lanjutan | Cocok untuk optimasi operasional setelah alur dasar stabil |

## Non-Goals untuk MVP Saat Ini

- Tidak membawa IGD, rawat inap, kamar, atau bed ke flow registrasi.
- Tidak membawa BPJS, SEP, VClaim, atau eligibility check ke flow registrasi.
- Tidak membawa proses kasir penuh ke layar pendaftaran.
- Tidak menjadikan registrasi sebagai tempat input klinis rinci.
- Tidak menambah laporan, export, atau print lanjutan sebelum flow inti stabil.

## Trigger Kapan Item Ini Layak Dieksekusi

- Flow pendaftaran rawat jalan dasar sudah stabil dipakai harian.
- Ownership antara registrasi, asesmen awal, pelayanan, dan kasir sudah jelas di produk.
- Ada kebutuhan operasional nyata dari pengguna, bukan hanya karena ada di aplikasi referensi.
- Perubahan tidak merusak batas scope `outpatient-only` atau sudah masuk fase produk berikutnya.
