-- Replace tariff_group_id FK with action_category enum on medical_action table

-- 1. Create the action_category enum type
CREATE TYPE "public"."action_category" AS ENUM(
  'prosedur_terapeutik',
  'prosedur_diagnostik',
  'prosedur_pembedahan',
  'konseling',
  'edukasi',
  'pelayanan_psikiatri',
  'pelayanan_sosial',
  'terapi_chiropractic'
);
--> statement-breakpoint

-- 2. Add the new action_category column
ALTER TABLE "medical_action" ADD COLUMN "action_category" "public"."action_category";
--> statement-breakpoint

-- 3. Drop the FK constraint on tariff_group_id
ALTER TABLE "medical_action" DROP CONSTRAINT IF EXISTS "medical_action_tariff_group_id_tariff_group_id_fk";
--> statement-breakpoint

-- 4. Drop the old index on tariff_group_id
DROP INDEX IF EXISTS "medical_action_tariff_group_id_idx";
--> statement-breakpoint

-- 5. Drop the tariff_group_id column
ALTER TABLE "medical_action" DROP COLUMN IF EXISTS "tariff_group_id";
--> statement-breakpoint

-- 6. Create the new composite index on (clinic_id, action_category)
CREATE INDEX "medical_action_category_idx" ON "medical_action" USING btree ("clinic_id", "action_category");