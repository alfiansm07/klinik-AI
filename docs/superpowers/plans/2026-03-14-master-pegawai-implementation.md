# Master Pegawai Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `Master Data -> Pegawai` for Klinikai with a full employee record, repeatable license rows, list and detail pages, and a large but usable dialog form.

**Architecture:** Add clinic-scoped `employee` and `employee_license` tables, then build the standard master-data route structure on top of them. Keep reads in Server Components, mutations in Server Actions, and implement the large form with `@tanstack/react-form` plus small helper functions for repeatable license rows and fixed `jabatan` options.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui base-lyra primitives, `@tanstack/react-form`, Drizzle ORM, PostgreSQL, Bun, `node:test` / `bun test`.

---

## File Structure Map

### Create

- `apps/web/src/app/(app)/master/pegawai/page.tsx` - server page for the employee list.
- `apps/web/src/app/(app)/master/pegawai/actions.ts` - server queries and mutations for employee and license data.
- `apps/web/src/app/(app)/master/pegawai/pegawai-view.tsx` - client list table, filters, row navigation, and add dialog.
- `apps/web/src/app/(app)/master/pegawai/pegawai-form.tsx` - large sectioned employee form using `@tanstack/react-form`.
- `apps/web/src/app/(app)/master/pegawai/constants.ts` - fixed `jabatan` options, labels, select helpers, and other form enums if needed.
- `apps/web/src/app/(app)/master/pegawai/pegawai-shared.ts` - pure helpers, shared types, license-row normalization, and formatting utilities.
- `apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts` - tests for helpers and validation-oriented data shaping.
- `apps/web/src/app/(app)/master/pegawai/[id]/page.tsx` - server page for one employee detail.
- `apps/web/src/app/(app)/master/pegawai/[id]/detail-view.tsx` - client detail screen with edit and delete actions.

### Modify

- `packages/db/src/schema/master.ts` - add new enums and tables for employee and employee license.
- `packages/db/src/schema/relations.ts` - add relations for employee and employee license.
- `packages/db/src/schema/index.ts` - export new schema objects.
- `apps/web/src/lib/app-navigation.ts` - add `Pegawai` under the master-data navigation.

### Verification Commands

- `bun test "apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts"`
- `bun run db:generate`
- `bun run db:migrate`
- `bun run check-types`

## Chunk 1: Schema and Shared Constants

### Task 1: Add fixed `jabatan` constants and helper tests

**Files:**
- Create: `apps/web/src/app/(app)/master/pegawai/constants.ts`
- Create: `apps/web/src/app/(app)/master/pegawai/pegawai-shared.ts`
- Create: `apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts`

- [ ] **Step 1: Write failing helper tests**

Add tests that lock these behaviors:

```ts
assert.equal(JABATAN_OPTIONS[0]?.key, "staf_non_medis")
assert.equal(formatJabatanLabel("apoteker"), "Apoteker")
assert.equal(formatJabatanLabel("unknown"), "-")
assert.equal(normalizeLicenseRows([{ licenseType: "", licenseNumber: "" }]).length, 0)
```

- [ ] **Step 2: Run the helper test and confirm failure**

Run:

```bash
bun test "apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts"
```

Expected: FAIL because the files and exports do not exist yet.

- [ ] **Step 3: Add canonical `jabatan` options and pure helpers**

Implement:

- the exact `key` + `label` option set from the approved spec
- label lookup helper
- license-row normalization helper that drops empty rows and trims string fields
- any small shared formatters needed by list or detail views

- [ ] **Step 4: Re-run the helper test**

Expected: PASS.

- [ ] **Step 5: Review the option set against the approved spec**

Make sure the stored keys are stable and the user-facing labels match the spec exactly.

### Task 2: Add employee tables to the database schema

**Files:**
- Modify: `packages/db/src/schema/master.ts`
- Modify: `packages/db/src/schema/relations.ts`
- Modify: `packages/db/src/schema/index.ts`

- [ ] **Step 1: Add failing helper tests for license invariants**

Extend `apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts` with cases for:

```ts
assert.equal(validateLicenseLifetimeRule({ isLifetime: true, validUntil: null }), true)
assert.equal(validateLicenseLifetimeRule({ isLifetime: true, validUntil: new Date("2026-01-01") }), false)
assert.equal(validateLicenseLifetimeRule({ isLifetime: false, validUntil: null }), false)
```

