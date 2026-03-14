CREATE TYPE "public"."patient_gender" AS ENUM('laki_laki', 'perempuan');

CREATE TABLE "patient" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"medical_record_number" text NOT NULL,
	"name" text NOT NULL,
	"gender" "patient_gender" NOT NULL,
	"date_of_birth" date NOT NULL,
	"mobile_phone" text,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patient_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action
);

CREATE UNIQUE INDEX "patient_clinic_mrn_idx" ON "patient" USING btree ("clinic_id", "medical_record_number");
CREATE INDEX "patient_clinic_id_idx" ON "patient" USING btree ("clinic_id");
CREATE INDEX "patient_clinic_name_idx" ON "patient" USING btree ("clinic_id", "name");
CREATE INDEX "patient_clinic_active_idx" ON "patient" USING btree ("clinic_id", "is_active");
