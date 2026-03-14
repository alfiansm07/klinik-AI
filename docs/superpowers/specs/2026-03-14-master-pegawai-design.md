# Master Pegawai Design for Klinikai

## Goal

Add `Master Data -> Pegawai` to Klinikai with a complete staff record flow that matches the information breadth of the reference HIS screen while improving usability. The module should follow existing Klinikai master-data patterns: list page, row click to detail, and add or edit through a dialog.

## Product Context

- Klinikai already uses a standard master-data flow: list, detail, and dialog form.
- Existing modules use auto-generated immutable codes, read-only detail pages, and tenant-safe server actions.
- The requested reference has a dense legacy layout. Klinikai should keep the same business coverage without copying that layout directly.
- `Jabatan` should use a fixed dropdown list stored in code for the first release.

## Chosen Approach

Use a full master-data module with two data units:

1. `employee` as the main master table for staff identity, contact, and placement
2. `employee_license` as a child table for repeatable license records such as STR, SIP, SIK, or SIPA

This keeps the data model clean, supports multiple licenses per employee, and allows the UI to stay readable even when the form is large.

## Why This Approach

- It preserves the completeness of the reference workflow.
- It matches the Klinikai standard for master data, so users do not learn a special flow.
- It avoids putting many license columns on the employee table.
- It supports future growth such as extra license types or richer validation.

## Scope

### In Scope

- Master-data navigation entry for `Pegawai`
- Employee list page with search and filters
- Employee detail page
- Add and edit dialog with a large sectioned form
- Fixed in-code `Jabatan` options
- Repeatable license rows in the form and detail view
- Tenant-safe create, update, delete, and list actions
- Auto-generated immutable employee code

### Out of Scope

- Separate master-data maintenance page for `Jabatan`
- User-account linking between app users and employee records
- Schedule, attendance, payroll, or shift management
- File upload for certificates or scanned documents
- BPJS, SATUSEHAT, or external workforce integrations

## UX Direction

### Core Pattern

Follow the existing Klinikai master-data shell:

- list page for browsing and filtering
- row click to read-only detail page
- add and edit through `FormDialog`
- delete from detail page with confirmation dialog

### UX Improvements Over the Reference

- Break the long form into clear sections instead of one flat grid.
- Keep the dialog large but readable, with a scrollable body and sticky action footer.
- Use a searchable `Jabatan` field because the option list is long.
- Put high-value fields first so users can finish the core record quickly.
- Render licenses as repeatable rows or cards instead of a bare spreadsheet-like strip.
- Keep mobile behavior safe by collapsing wide rows into stacked cards.

## Navigation and Entry Point

- Add `Pegawai` under `Master Data` in the existing master navigation section.
- Use a people-related icon consistent with the current Lucide icon set.
- Route path: `/master/pegawai`

## List Page Design

### Header

- Title: `Pegawai`
- Description: short operational summary for clinic staff records
- Primary action: `Tambah Pegawai`

### Table Columns

- `Kode`
- `Nama`
- `Jabatan`
- `NIK / NIP`
- `Kontak`
- `Status`

Optional secondary values can appear within the same cell to keep the table compact, for example `NIK` above `NIP`, or `Telepon` above `Email`.

### Search and Filters

- one search box for `kode`, `nama`, `NIK`, `NIP`, and `telepon`
- `Status` filter with `Semua`, `Aktif`, and `Tidak Aktif`
- `Jabatan` filter using a searchable select or combobox

### Empty State

- Title: `Belum ada data pegawai`
- Description: explain that staff data can be added to support clinical and operational workflows
- CTA: `Tambah Pegawai`

### Row Behavior

- Entire row is clickable and navigates to `/master/pegawai/[id]`
- Any inline interactive control must opt out of row click through the same pattern used by existing master-data tables

## Detail Page Design

### Header Actions

- `Lihat Semua`
- `Ubah`
- `Hapus`

### Detail Sections

1. `Identitas Utama`
2. `Data Pribadi`
3. `Kontak`
4. `Profesi dan Penempatan`
5. `Perizinan`
6. `Status`

### Display Rules

