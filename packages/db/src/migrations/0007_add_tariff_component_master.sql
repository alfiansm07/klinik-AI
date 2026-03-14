DO $$
BEGIN
    CREATE TYPE "public"."tariff_component_fee_key" AS ENUM(
        'clinic_fee',
        'other_fee',
        'doctor_fee',
        'midwife_fee',
        'nurse_fee'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "tariff_component" (
    "id" text PRIMARY KEY NOT NULL,
    "clinic_id" text NOT NULL,
    "code" text NOT NULL,
    "name" text NOT NULL,
    "fee_key" "tariff_component_fee_key" NOT NULL,
    "sort_order" smallint DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "tariff_component_sort_order_check" CHECK ("sort_order" > 0),
    CONSTRAINT "tariff_component_clinic_id_clinic_id_fk"
        FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id")
        ON DELETE cascade ON UPDATE no action
);

CREATE UNIQUE INDEX IF NOT EXISTS "tariff_component_clinic_code_idx"
ON "tariff_component" USING btree ("clinic_id", "code");

CREATE UNIQUE INDEX IF NOT EXISTS "tariff_component_clinic_fee_key_idx"
ON "tariff_component" USING btree ("clinic_id", "fee_key");

CREATE INDEX IF NOT EXISTS "tariff_component_clinic_id_idx"
ON "tariff_component" USING btree ("clinic_id");

CREATE INDEX IF NOT EXISTS "tariff_component_clinic_sort_order_idx"
ON "tariff_component" USING btree ("clinic_id", "sort_order");

INSERT INTO "tariff_component" (
    "id",
    "clinic_id",
    "code",
    "name",
    "fee_key",
    "sort_order",
    "is_active"
)
SELECT
    CONCAT('tariff-component-', c.id, '-clinic-fee'),
    c.id,
    '001',
    'Jasa Sarana',
    'clinic_fee',
    1,
    true
FROM "clinic" c
ON CONFLICT ("clinic_id", "fee_key") DO NOTHING;

INSERT INTO "tariff_component" (
    "id",
    "clinic_id",
    "code",
    "name",
    "fee_key",
    "sort_order",
    "is_active"
)
SELECT
    CONCAT('tariff-component-', c.id, '-other-fee'),
    c.id,
    '002',
    'Jasa Pelayanan',
    'other_fee',
    2,
    true
FROM "clinic" c
ON CONFLICT ("clinic_id", "fee_key") DO NOTHING;

INSERT INTO "tariff_component" (
    "id",
    "clinic_id",
    "code",
    "name",
    "fee_key",
    "sort_order",
    "is_active"
)
SELECT
    CONCAT('tariff-component-', c.id, '-doctor-fee'),
    c.id,
    '1001',
    'Jasa Dokter',
    'doctor_fee',
    3,
    true
FROM "clinic" c
ON CONFLICT ("clinic_id", "fee_key") DO NOTHING;

INSERT INTO "tariff_component" (
    "id",
    "clinic_id",
    "code",
    "name",
    "fee_key",
    "sort_order",
    "is_active"
)
SELECT
    CONCAT('tariff-component-', c.id, '-midwife-fee'),
    c.id,
    '1002',
    'Jasa Bidan',
    'midwife_fee',
    4,
    true
FROM "clinic" c
ON CONFLICT ("clinic_id", "fee_key") DO NOTHING;

INSERT INTO "tariff_component" (
    "id",
    "clinic_id",
    "code",
    "name",
    "fee_key",
    "sort_order",
    "is_active"
)
SELECT
    CONCAT('tariff-component-', c.id, '-nurse-fee'),
    c.id,
    '1003',
    'Jasa Perawat',
    'nurse_fee',
    5,
    true
FROM "clinic" c
ON CONFLICT ("clinic_id", "fee_key") DO NOTHING;