- [ ] **Step 2: Run the helper test and confirm failure**

Run:

```bash
bun test "apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts"
```

Expected: FAIL because the new helper is not implemented yet.

- [ ] **Step 3: Add the lifetime-license validation helper**

Implement the pure helper in `pegawai-shared.ts`.

- [ ] **Step 4: Re-run the helper test**

Expected: PASS.

- [ ] **Step 5: Add enums and tables in `master.ts`**

Add:

- `employee_gender` enum if needed
- `employee_religion` enum if kept as fixed values
- `employee_marital_status` enum if kept as fixed values
- `employee_license_type` enum
- `employee` table with clinic-scoped unique code and search-supporting indexes
- `employee_license` table with clinic-scoped foreign key, sort order, indexes, and a CHECK constraint for the `valid_until` / `is_lifetime` rule

- [ ] **Step 6: Add relations in `relations.ts`**

Register:

- `employee` -> many `employee_license`
- `employee_license` -> one `employee`

- [ ] **Step 7: Export new schema objects from `index.ts`**

Expected: schema barrels compile cleanly.

- [ ] **Step 8: Generate the migration**

Run:

```bash
bun run db:generate
```

Expected: a new migration file plus journal metadata.

- [ ] **Step 9: Review generated SQL before applying it**

Check:

- clinic-scoped unique `(clinic_id, code)` on `employee`
- child foreign key and cascade behavior
- expected indexes for `is_active`, `position`, and `(clinic_id, employee_id, sort_order)`
- CHECK constraint that enforces the `is_lifetime` and `valid_until` rule

- [ ] **Step 10: Apply the migration**

Run:

```bash
bun run db:migrate
```

Expected: migration applies cleanly.

## Chunk 2: Server Actions and Data Mapping

### Task 3: Build employee server-side reads and mutations

**Files:**
- Create: `apps/web/src/app/(app)/master/pegawai/actions.ts`
- Modify: `apps/web/src/app/(app)/master/pegawai/pegawai-shared.ts`

- [ ] **Step 1: Add failing helper tests for action-facing data shaping**

Add tests for:

- required employee field validation
- trimming and normalization of string fields
- filtering blank license rows
- preserving existing license rows in edit-mode mapping
- reconciling submitted licenses by ID, insert, keep, and delete behavior

- [ ] **Step 2: Run the helper test and confirm failure**

Run:

```bash
bun test "apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts"
```

Expected: FAIL because the new helpers are not implemented yet.

- [ ] **Step 3: Define the shared action types**

Create types for:

- `PegawaiRow`
- `PegawaiDetail`
- `PegawaiFormValues`
- `PegawaiLicenseFormValue`
- action result shape

- [ ] **Step 4: Implement the pure helpers needed by the actions**

Implement:

- employee payload normalizer
- required-field validator
- edit-mode mapper
- license reconciliation helper with exact rules:
  - update rows with existing owned IDs
  - insert rows without IDs
  - delete only rows omitted from the submitted payload
  - preserve unchanged rows and `sortOrder` unless edited explicitly

- [ ] **Step 5: Re-run the helper test**

Expected: PASS.

- [ ] **Step 6: Implement list query**

Add `getPegawaiList()` scoped by active `clinicId`.

- [ ] **Step 7: Implement detail query**

Add `getPegawaiDetail(id)` scoped by active `clinicId`, including ordered license rows.

- [ ] **Step 8: Implement next-code query**

Add `getNextPegawaiCode()` using the shared `generateNextCode()` helper pattern.

- [ ] **Step 9: Typecheck after read-only actions**

Run:

```bash
bun run check-types
```

Expected: either PASS or focused errors in the new files only.

- [ ] **Step 10: Implement create-flow validation gate**

Wire required-field validation and normalized license rows before DB insert.

- [ ] **Step 11: Implement create employee insert**

Insert the employee with generated immutable code and normalized fields.

- [ ] **Step 12: Implement create license inserts**

Insert child licenses with stable `sortOrder` for non-empty normalized rows only.

- [ ] **Step 13: Add create revalidation**

Revalidate `/master/pegawai` after successful create.

- [ ] **Step 14: Implement update employee write path**

Scope the employee by active `clinicId` and never update `code`.

