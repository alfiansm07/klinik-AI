# Branch and PR Workflow

Gunakan alur ini untuk menjaga `master` tetap rapi, mudah direview, dan aman di-merge.

## Aturan Utama

- Jangan develop langsung di `master`.
- Satu branch hanya untuk satu tujuan kerja.
- Merge lewat Pull Request.
- Hapus branch dan worktree setelah merge.

## Alur Standar

1. Update branch utama.

```bash
git checkout master
git pull --ff-only
```

2. Buat branch baru dari `master`.

```bash
git checkout -b feature/nama-fitur
```

3. Kalau butuh workspace terpisah, buat worktree.

```bash
git worktree add .worktrees/feature-nama-fitur -b feature/nama-fitur
```

4. Kerjakan perubahan, commit kecil yang jelas, lalu push.

```bash
git push -u origin feature/nama-fitur
```

5. Buat PR ke `master`.

6. Setelah PR merge, rapikan lokal.

```bash
git checkout master
git pull --ff-only
git branch -d feature/nama-fitur
git worktree remove .worktrees/feature-nama-fitur
git worktree prune
```

## Alur Stacked PR

Pakai alur ini kalau fitur B bergantung pada fitur A.

1. Buat branch A dari `master`.
2. Buat branch B dari branch A.
3. Buat PR A lebih dulu.
4. Buat PR B dengan base ke branch A.
5. Setelah PR A merge:
   - retarget PR B ke `master`, atau
   - buat PR baru dari branch B ke `master` bila PR lama otomatis tertutup.

Gunakan stacked PR hanya jika benar-benar ada dependensi. Kalau fitur bisa berdiri sendiri, pisahkan langsung dari `master`.

## Aturan Worktree

- Simpan worktree proyek di `.worktrees/`.
- Jangan commit isi `.worktrees/`.
- Worktree boleh memakai `.env` lokal hasil salin dari workspace utama untuk verifikasi lokal.
- Hapus worktree setelah branch terkait merge atau dibatalkan.

## Aturan Migration

- Gunakan workflow migration-first.
- Commit schema, file migration SQL, snapshot, dan journal bersama-sama.
- Kalau migration sudah diterapkan lalu butuh koreksi, buat migration baru. Jangan ubah migration lama diam-diam.

## Checklist Sebelum Merge

- Branch dibuat dari base yang benar.
- `git status` bersih dari artefak yang tidak perlu.
- Test dan verifikasi yang relevan sudah dijalankan.
- PR hanya berisi satu tujuan kerja.
- Branch lama dan worktree lama yang sudah merged siap dibersihkan.