- Show `-` for empty optional values.
- Show the full employee name prominently, with `Jabatan` as supporting context.
- Show licenses in a compact table on desktop and stacked cards on smaller screens.
- Show human-readable labels only, never internal keys.

## Add and Edit Dialog Design

### Dialog Layout

- Large dialog width, likely around the same width used by larger existing master-data forms
- Scrollable content body
- Sticky footer with `Batal` and `Simpan`
- Reuse the standard shared master-data action footer where possible
- Build the form with `@tanstack/react-form`, including the repeatable license rows

### Form Sections

#### 1. Identitas Utama

- `Kode Pegawai` - auto-generated, disabled
- `Nama Lengkap` - required
- `Gelar Depan`
- `Gelar Belakang`
- `NIK`
- `NIP/NRP`
- `Referensi Eksternal` or equivalent field for outside source data

#### 2. Data Pribadi

- `Jenis Kelamin`
- `Tempat Lahir`
- `Tanggal Lahir`
- `Agama`
- `Status Perkawinan`

#### 3. Kontak

- `Alamat`
- `Email`
- `Telp/HP`

#### 4. Profesi dan Penempatan

- `Jabatan` - required, searchable, fixed options from code
- `Instansi Induk`
- `Nama Tempat Bekerja Sekarang` - required

#### 5. Perizinan

Repeatable license items with:

- `Jenis Izin`
- `Nomor Izin`
- `Tanggal Terbit`
- `Tanggal Berlaku Sampai`
- `Seumur Hidup`
- `Catatan`

#### 6. Status

- `Status Aktif`

### Interaction Rules

- Default new records to `Aktif`.
- If `Seumur Hidup` is checked, disable and clear `Tanggal Berlaku Sampai`.
- Do not submit blank license rows.
- Preserve existing licenses on edit until the user removes them.
- Show field-level validation and toast-level error feedback.

## Jabatan Options

For the first release, store `Jabatan` as a fixed option list in code. Use a stable stored `key` and a human-readable `label`. The UI must show the label only.

V1 canonical options:

- `staf_non_medis` -> `Staf Non Medis`
- `kepala_labkesda` -> `Kepala Labkesda`
- `nutrisionist_dan_dietfisien` -> `Nutrisionist dan Dietfisien`
- `apoteker` -> `Apoteker`
- `asisten_apoteker` -> `Asisten Apoteker`
- `analis_farmasi` -> `Analis Farmasi`
- `perawat` -> `Perawat`
- `perawat_gigi` -> `Perawat Gigi`
- `bidan` -> `Bidan`
- `perawat_anestesi` -> `Perawat Anestesi`
- `epidemiolog_kesehatan` -> `Epidemiolog Kesehatan`
- `entomolog_kesehatan` -> `Entomolog Kesehatan`
- `sanitarian` -> `Sanitarian`
- `penyuluh_kesehatan` -> `Penyuluh Kesehatan`
- `ahli_teknologi_laboratorium_medik` -> `Ahli Teknologi Laboratorium Medik`
- `radiografi` -> `Radiografi`
- `teknisi_gigi` -> `Teknisi Gigi`
- `teknisi_elektromedis` -> `Teknisi Elektromedis`
- `refraksionis_optisien` -> `Refraksionis Optisien`

## Data Model

### Employee Table

Create a multi-tenant employee master table with these fields:

- `id`
- `clinicId`
- `code`
- `nik`
- `nip`
- `fullName`
- `titlePrefix`
- `titleSuffix`
- `gender`
- `birthPlace`
- `birthDate`
- `religion`
- `maritalStatus`
- `address`
- `email`
- `phone`
- `position`
- `workplaceName`
- `parentInstitutionName`
- `externalReference`
- `isActive`
- `createdAt`
- `updatedAt`

### Employee License Table

Create a multi-tenant child table with these fields:

- `id`
- `clinicId`
- `employeeId`
- `licenseType`
- `licenseNumber`
- `issuedDate`
- `validUntil`
- `isLifetime`
- `notes`
- `sortOrder`
- `createdAt`
- `updatedAt`

### Data Rules

- `code` is auto-generated and immutable.
- `code` must use the existing shared auto-code pattern already used by other master-data modules.
- `clinicId` must be present on both tables.
- `employeeId` must reference the employee table.
- Deleting an employee should delete child license rows.
- `sortOrder` keeps license rows stable when editing.
- `validUntil` can be null only when `isLifetime` is true.