- [ ] **Step 15: Implement update license reconciliation**

Apply the exact helper rules for keep, insert, update, and delete while rejecting child row IDs not owned by the same clinic and parent employee.

- [ ] **Step 16: Add update revalidation**

Revalidate `/master/pegawai` and `/master/pegawai/[id]` after successful update.

- [ ] **Step 17: Implement delete flow**

Scope by active `clinicId`, rely on cascade or explicit child cleanup, and revalidate `/master/pegawai`.

- [ ] **Step 18: Typecheck the server module early**

Run:

```bash
bun run check-types
```

Expected: either PASS or a small set of focused type errors in the new files only.

## Chunk 3: Navigation and List Page

### Task 4: Add master navigation entry

**Files:**
- Modify: `apps/web/src/lib/app-navigation.ts`

- [ ] **Step 1: Add the `Pegawai` navigation item**

Requirements:

- place it in the existing master-data section
- choose a people-related icon already available in `lucide-react`
- keep ordering sensible with the current master menu

- [ ] **Step 2: Review navigation for consistency**

Expected: label, route, and icon fit the existing menu style.

### Task 5: Build the server list page and client list view

**Files:**
- Create: `apps/web/src/app/(app)/master/pegawai/page.tsx`
- Create: `apps/web/src/app/(app)/master/pegawai/pegawai-view.tsx`

- [ ] **Step 1: Create the server page shell**

Follow the same pattern as other master pages:

- page header
- server fetch from `getPegawaiList()`
- pass data into the client view

- [ ] **Step 2: Create list columns and row navigation**

Implement columns for:

- code
- name
- jabatan
- NIK / NIP
- contact
- status

And make row click navigate to `/master/pegawai/[id]`.

- [ ] **Step 3: Add toolbar search and filters**

Implement:

- one search field for code, name, NIK, NIP, and phone
- status filter
- searchable jabatan filter
- primary `Tambah Pegawai` action

- [ ] **Step 4: Add empty state and add dialog trigger**

Expected: empty state and toolbar both offer `Tambah Pegawai`.

- [ ] **Step 5: Render the add dialog shell**

Use the shared `FormDialog` pattern and large dialog width, with the form rendered inside.

## Chunk 4: Large Pegawai Form UX

### Task 6: Build the sectioned form with repeatable licenses

**Files:**
- Create: `apps/web/src/app/(app)/master/pegawai/pegawai-form.tsx`
- Modify: `apps/web/src/app/(app)/master/pegawai/constants.ts`
- Modify: `apps/web/src/app/(app)/master/pegawai/pegawai-shared.ts`

- [ ] **Step 1: Define form defaults and mappers**

Add helpers for:

- blank employee defaults
- blank license row defaults
- mapping detail data into form values for edit mode

- [ ] **Step 2: Build the form shell with `@tanstack/react-form`**

Create the top-level form instance, submit handler wiring, and section containers before rendering all fields.

- [ ] **Step 3: Render `Identitas Utama` fields**

Render:

- disabled `Kode Pegawai`
- `Nama Lengkap`
- `Gelar Depan`
- `Gelar Belakang`
- `NIK`
- `NIP/NRP`
- `Referensi Eksternal`

- [ ] **Step 4: Render `Data Pribadi` fields**

Render:

- `Jenis Kelamin`
- `Tempat Lahir`
- `Tanggal Lahir`
- `Agama`
- `Status Perkawinan`

- [ ] **Step 5: Render `Kontak` fields**

Render:

- `Alamat`
- `Email`
- `Telp/HP`

- [ ] **Step 6: Render `Profesi dan Penempatan` fields**

Render:

- `Jabatan`
- `Instansi Induk`
- `Nama Tempat Bekerja Sekarang`

- [ ] **Step 7: Add `Jabatan` searchable field UX**

Requirements:

- searchable interaction
- stable stored key
- label-only rendering
- keyboard-accessible selection

- [ ] **Step 8: Render repeatable license rows**

Render all license row fields:

- `Jenis Izin`
- `Nomor Izin`
- `Tanggal Terbit`
- `Tanggal Berlaku Sampai`
- `Seumur Hidup`
- `Catatan`

- [ ] **Step 9: Add repeatable license row interactions**

Requirements:

