CREATE TYPE "public"."employee_gender" AS ENUM('laki_laki', 'perempuan');
CREATE TYPE "public"."employee_religion" AS ENUM(
	'islam',
	'kristen',
	'katolik',
	'hindu',
	'buddha',
	'konghucu',
	'lainnya'
);
CREATE TYPE "public"."employee_marital_status" AS ENUM(
	'belum_kawin',
	'kawin',
	'cerai_hidup',
	'cerai_mati'
);
CREATE TYPE "public"."employee_license_type" AS ENUM('str', 'sip', 'sik', 'sipa', 'lainnya');

CREATE TABLE "employee" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"nik" text,
	"nip" text,
	"full_name" text NOT NULL,
	"title_prefix" text,
	"title_suffix" text,
	"gender" "employee_gender",
	"birth_place" text,
	"birth_date" timestamp,
	"religion" "employee_religion",
	"marital_status" "employee_marital_status",
	"address" text,
	"email" text,
	"phone" text,
	"position" text NOT NULL,
	"workplace_name" text NOT NULL,
	"parent_institution_name" text,
	"external_reference" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE "employee_license" (
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

CREATE UNIQUE INDEX "employee_clinic_code_idx" ON "employee" USING btree ("clinic_id", "code");
CREATE INDEX "employee_clinic_id_idx" ON "employee" USING btree ("clinic_id");
CREATE INDEX "employee_clinic_active_idx" ON "employee" USING btree ("clinic_id", "is_active");
CREATE INDEX "employee_clinic_position_idx" ON "employee" USING btree ("clinic_id", "position");
CREATE INDEX "employee_clinic_name_idx" ON "employee" USING btree ("clinic_id", "full_name");
CREATE INDEX "employee_clinic_nik_idx" ON "employee" USING btree ("clinic_id", "nik");
CREATE INDEX "employee_clinic_nip_idx" ON "employee" USING btree ("clinic_id", "nip");

CREATE INDEX "employee_license_clinic_id_idx" ON "employee_license" USING btree ("clinic_id");
CREATE INDEX "employee_license_clinic_type_idx" ON "employee_license" USING btree ("clinic_id", "license_type");
CREATE INDEX "employee_license_clinic_employee_sort_idx" ON "employee_license" USING btree ("clinic_id", "employee_id", "sort_order");
