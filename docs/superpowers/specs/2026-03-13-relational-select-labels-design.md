# Design Spec: Relational Selects Show Labels, Not Internal IDs

## Context

Pada form pendaftaran pasien baru, field `Penjamin` dan `Poli / Ruangan` menampilkan pilihan yang benar saat dropdown dibuka, tetapi setelah user memilih salah satu opsi, teks di trigger berubah menjadi ID panjang. Ini membuat UI terlihat rusak dan membocorkan identifier internal ke user.

Masalah ini bukan sekadar bug lokal pada satu form. Polanya berlaku umum untuk semua select yang menyimpan foreign key atau identifier internal di state, tetapi harus menampilkan label yang dipahami user.

## Problem Statement

Saat select relasional memakai `id` sebagai `value`, komponen saat ini dapat jatuh ke perilaku yang merender `value` mentah pada trigger, bukan label opsi yang dipilih. Akibatnya:

- user melihat UUID atau ID internal setelah memilih opsi
- pengalaman form terasa tidak konsisten dan membingungkan
- bug yang sama mudah terulang di field lain seperti dokter, penjamin, poli, dan select relasional lain

## Goals

- Semua select relasional menampilkan label opsi yang dipilih, bukan ID internal.
- State form dan payload submit tetap menyimpan `id` yang benar.
- Pola ini menjadi aturan umum di seluruh aplikasi, bukan patch satu kasus.
- Perbaikan mengikuti pola komponen yang sudah ada dan menghindari refactor besar.

## Non-Goals

- Mengganti library select.
- Mengubah struktur database atau payload server action.
- Melakukan refactor besar pada semua form yang tidak terkait.

## Approaches Considered

### 1. Local fix pada form pendaftaran saja

Perbaiki hanya `Penjamin` dan `Poli / Ruangan` di `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx`.

Pros:

- cepat
- risiko perubahan kecil

Cons:

- bug mudah terulang di tempat lain
- tidak menegakkan aturan umum yang diminta user

### 2. Shared pattern/helper untuk select relasional

Tetapkan pola bersama agar setiap select relasional membentuk opsi sebagai `{ value, label }`, memakai `value=id` untuk state, dan selalu menyediakan cara eksplisit agar trigger menampilkan `label`.

Pros:

- menyelesaikan akar masalah pola UI
- bisa dipakai ulang di seluruh app
- tetap minim perubahan karena tidak perlu mengganti arsitektur form

Cons:

- perlu audit ringan pada pemakaian select relasional

### 3. Sapu seluruh semua select sekaligus dengan refactor komponen dasar

Ubah komponen dasar select agar semua kasus otomatis ditangani dari level bawah.

Pros:

- sentral dan kuat bila akar masalah memang ada di primitive

Cons:

- scope lebih besar
- berisiko memengaruhi select non-relasional yang saat ini sudah benar
- terlalu agresif untuk bug yang saat ini masih terlokalisasi

## Recommended Approach

Pilih pendekatan 2: shared pattern/helper untuk select relasional.

Alasannya:

- sesuai permintaan user untuk menjadikannya aturan umum
- cukup kecil untuk dikerjakan secara aman
- fokus pada kontrak yang benar: simpan `id`, tampilkan `label`
- memberi satu pola baku yang bisa diaudit dan dicek ulang

## Proposed Design

## 1. Canonical Rule

Untuk semua select relasional di aplikasi:

- `value` yang disimpan di state tetap identifier internal, biasanya `id`
- teks yang terlihat di trigger selalu label human-readable
- placeholder hanya tampil saat belum ada pilihan
- UI tidak boleh menampilkan UUID, slug internal, atau kode state mentah kecuali memang itu label bisnis yang disengaja

## 2. Option Shape

Gunakan bentuk opsi yang eksplisit:

```ts
type SelectOption = {
  value: string;
  label: string;
};
```

Data dari server seperti `guarantors`, `rooms`, atau `doctors` dipetakan ke bentuk ini sebelum dirender atau saat dirender.

## 3. Rendering Contract

Pola implementasi baku untuk select relasional adalah sebagai berikut:

- state form menyimpan `selectedValue` berupa `id`
- daftar opsi dibentuk eksplisit sebagai `{ value, label }`
- label aktif dihitung eksplisit lewat lookup `selectedValue -> label`
- trigger merender label aktif itu secara eksplisit
- placeholder hanya dirender jika tidak ada nilai aktif