- add row
- remove row
- field-level validation for partial rows
- `Seumur Hidup` disables and clears `Tanggal Berlaku Sampai`
- mobile-safe stacked layout

- [ ] **Step 10: Render `Status` field**

Render `Status Aktif` with the approved default behavior.

- [ ] **Step 11: Add sticky form actions and submit handling**

Requirements:

- reuse `MasterFormActions` if practical
- keep save and cancel visible
- create mode calls `createPegawai`
- edit mode calls `updatePegawai`
- success closes dialog and refreshes parent surfaces

- [ ] **Step 12: Re-run helper tests**

Run:

```bash
bun test "apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts"
```

Expected: PASS.

## Chunk 5: Detail Page and Delete Flow

### Task 7: Build the server detail page and client detail view

**Files:**
- Create: `apps/web/src/app/(app)/master/pegawai/[id]/page.tsx`
- Create: `apps/web/src/app/(app)/master/pegawai/[id]/detail-view.tsx`

- [ ] **Step 1: Create the server detail page**

Follow the standard pattern:

- fetch by ID with clinic scoping
- return `notFound()` when missing
- render a page header plus detail view

- [ ] **Step 2: Build detail sections**

Render read-only sections for:

- `Identitas Utama`: `Kode Pegawai`, `Nama Lengkap`, `Gelar Depan`, `Gelar Belakang`, `NIK`, `NIP/NRP`, `Referensi Eksternal`
- `Data Pribadi`: `Jenis Kelamin`, `Tempat Lahir`, `Tanggal Lahir`, `Agama`, `Status Perkawinan`
- `Kontak`: `Alamat`, `Email`, `Telp/HP`
- `Profesi dan Penempatan`: `Jabatan`, `Instansi Induk`, `Nama Tempat Bekerja Sekarang`
- `Perizinan`: `Jenis Izin`, `Nomor Izin`, `Tanggal Terbit`, `Tanggal Berlaku Sampai`, `Seumur Hidup`, `Catatan`
- `Status`: `Status Aktif`

- [ ] **Step 3: Add `Lihat Semua`, `Ubah`, and `Hapus` actions**

Requirements:

- `Lihat Semua` back to `/master/pegawai`
- `Ubah` opens the same form in edit mode
- `Hapus` uses confirmation dialog and returns to the list on success

- [ ] **Step 4: Make license display readable**

Use a compact table or card list that works on both desktop and mobile.

## Chunk 6: Verification and Polish

### Task 8: Run full verification for the new module

**Files:**
- Review: `packages/db/src/schema/master.ts`
- Review: `packages/db/src/schema/relations.ts`
- Review: `packages/db/src/schema/index.ts`
- Review: `apps/web/src/lib/app-navigation.ts`
- Review: `apps/web/src/app/(app)/master/pegawai/constants.ts`
- Review: `apps/web/src/app/(app)/master/pegawai/pegawai-shared.ts`
- Review: `apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts`
- Review: `apps/web/src/app/(app)/master/pegawai/actions.ts`
- Review: `apps/web/src/app/(app)/master/pegawai/page.tsx`
- Review: `apps/web/src/app/(app)/master/pegawai/pegawai-view.tsx`
- Review: `apps/web/src/app/(app)/master/pegawai/pegawai-form.tsx`
- Review: `apps/web/src/app/(app)/master/pegawai/[id]/page.tsx`
- Review: `apps/web/src/app/(app)/master/pegawai/[id]/detail-view.tsx`
- Review: `packages/db/src/migrations/<new_timestamp>_*.sql`
- Review: `packages/db/src/migrations/meta/_journal.json`

- [ ] **Step 1: Run targeted helper tests**

Run:

```bash
bun test "apps/web/src/app/(app)/master/pegawai/pegawai-shared.test.ts"
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
bun run check-types
```

Expected: PASS.

- [ ] **Step 3: Review generated migration artifacts and affected schema exports**

Check that migration files, schema barrels, and relations all line up.

- [ ] **Step 4: Manual browser check if practical**

Verify:

- add one employee
- edit the same employee
- add two licenses
- delete one employee
- search by name or NIK
- filter by status and jabatan
- row click to detail
- layout at 375px, 768px, 1024px, and 1440px

- [ ] **Step 5: Fix any verification failures before claiming completion**

Do not stop at partial success. Make the module pass its verification steps cleanly.
