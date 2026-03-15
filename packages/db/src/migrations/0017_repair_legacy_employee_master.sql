DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_gender') THEN
    CREATE TYPE "public"."employee_gender" AS ENUM('laki_laki', 'perempuan');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_religion') THEN
    CREATE TYPE "public"."employee_religion" AS ENUM(
      'islam',
      'kristen',
      'katolik',
      'hindu',
      'buddha',
      'konghucu',
      'lainnya'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_marital_status') THEN
    CREATE TYPE "public"."employee_marital_status" AS ENUM(
      'belum_kawin',
      'kawin',
      'cerai_hidup',
      'cerai_mati'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_license_type') THEN
    CREATE TYPE "public"."employee_license_type" AS ENUM('str', 'sip', 'sik', 'sipa', 'lainnya');
  END IF;
END $$;

ALTER TABLE "employee" ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "nip" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "full_name" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "title_prefix" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "title_suffix" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "gender" "employee_gender";
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "birth_place" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "birth_date" timestamp;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "religion" "employee_religion";
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "marital_status" "employee_marital_status";
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "address" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "email" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "position" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "workplace_name" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "parent_institution_name" text;
ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "external_reference" text;

WITH numbered AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY clinic_id ORDER BY created_at, id) AS seq
  FROM "employee"
  WHERE code IS NULL OR btrim(code) = ''
)
UPDATE "employee" AS employee
SET code = 'PGW' || lpad(numbered.seq::text, 3, '0')
FROM numbered
WHERE employee.id = numbered.id;

UPDATE "employee" AS employee
SET
  full_name = COALESCE(NULLIF(employee.display_name, ''), employee.code, 'Pegawai'),
  external_reference = COALESCE(employee.external_reference, NULLIF(employee.bpjs_doctor_code, ''), NULLIF(employee.specialization, '')),
  position = COALESCE(employee.position, 'staf_non_medis'),
  workplace_name = COALESCE(employee.workplace_name, NULLIF(clinic.name, ''), 'Klinik')
FROM "clinic" AS clinic
WHERE clinic.id = employee.clinic_id;

ALTER TABLE "employee" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "employee" ALTER COLUMN "full_name" SET NOT NULL;
ALTER TABLE "employee" ALTER COLUMN "position" SET NOT NULL;
ALTER TABLE "employee" ALTER COLUMN "workplace_name" SET NOT NULL;

CREATE TABLE IF NOT EXISTS "employee_license" (
  "id" text PRIMARY KEY NOT NULL,
  "clinic_id" text NOT NULL,
  "employee_id" text NOT NULL,
  "license_type" "employee_license_type" NOT NULL,
  "license_number" text NOT NULL,
  "issued_date" timestamp,
  "valid_until" timestamp,
  "is_lifetime" boolean DEFAULT false NOT NULL,
  "notes" text,
  "sort_order" smallint DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "employee_license_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "employee_license_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "employee_license_sort_order_check" CHECK ("sort_order" > 0),
  CONSTRAINT "employee_license_lifetime_valid_until_check" CHECK (("is_lifetime" = true AND "valid_until" IS NULL) OR ("is_lifetime" = false AND "valid_until" IS NOT NULL))
);

INSERT INTO "employee_license" (
  "id",
  "clinic_id",
  "employee_id",
  "license_type",
  "license_number",
  "issued_date",
  "valid_until",
  "is_lifetime",
  "notes",
  "sort_order"
)
SELECT
  employee.id || '-str',
  employee.clinic_id,
  employee.id,
  'str',
  employee.str_number,
  NULL,
  employee.str_expiry_date::timestamp,
  employee.str_expiry_date IS NULL,
  'Migrated from legacy employee.str_number',
  1
FROM "employee" AS employee
WHERE employee.str_number IS NOT NULL AND btrim(employee.str_number) <> ''
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "employee_license" (
  "id",
  "clinic_id",
  "employee_id",
  "license_type",
  "license_number",
  "issued_date",
  "valid_until",
  "is_lifetime",
  "notes",
  "sort_order"
)
SELECT
  employee.id || '-sip',
  employee.clinic_id,
  employee.id,
  'sip',
  employee.sip_number,
  NULL,
  employee.sip_expiry_date::timestamp,
  employee.sip_expiry_date IS NULL,
  'Migrated from legacy employee.sip_number',
  2
FROM "employee" AS employee
WHERE employee.sip_number IS NOT NULL AND btrim(employee.sip_number) <> ''
ON CONFLICT ("id") DO NOTHING;

DROP INDEX IF EXISTS "employee_clinic_code_idx";
DROP INDEX IF EXISTS "employee_clinic_active_idx";
DROP INDEX IF EXISTS "employee_clinic_position_idx";
DROP INDEX IF EXISTS "employee_clinic_name_idx";
DROP INDEX IF EXISTS "employee_clinic_nik_idx";
DROP INDEX IF EXISTS "employee_clinic_nip_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "employee_clinic_code_idx" ON "employee" USING btree ("clinic_id", "code");
CREATE INDEX IF NOT EXISTS "employee_clinic_active_idx" ON "employee" USING btree ("clinic_id", "is_active");
CREATE INDEX IF NOT EXISTS "employee_clinic_position_idx" ON "employee" USING btree ("clinic_id", "position");
CREATE INDEX IF NOT EXISTS "employee_clinic_name_idx" ON "employee" USING btree ("clinic_id", "full_name");
CREATE INDEX IF NOT EXISTS "employee_clinic_nik_idx" ON "employee" USING btree ("clinic_id", "nik");
CREATE INDEX IF NOT EXISTS "employee_clinic_nip_idx" ON "employee" USING btree ("clinic_id", "nip");
CREATE UNIQUE INDEX IF NOT EXISTS "employee_clinic_id_unique_idx" ON "employee" USING btree ("clinic_id", "id");

CREATE INDEX IF NOT EXISTS "employee_license_clinic_id_idx" ON "employee_license" USING btree ("clinic_id");
CREATE INDEX IF NOT EXISTS "employee_license_clinic_type_idx" ON "employee_license" USING btree ("clinic_id", "license_type");
CREATE INDEX IF NOT EXISTS "employee_license_clinic_employee_sort_idx" ON "employee_license" USING btree ("clinic_id", "employee_id", "sort_order");

ALTER TABLE "employee_license"
  DROP CONSTRAINT IF EXISTS "employee_license_employee_id_employee_id_fk";

ALTER TABLE "employee_license"
  DROP CONSTRAINT IF EXISTS "employee_license_clinic_employee_fk";

ALTER TABLE "employee_license"
  ADD CONSTRAINT "employee_license_clinic_employee_fk"
  FOREIGN KEY ("clinic_id", "employee_id")
  REFERENCES "public"."employee"("clinic_id", "id")
  ON DELETE cascade
  ON UPDATE no action;
