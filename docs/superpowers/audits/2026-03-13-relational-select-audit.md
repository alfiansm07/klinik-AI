# Relational Select Audit — 2026-03-13

## Summary
- Total Select usages reviewed: 53
- Relational selects reviewed: 13
- Fixed in code: 10
- Already correct: 3
- Not relational: 40
- Follow-up needed before phase close: 10

## Audit Table
| File | Field | Status | Verification | Notes |
| --- | --- | --- | --- | --- |
| `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` | `visitKind` | `not-relational` | `code review` | static visit-kind enum |
| `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` | `visitType` | `not-relational` | `code review` | static visit-type enum |
| `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` | `registrationSource` | `not-relational` | `code review` | static registration-source enum |
| `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` | `guarantorId` | `already-correct` | `Chunk 1 approved browser select-pick check + code review` | helper-derived label already renders in trigger |
| `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` | `roomId` | `already-correct` | `Chunk 1 approved browser select-pick check + code review` | helper-derived label already renders in trigger |
| `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` | `doctorId` | `already-correct` | `Chunk 1 approved browser select-pick check + code review` | helper-derived label already renders in trigger |
| `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` | `allergyStatus` | `not-relational` | `code review` | static allergy enum |
| `apps/web/src/app/(app)/pendaftaran/pasien/patient-form.tsx` | `gender` | `not-relational` | `code review` | static gender enum |
| `apps/web/src/app/(app)/pendaftaran/pasien/patient-view.tsx` | `draftGuarantor` | `not-relational` | `code review` | static filter options via `LegacySelect` |
| `apps/web/src/app/(app)/pendaftaran/pasien/patient-view.tsx` | `draftPaymentStatus` | `not-relational` | `code review` | static filter options via `LegacySelect` |
| `apps/web/src/app/(app)/pendaftaran/pasien/patient-view.tsx` | `draftRegistrationSource` | `not-relational` | `code review` | static filter options via `LegacySelect` |
| `apps/web/src/app/(app)/pendaftaran/pasien/patient-view.tsx` | `draftRoom` | `not-relational` | `code review` | static filter options via `LegacySelect` |
| `apps/web/src/app/(app)/pendaftaran/pasien/patient-view.tsx` | `draftExamination` | `not-relational` | `code review` | static status filter via `LegacySelect` |
| `apps/web/src/app/(app)/pendaftaran/pasien/patient-view.tsx` | `draftService` | `not-relational` | `code review` | static service filter via `LegacySelect` |
| `apps/web/src/app/(app)/pendaftaran/pasien/patient-view.tsx` | `draftConsentStatus` | `not-relational` | `code review` | static consent filter via `LegacySelect` |
| `apps/web/src/app/(app)/master/ruangan/ruangan-form.tsx` | `visitType` | `not-relational` | `code review` | static room-visit enum |
| `apps/web/src/app/(app)/master/ruangan/ruangan-form.tsx` | `installation` | `not-relational` | `code review` | static installation enum |
| `apps/web/src/app/(app)/master/guarantors/guarantor-form.tsx` | `insuranceType` | `not-relational` | `code review` | static insurance-type enum |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `medicineCategoryId` | `fixed` | `typecheck + code review; browser check pending in CLI` | now stores id in state and renders category name explicitly |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `manufacturerId` | `fixed` | `typecheck + code review; browser check pending in CLI` | now stores id in state and renders manufacturer name explicitly |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `pharmacologyId` | `fixed` | `typecheck + code review; browser check pending in CLI` | now stores id in state and renders pharmacology name explicitly |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `supplierId` | `fixed` | `typecheck + code review; browser check pending in CLI` | now stores id in state and renders supplier name explicitly |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `smallUnitId` | `fixed` | `typecheck + code review; browser check pending in CLI` | now stores id in state and renders unit name explicitly |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `packageUnitId` | `fixed` | `typecheck + code review; browser check pending in CLI` | now stores id in state and renders unit name explicitly |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `packageUnit2Id` | `fixed` | `typecheck + code review; browser check pending in CLI` | now stores id in state and renders unit name explicitly |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `compoundUnitId` | `fixed` | `typecheck + code review; browser check pending in CLI` | now stores id in state and renders unit name explicitly |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `pricingMethod` | `not-relational` | `code review` | static pricing enum |
| `apps/web/src/app/(app)/master/obat/obat-form.tsx` | `inventoryMethod` | `not-relational` | `code review` | static inventory enum |
| `apps/web/src/app/(app)/master/tindakan/tindakan-form.tsx` | `medicineRows[].medicineId` | `fixed` | `typecheck + code review; browser check pending in CLI` | helper-derived medicine label now renders in trigger |
| `apps/web/src/app/(app)/master/tindakan/tindakan-form.tsx` | `medicineRows[].medicineUnitId` | `fixed` | `typecheck + code review; browser check pending in CLI` | helper-derived unit label now renders in trigger |
| `apps/web/src/app/(app)/master/tindakan/tindakan-form.tsx` | `actionCategory` | `not-relational` | `code review` | static action-category enum |
| `apps/web/src/app/(app)/master/tindakan/tindakan-form.tsx` | `actionType` | `not-relational` | `code review` | static action-type enum |
| `apps/web/src/components/shared/data-table.tsx` | `statusFilter` | `not-relational` | `code review` | static active/inactive filter |
| `apps/web/src/components/shared/data-table.tsx` | `enumFilterValue` | `not-relational` | `code review` | generic toolbar enum filter, not foreign-key specific |
| `apps/web/src/components/shared/data-table.tsx` | `pageSize` | `not-relational` | `code review` | pagination size selector |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `current.categorySample` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `current.drugGroupSample` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `proposed.categorySample` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `proposed.drugGroupSample` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `filterBar.current.status` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `filterBar.current.category` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `filterBar.proposed.status` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `filterBar.proposed.category` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `dialog.current.category` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `dialog.proposed.category` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `fullMock.statusKfa` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `fullMock.status` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `fullMock.category` | `not-relational` | `code review` | demo-only static select |
| `apps/web/src/app/(public)/ui-testing/size-comparison/page.tsx` | `fullMock.pageSize` | `not-relational` | `code review` | demo-only pagination selector |
| `apps/web/src/app/(public)/ui-testing/ui-testing-showcase.tsx` | `filterBar.poli` | `not-relational` | `code review` | showcase-only static select |
| `apps/web/src/app/(public)/ui-testing/ui-testing-showcase.tsx` | `filterBar.status` | `not-relational` | `code review` | showcase-only static select |
| `apps/web/src/app/(public)/ui-testing/ui-testing-showcase.tsx` | `form.gender` | `not-relational` | `code review` | showcase-only static select |
| `apps/web/src/app/(public)/ui-testing/ui-testing-showcase.tsx` | `form.poliTujuan` | `not-relational` | `code review` | showcase-only static select |