### Index and Uniqueness Rules

- `employee` must have unique `(clinic_id, code)`.
- `employee` must have index `(clinic_id, is_active)`.
- `employee` must have index `(clinic_id, position)`.
- Add clinic-scoped indexes that support list search for fields such as `full_name`, `nik`, and `nip` when the final query shape depends on those searches.
- `employee_license` must have index `(clinic_id, employee_id, sort_order)`.
- `employee_license` may also add a clinic-scoped lookup index for `license_type` if needed by validation or reporting.

## Validation Rules

### Employee

- `Nama Lengkap` is required.
- `Jabatan` is required.
- `Nama Tempat Bekerja Sekarang` is required.
- `Email`, if present, must have valid email format.
- `NIK`, if present, should be trimmed and validated as a plain identity number string.
- `Telepon`, if present, should be normalized but not over-restricted.

### Licenses

- A license row is saved only if it has meaningful content.
- `Jenis Izin` and `Nomor Izin` are required for any saved row.
- `Tanggal Berlaku Sampai` is required unless `Seumur Hidup` is true.
- Mixed valid and blank rows should save only the valid rows and flag invalid partial rows.

## Server and Data Flow

### Queries

- list query for employee table with clinic scoping and sort by code
- detail query for one employee plus licenses, scoped by clinic
- helper query that exposes the next employee code using the existing shared auto-code pattern

### Mutations

- create employee with licenses
- update employee with licenses
- delete employee and its licenses

### Tenant Ownership Rules

- Scope every employee read and write by active `clinicId`.
- Scope every license read and write through the parent employee owned by the active clinic.
- Reject any submitted `employeeId` not owned by the active clinic.
- Reject any submitted existing license row `id` not owned by the active clinic and its parent employee.
- Do not trust child row identifiers from the client without re-checking parent ownership on the server.

### Revalidation

- `/master/pegawai`
- `/master/pegawai/[id]`

## Architectural Rules

- Use Server Components for page-level reads.
- Use Server Actions for mutations.
- Keep list and detail backed by the same source data.
- Keep tenant ownership checks on every read and write.
- Use `@tanstack/react-form` for `pegawai-form.tsx`.
- Follow the existing master-data split: `page.tsx`, `*-view.tsx`, `*-form.tsx`, `actions.ts`, and `[id]/detail-view.tsx`.

## File Structure

### Create

- `apps/web/src/app/(app)/master/pegawai/page.tsx`
- `apps/web/src/app/(app)/master/pegawai/actions.ts`
- `apps/web/src/app/(app)/master/pegawai/pegawai-view.tsx`
- `apps/web/src/app/(app)/master/pegawai/pegawai-form.tsx`
- `apps/web/src/app/(app)/master/pegawai/constants.ts`
- `apps/web/src/app/(app)/master/pegawai/[id]/page.tsx`
- `apps/web/src/app/(app)/master/pegawai/[id]/detail-view.tsx`

### Modify

- `packages/db/src/schema/master.ts` or another appropriate domain schema file for the new tables and enums
- `packages/db/src/schema/relations.ts`
- `packages/db/src/schema/index.ts`
- `apps/web/src/lib/app-navigation.ts`

## Testing and Verification

### Recommended Tests

- unit tests for data normalizers and license-row validation if helpers are extracted
- route and navigation tests if the master nav structure changes in a tested area
- targeted form behavior tests if lightweight pure helpers exist

### Required Verification

- `bun run db:generate`
- `bun run db:migrate`
- narrow `bun test` commands for any new or changed test files
- `bun run check-types`

If time allows, also run a quick manual browser check for:

- add employee
- edit employee
- add multiple licenses
- row click to detail
- delete flow
- responsive layout at common widths

## Success Criteria

- Users can add a full employee record with one or more licenses.
- Users can search employees by main identity fields.
- Users can filter the list by status and job title.
- Users can open a detail page from the list.
- Users can edit the record without losing unchanged licenses.
- The module follows existing Klinikai master-data behavior and styling.
- The UX is measurably easier to scan and complete than the dense reference layout.
