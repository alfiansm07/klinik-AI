CREATE TABLE "medical_action_medicine" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"medical_action_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"medicine_unit_id" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "medical_action_medicine_qty_check" CHECK ("medical_action_medicine"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "medical_action" ALTER COLUMN "action_type" SET DEFAULT 'regular';--> statement-breakpoint
ALTER TABLE "action_tariff" ADD COLUMN "midwife_fee" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "action_tariff" ADD COLUMN "nurse_fee" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "medical_action" ADD COLUMN "icd9_code" text;--> statement-breakpoint
ALTER TABLE "medical_action_medicine" ADD CONSTRAINT "medical_action_medicine_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_action_medicine" ADD CONSTRAINT "medical_action_medicine_medical_action_id_medical_action_id_fk" FOREIGN KEY ("medical_action_id") REFERENCES "public"."medical_action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_action_medicine" ADD CONSTRAINT "medical_action_medicine_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_action_medicine" ADD CONSTRAINT "medical_action_medicine_medicine_unit_id_medicine_unit_id_fk" FOREIGN KEY ("medicine_unit_id") REFERENCES "public"."medicine_unit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "medical_action_medicine_unique_idx" ON "medical_action_medicine" USING btree ("medical_action_id","medicine_id");--> statement-breakpoint
CREATE INDEX "medical_action_medicine_clinic_id_idx" ON "medical_action_medicine" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "medical_action_medicine_action_id_idx" ON "medical_action_medicine" USING btree ("medical_action_id");--> statement-breakpoint
CREATE INDEX "medical_action_medicine_medicine_id_idx" ON "medical_action_medicine" USING btree ("medicine_id");--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_midwife_fee_check" CHECK ("action_tariff"."midwife_fee" >= 0);--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_nurse_fee_check" CHECK ("action_tariff"."nurse_fee" >= 0);
