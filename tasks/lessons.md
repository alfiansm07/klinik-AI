# Lessons Learned — Klinikai

<!-- Catat pola kesalahan dan cara menghindarinya di sini -->
<!-- Format: kategori + bullet ringkas -->

## UI Master Data

- **Dialog, bukan Drawer/Sheet** untuk form add/edit. Halaman terpisah untuk upload/bulk.
- **Klik row = navigasi ke detail** (`/master/{module}/{id}`), bukan buka dialog edit. Detail read-only dengan tombol Ubah (FormDialog), Hapus (AlertDialog), Lihat Semua.
- **Pola detail**: Server `[id]/page.tsx` fetch → client `detail-view.tsx` (DetailTable + controlled dialog). Hapus → `router.push()`, edit → `router.refresh()`.
- **Form di file terpisah** (`*-form.tsx`) — reusable di list (tambah) dan detail (edit).
- **Kode auto-generated & immutable**: Gunakan `generateNextCode()` dari `lib/auto-code.ts`. Field `code` disabled di form. Pada update, jangan include `code` di `.set()`.
- **Semua modul master data ikut pola standar** ini: DataTable + row click → detail + FormDialog + StatusBadge + auto-code.
- **Gunakan shared primitives** dari `components/shared/master-data-ui.tsx`. Jangan build shell/footer manual per file.

## UI Operasional (Worklist/HIS)

- **Review HIS = koreksi workflow**, bukan kosmetik. Prioritaskan pola kerja petugas.
- **Klik row = seluruh row actionable** (bukan sebagian cell). Konfirmasi dulu: single click, double click, atau tombol eksplisit.
- **Mulai dari pekerjaan inti petugas**: Halaman `pendaftaran/pasien` = worklist registrasi harian, bukan list master pasien.
- **Ringkasan pasien** padat horizontal di row + popup preview satu klik, bukan bullet list panjang di cell.
- **Placeholder filter** tampilkan label (`- Asuransi -`), bukan nilai internal (`all`).
- **Placeholder visual boleh ada, tapi harus jujur read-only** — jangan bawa logika domain yang belum siap.
- **CTA utama tunggal** di header. Jangan duplikasi kecuali empty state.
- **Tabel padat butuh pemisah visual** (border/garis tipis antar-row dan antar-sel).

## Label & Display

- **Enum, UUID, ID internal tidak boleh tampil di UI — di manapun.** Resolve ke nama/label manusia. Underscore atau UUID di UI = bug.
- **Select relasional**: simpan ID sebagai value, tapi trigger selalu tampilkan label human-readable.
- **Istilah teknis jangan bocor ke UI**: "handover" → "Serah Terima ke Dokter", "disposition" → "Keputusan Tindak Lanjut", dll. Cek referensi aplikasi industri.
- **FK bukan enum**: Jangan asumsi dropdown = FK ke tabel dinamis. Bisa jadi fixed enum — konfirmasi dulu.

## Sizing & Design System

- **Theme default terlalu kecil** untuk staf medis. Rujuk `design-system/klinikai/MASTER.md`.
- **Mulai dari ukuran besar**: `lg` untuk tombol, `h-11+` untuk input, `text-base` untuk label. Jangan mulai dari `sm`.
- **Aksi/tombol ikuti design system** base-lyra, bukan warna ad-hoc. Struktur boleh meniru HIS, gaya visual tetap Klinikai.

## Komponen & Aksesibilitas

- **AlertDialog dari `@base-ui/react`**, bukan radix. `AlertDialogTrigger` tidak support `asChild` — gunakan controlled pattern (`open`/`onOpenChange`).
- **Focus state eksplisit**: Jangan `outline-none` tanpa replacement. Tambahkan `focus-visible` ring.
- **Accordion mobile nav**: Tambahkan `aria-expanded` dan `aria-controls` sejak awal.
- **Gap a11y pada row klik**: Pilih pola yang memenuhi accessibility + workflow petugas sekaligus.

## Database & Schema

- **Migration-first**: Gunakan `db:generate` + `db:migrate`. Hindari `db:push`.
- **Schema baru wajib diikuti migrate** — jangan berhenti di typecheck/build.
- **Migration file tanpa journal entry = hantu**: Pastikan setiap migration punya entry di `meta/_journal.json` + snapshot. Gunakan `drizzle-kit generate` yang otomatis buat keduanya.
- **`drizzle-kit generate` butuh interaktif untuk enum baru**: Tidak bisa di-pipe di non-TTY. Workaround: jalankan manual di terminal user.
- **Heredoc ke `docker exec` gagal di Windows/Git Bash**: Gunakan `docker cp` + `docker exec psql -f`. Tambahkan `MSYS_NO_PATHCONV=1`.
- **Validasi ownership tenant di server**: Cek semua FK (`patientId`, `roomId`, dll) milik `clinicId` aktif. FK hanya jamin keberadaan, bukan isolasi tenant.
- **Gunakan nama domain akhir sejak awal**: Langsung pakai tabel `visit`, bukan tabel sementara yang nanti dibuang.
- **Field optional harus bisa di-clear** di UI edit flow.

## Scope & Workflow

- **Jaga scope MVP**: Jangan expose domain di luar fase (`rawat_inap`, `ugd` di Phase 1 outpatient).
- **Subfitur yang ditunda jangan bocor**: Potong tegas dari schema, form, dan detail view.
- **Submit harus end-to-end**: Placeholder sukses tidak cukup. Persist ke DB, worklist/detail baca data nyata.
- **Worklist dan detail baca sumber data yang sama** dengan form submit — jangan preview constants.
- **Schema ikuti workflow user**: Jika petugas butuh cari by NIK, tambahkan `nik` ke schema + index.

## Navigasi

- **Top nav untuk modul sedikit** — lebih lega daripada sidebar permanen.
- **Master Data dropdown** di desktop, accordion/sheet di mobile. Jangan ratakan submenu ke header.
- **Cek breakpoint transisi** (md/lg) agar header tidak janggal.

## Proses Kerja Agent

- **Verifikasi agent result terhadap file nyata** sebelum lanjut — jangan asumsi subagent konsisten.
- **Update lessons segera** setelah ada pelajaran baru, jangan tunggu akhir sesi.
- **Form wizard cek editability by role**: Pastikan perawat dapat mode edit, dokter read-only — verifikasi logic penentuan mode.
