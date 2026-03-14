ALTER TYPE "public"."guarantor_type" ADD VALUE IF NOT EXISTS 'pemerintah';
ALTER TYPE "public"."guarantor_type" ADD VALUE IF NOT EXISTS 'perusahaan_lainnya';

ALTER TABLE "guarantor"
ADD COLUMN IF NOT EXISTS "bpjs_bridging" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "show_insurance_number" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "insurance_number_required" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "mandiri_inhealth_bridging" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "margin_setting_enabled" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "pic_name" text,
ADD COLUMN IF NOT EXISTS "phone" text,
ADD COLUMN IF NOT EXISTS "address" text;

CREATE INDEX IF NOT EXISTS "guarantor_clinic_type_idx"
ON "guarantor" USING btree ("clinic_id", "type");