Dengan aturan ini, tampilan user tidak bergantung pada fallback internal primitive yang berisiko merender `value` mentah.

Helper kecil seperti `getSelectedOptionLabel(options, value)` boleh dipakai agar kontraknya seragam di semua layar.

## 4. Rollout Boundary

Karena user meminta ini menjadi aturan umum di seluruh aplikasi, rollout harus dibagi menjadi dua bagian yang jelas.

### Phase 1: Proof and local repair

Perbaikan awal wajib mencakup layar yang terbukti rusak dan field relasional di flow yang sama:

- `Penjamin` di `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx`
- `Poli / Ruangan` di `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx`
- `Tenaga Medis` di `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx`

### Phase 2: App-wide audit and alignment

Sebelum pekerjaan dianggap selesai terhadap aturan umum, implementasi harus menginventaris semua select relasional di aplikasi yang memakai identifier internal sebagai `value`, lalu memastikan semuanya mengikuti pola baku yang sama.

Keluaran minimum fase ini:

- daftar lokasi select relasional yang ditemukan
- status tiap lokasi: `already-correct`, `fixed`, atau `not-relational`
- tidak ada select relasional yang masih menampilkan identifier internal setelah dipilih

## 5. Error Prevention

Untuk mencegah bug terulang:

- hindari passing nilai `null` ke select bila primitive mengharapkan string atau `undefined`
- samakan tipe nilai kosong di seluruh form (`""` atau `undefined`, dipilih sesuai kontrak komponen)
- gunakan helper kecil seperti `getSelectedOptionLabel(options, value)` agar lookup label konsisten dan mudah dibaca

## Data Flow

```text
Server data -> map ke opsi { value: id, label: name }
             -> select menyimpan value=id di state
             -> trigger lookup value aktif
             -> trigger menampilkan label terkait
             -> submit payload tetap kirim id
```

## Testing and Verification

Verifikasi phase 1:

- pilih `Penjamin`, lalu pastikan trigger menampilkan nama penjamin yang dipilih
- pilih `Poli / Ruangan`, lalu pastikan trigger menampilkan nama poli yang dipilih
- pilih `Tenaga Medis`, lalu pastikan trigger menampilkan nama tenaga medis yang dipilih
- refresh flow dan pastikan nilai awal/default tetap menampilkan label yang benar
- pastikan submit tetap mengirim `id` valid dan server action tidak berubah perilakunya

Verifikasi phase 2:

- lakukan inventory select relasional di app
- untuk setiap lokasi, cek bahwa label yang tampil sesudah memilih opsi sama dengan label item yang diklik user
- catat hasil audit sehingga batas selesai aturan umum dapat dibuktikan, bukan diasumsikan

## Risks and Mitigations

- Risiko: ada select yang bergantung pada fallback lama dari primitive.
  Mitigasi: audit hanya select relasional dan ubah secara eksplisit.

- Risiko: perbedaan representasi nilai kosong (`null`, `""`, `undefined`) membuat trigger tidak sinkron.
  Mitigasi: pilih satu kontrak nilai kosong yang konsisten per komponen.

- Risiko: developer berikutnya mengulang pola lama.
  Mitigasi: lesson sudah dicatat di `tasks/lessons.md`, dan helper/pola shared dipakai sebagai acuan implementasi.

## Implementation Notes

- Mulai dari perubahan paling sempit di flow pendaftaran untuk membuktikan pola.
- Jika akar masalah ternyata berasal dari wrapper `Select` di `apps/web/src/components/ui/select`, evaluasi perubahan kecil di level primitive hanya setelah dipastikan aman untuk select non-relasional.
- Hindari refactor besar sebelum ada bukti bahwa primitive adalah sumber utama masalah.

## Success Criteria

- Tidak ada lagi UUID atau ID internal yang tampil di trigger select relasional setelah user memilih opsi.
- Label yang tampil selalu sama dengan teks opsi yang diklik user.
- Submit tetap bekerja dengan payload berbasis `id`.
- Flow pendaftaran pasien baru sudah mengikuti pola baku di semua field relasionalnya.
- Audit app-wide menghasilkan daftar lokasi dan tidak menyisakan select relasional yang masih menampilkan identifier internal.