## Follow-up Needed
- `apps/web/src/app/(app)/master/obat/obat-form.tsx` — `medicineCategoryId` browser select-pick verification pending
- `apps/web/src/app/(app)/master/obat/obat-form.tsx` — `manufacturerId` browser select-pick verification pending
- `apps/web/src/app/(app)/master/obat/obat-form.tsx` — `pharmacologyId` browser select-pick verification pending
- `apps/web/src/app/(app)/master/obat/obat-form.tsx` — `supplierId` browser select-pick verification pending
- `apps/web/src/app/(app)/master/obat/obat-form.tsx` — `smallUnitId` browser select-pick verification pending
- `apps/web/src/app/(app)/master/obat/obat-form.tsx` — `packageUnitId` browser select-pick verification pending
- `apps/web/src/app/(app)/master/obat/obat-form.tsx` — `packageUnit2Id` browser select-pick verification pending
- `apps/web/src/app/(app)/master/obat/obat-form.tsx` — `compoundUnitId` browser select-pick verification pending
- `apps/web/src/app/(app)/master/tindakan/tindakan-form.tsx` — `medicineRows[].medicineId` browser select-pick verification pending
- `apps/web/src/app/(app)/master/tindakan/tindakan-form.tsx` — `medicineRows[].medicineUnitId` browser select-pick verification pending

## Final Verification Summary
- `bun test apps/web/src/lib/select-utils.test.ts`: pass on 2026-03-14 (4 tests, 0 failures)
- `bun run check-types`: pass on 2026-03-14
- Relational entries runtime-verified: 3/13
- `follow-up-needed`: 10
- Notes: `step-data-pelayanan.tsx` relational selects inherit Chunk 1 approval and browser verification. The 10 newly fixed relational entries pass code review and typecheck in this CLI session, but browser interaction checks are still pending because no browser automation tool is available here.
