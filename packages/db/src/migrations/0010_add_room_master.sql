CREATE TYPE "public"."room_visit_type" AS ENUM('rawat_jalan');
CREATE TYPE "public"."room_installation" AS ENUM(
	'instalasi_rawat_jalan',
	'instalasi_farmasi',
	'instalasi_laboratorium',
	'instalasi_radiologi'
);

CREATE TABLE "room" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"visit_type" "room_visit_type" DEFAULT 'rawat_jalan' NOT NULL,
	"installation" "room_installation",
	"pcare_poli" text,
	"voice_code" text,
	"is_call_room" boolean DEFAULT false NOT NULL,
	"is_call_apotek" boolean DEFAULT false NOT NULL,
	"is_call_lab" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "room_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action
);

CREATE UNIQUE INDEX "room_clinic_code_idx" ON "room" USING btree ("clinic_id","code");
CREATE INDEX "room_clinic_id_idx" ON "room" USING btree ("clinic_id");
CREATE INDEX "room_clinic_visit_type_idx" ON "room" USING btree ("clinic_id","visit_type");
CREATE INDEX "room_clinic_installation_idx" ON "room" USING btree ("clinic_id","installation");
