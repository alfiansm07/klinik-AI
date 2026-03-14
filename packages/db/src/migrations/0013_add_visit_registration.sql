CREATE TYPE "public"."visit_kind" AS ENUM('baru', 'lama');
--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('sakit', 'sehat');
--> statement-breakpoint
CREATE TYPE "public"."registration_source" AS ENUM('datang_langsung', 'telepon', 'rujukan_internal');
--> statement-breakpoint
CREATE TYPE "public"."visit_status" AS ENUM('registered', 'in_examination', 'completed', 'cancelled');
--> statement-breakpoint
CREATE TYPE "public"."allergy_status" AS ENUM('tidak_ada', 'ada', 'belum_dikaji');
--> statement-breakpoint
CREATE TABLE "visit" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"registration_number" text NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"visit_date" date NOT NULL,
	"visit_kind" "visit_kind" NOT NULL,
	"service_type" "service_type" NOT NULL,
	"registration_source" "registration_source" NOT NULL,
	"guarantor_id" text NOT NULL,
	"room_id" text NOT NULL,
	"doctor_member_id" text,
	"chief_complaint" text,
	"allergy_status" "allergy_status" DEFAULT 'belum_dikaji' NOT NULL,
	"allergy_note" text,
	"height_cm" text,
	"weight_kg" text,
	"front_office_note" text,
	"referral_source" text,
	"referrer_name" text,
	"status" "visit_status" DEFAULT 'registered' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"updated_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "visit_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE restrict ON UPDATE no action,
	CONSTRAINT "visit_guarantor_id_guarantor_id_fk" FOREIGN KEY ("guarantor_id") REFERENCES "public"."guarantor"("id") ON DELETE restrict ON UPDATE no action,
	CONSTRAINT "visit_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE restrict ON UPDATE no action,
	CONSTRAINT "visit_doctor_member_id_clinic_member_id_fk" FOREIGN KEY ("doctor_member_id") REFERENCES "public"."clinic_member"("id") ON DELETE set null ON UPDATE no action,
	CONSTRAINT "visit_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action,
	CONSTRAINT "visit_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "visit_clinic_registration_number_idx" ON "visit" USING btree ("clinic_id", "registration_number");
--> statement-breakpoint
CREATE INDEX "visit_clinic_date_idx" ON "visit" USING btree ("clinic_id", "visit_date");
--> statement-breakpoint
CREATE INDEX "visit_clinic_patient_idx" ON "visit" USING btree ("clinic_id", "patient_id");
--> statement-breakpoint
CREATE INDEX "visit_clinic_room_idx" ON "visit" USING btree ("clinic_id", "room_id");
--> statement-breakpoint
CREATE INDEX "visit_clinic_status_idx" ON "visit" USING btree ("clinic_id", "status");
