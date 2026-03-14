ALTER TABLE "patient" ADD COLUMN "nik" text;
--> statement-breakpoint
CREATE UNIQUE INDEX "patient_clinic_nik_idx" ON "patient" USING btree ("clinic_id", "nik") WHERE "patient"."nik" IS NOT NULL;
