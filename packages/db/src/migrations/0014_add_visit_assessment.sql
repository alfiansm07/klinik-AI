CREATE TYPE "public"."assessment_status" AS ENUM('draft', 'finalized');
CREATE TYPE "public"."assessment_disposition" AS ENUM('ready_for_doctor', 'priority_handover', 'observation');
CREATE TYPE "public"."triage_level" AS ENUM('tidak_gawat', 'gawat', 'darurat', 'meninggal');
CREATE TYPE "public"."vital_alert_level" AS ENUM('normal', 'perlu_perhatian', 'abnormal', 'kritis');
CREATE TYPE "public"."clinic_assessment_type" AS ENUM('general', 'dental');
ALTER TYPE "public"."visit_status" ADD VALUE IF NOT EXISTS 'menunggu_asesmen';
ALTER TYPE "public"."visit_status" ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE "public"."visit_status" ADD VALUE IF NOT EXISTS 'ready_for_doctor';
ALTER TYPE "public"."visit_status" ADD VALUE IF NOT EXISTS 'priority_handover';
ALTER TYPE "public"."visit_status" ADD VALUE IF NOT EXISTS 'observation';
CREATE TABLE "visit_assessment" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"visit_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"assessed_by_user_id" text NOT NULL,
	"completed_by_user_id" text,
	"assessment_type" "clinic_assessment_type" DEFAULT 'general' NOT NULL,
	"assessment_at" timestamp DEFAULT now() NOT NULL,
	"status" "assessment_status" DEFAULT 'draft' NOT NULL,
	"chief_complaint" text,
	"additional_complaints" text,
	"illness_duration_year" integer,
	"illness_duration_month" integer,
	"illness_duration_day" integer,
	"registration_note_snapshot" text,
	"initial_allergy_flag" boolean,
	"intake_note" text,
	"special_attention_flag" boolean DEFAULT false NOT NULL,
	"handover_summary_auto" text,
	"handover_note_manual" text,
	"doctor_attention_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disposition" "assessment_disposition",
	"requires_transfer_assistance_flag" boolean DEFAULT false NOT NULL,
	"requires_immediate_review_flag" boolean DEFAULT false NOT NULL,
	"assessment_completion_status" text,
	"adaptive_blocks_triggered" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "visit_assessment_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_assessment_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_assessment_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE restrict ON UPDATE no action,
	CONSTRAINT "visit_assessment_assessed_by_user_id_user_id_fk" FOREIGN KEY ("assessed_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action,
	CONSTRAINT "visit_assessment_completed_by_user_id_user_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action,
	CONSTRAINT "visit_assessment_duration_year_check" CHECK ("illness_duration_year" >= 0),
	CONSTRAINT "visit_assessment_duration_month_check" CHECK ("illness_duration_month" between 0 and 11),
	CONSTRAINT "visit_assessment_duration_day_check" CHECK ("illness_duration_day" between 0 and 31)
);
CREATE TABLE "visit_assessment_risk" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"assessment_id" text NOT NULL,
	"functional_disability_flag" boolean,
	"functional_disability_note" text,
	"ambulation_status" text,
	"communication_barrier_flag" boolean,
	"communication_barrier_note" text,
	"fall_unsteady_flag" boolean,
	"fall_assistive_device_flag" boolean,
	"fall_support_while_sitting_flag" boolean,
	"fall_risk_score" integer,
	"fall_risk_level" text,
	"fall_mitigation_note" text,
	"pain_score" integer,
	"pain_recurrence_timing" text,
	"pain_character" text,
	"pain_summary" text,
	"nutrition_weight_loss_score" integer,
	"nutrition_appetite_loss_flag" boolean,
	"nutrition_appetite_score" integer,
	"nutrition_special_diagnosis_flag" boolean,
	"nutrition_special_diagnosis_name" text,
	"nutrition_detail_note" text,
	"nutrition_total_score" integer,
	"nutrition_risk_level" text,
	"elderly_flag" boolean,
	"mobility_limitation_flag" boolean,
	"needs_companion_flag" boolean,
	"risk_screening_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "visit_assessment_risk_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_assessment_risk_assessment_id_visit_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."visit_assessment"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_assessment_risk_pain_score_check" CHECK ("pain_score" between 0 and 10),
	CONSTRAINT "visit_assessment_risk_fall_score_check" CHECK ("fall_risk_score" >= 0),
	CONSTRAINT "visit_assessment_risk_nutrition_weight_loss_check" CHECK ("nutrition_weight_loss_score" >= 0),
	CONSTRAINT "visit_assessment_risk_nutrition_appetite_check" CHECK ("nutrition_appetite_score" >= 0),
	CONSTRAINT "visit_assessment_risk_nutrition_total_check" CHECK ("nutrition_total_score" >= 0)
);
CREATE TABLE "visit_vital_sign" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"assessment_id" text NOT NULL,
	"consciousness_level" text,
	"blood_pressure_site" text,
	"systolic" integer,
	"diastolic" integer,
	"heart_rate" integer,
	"respiratory_rate" integer,
	"spo2" integer,
	"temperature_celsius" numeric(4, 1),
	"cardiac_rhythm" text,
	"waist_circumference_cm" numeric(5, 2),
	"height_cm" numeric(5, 2),
	"height_measurement_method" text,
	"weight_kg" numeric(5, 2),
	"bmi" numeric(5, 2),
	"bmi_category" text,
	"triage_level" "triage_level",
	"vital_alert_level" "vital_alert_level",
	"vital_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "visit_vital_sign_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_vital_sign_assessment_id_visit_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."visit_assessment"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_vital_sign_systolic_check" CHECK ("systolic" >= 0),
	CONSTRAINT "visit_vital_sign_diastolic_check" CHECK ("diastolic" >= 0),
	CONSTRAINT "visit_vital_sign_heart_rate_check" CHECK ("heart_rate" >= 0),
	CONSTRAINT "visit_vital_sign_respiratory_rate_check" CHECK ("respiratory_rate" >= 0),
	CONSTRAINT "visit_vital_sign_spo2_check" CHECK ("spo2" between 0 and 100),
	CONSTRAINT "visit_vital_sign_temperature_check" CHECK ("temperature_celsius" >= 0),
	CONSTRAINT "visit_vital_sign_waist_circumference_check" CHECK ("waist_circumference_cm" >= 0),
	CONSTRAINT "visit_vital_sign_height_check" CHECK ("height_cm" >= 0),
	CONSTRAINT "visit_vital_sign_weight_check" CHECK ("weight_kg" >= 0),
	CONSTRAINT "visit_vital_sign_bmi_check" CHECK ("bmi" >= 0)
);
CREATE TABLE "visit_assessment_exam" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"assessment_id" text NOT NULL,
	"history_present_illness" text,
	"past_medical_history" text,
	"family_medical_history" text,
	"history_source_type" text,
	"history_source_name" text,
	"history_source_relationship" text,
	"psychosocial_spiritual_note" text,
	"additional_clinical_note" text,
	"allergy_none_flag" boolean,
	"drug_allergy_note" text,
	"food_allergy_note" text,
	"air_allergy_note" text,
	"other_allergy_note" text,
	"allergy_severity_note" text,
	"allergy_verification_note" text,
	"current_steroid_medication" text,
	"current_anticoagulant_medication" text,
	"current_mucolytic_medication" text,
	"current_chronic_disease_medication" text,
	"current_other_medication" text,
	"frequently_used_medication" text,
	"medication_history_note" text,
	"initial_care_plan" text,
	"nursing_action_note" text,
	"observation_note" text,
	"smoking_flag" boolean,
	"alcohol_flag" boolean,
	"low_fruit_vegetable_flag" boolean,
	"dental_extraoral_swelling_flag" boolean,
	"dental_extraoral_consistency" text,
	"dental_extraoral_skin_color" text,
	"dental_extraoral_skin_temperature" text,
	"dental_intraoral_tooth_mobility_flag" boolean,
	"dental_intraoral_gingiva_color" text,
	"dental_intraoral_caries_tooth" text,
	"dental_intraoral_swelling_flag" boolean,
	"dental_intraoral_percussion_pain_flag" boolean,
	"dental_intraoral_pressure_pain_flag" boolean,
	"dental_intraoral_palpation_pain_flag" boolean,
	"dental_caries_status" text,
	"dental_exam_note" text,
	"exam_skin_flag" boolean,
	"exam_nails_flag" boolean,
	"exam_head_flag" boolean,
	"exam_eyes_flag" boolean,
	"exam_ears_flag" boolean,
	"exam_nose_sinus_flag" boolean,
	"exam_mouth_lips_flag" boolean,
	"exam_neck_flag" boolean,
	"exam_chest_back_flag" boolean,
	"exam_cardiovascular_flag" boolean,
	"exam_abdomen_flag" boolean,
	"exam_upper_extremities_flag" boolean,
	"exam_lower_extremities_flag" boolean,
	"exam_male_genitalia_flag" boolean,
	"physical_exam_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "visit_assessment_exam_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_assessment_exam_assessment_id_visit_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."visit_assessment"("id") ON DELETE cascade ON UPDATE no action
);
CREATE TABLE "visit_body_finding" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"assessment_id" text NOT NULL,
	"body_part_code" text,
	"body_part_label" text NOT NULL,
	"finding_note" text,
	"finding_pain_flag" boolean,
	"finding_swelling_flag" boolean,
	"finding_side" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "visit_body_finding_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_body_finding_assessment_id_visit_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."visit_assessment"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "visit_body_finding_display_order_check" CHECK ("display_order" >= 0)
);
CREATE UNIQUE INDEX "visit_clinic_visit_patient_idx" ON "visit" USING btree ("clinic_id", "id", "patient_id");
CREATE UNIQUE INDEX "visit_assessment_clinic_visit_idx" ON "visit_assessment" USING btree ("clinic_id", "visit_id");
CREATE UNIQUE INDEX "visit_assessment_clinic_id_idx" ON "visit_assessment" USING btree ("clinic_id", "id");
CREATE INDEX "visit_assessment_clinic_patient_idx" ON "visit_assessment" USING btree ("clinic_id", "patient_id");
CREATE INDEX "visit_assessment_clinic_status_idx" ON "visit_assessment" USING btree ("clinic_id", "status");
CREATE INDEX "visit_assessment_clinic_disposition_idx" ON "visit_assessment" USING btree ("clinic_id", "disposition");
ALTER TABLE "visit_assessment"
	ADD CONSTRAINT "visit_assessment_clinic_visit_patient_fk"
	FOREIGN KEY ("clinic_id", "visit_id", "patient_id")
	REFERENCES "public"."visit"("clinic_id", "id", "patient_id")
	ON DELETE no action ON UPDATE no action;
CREATE UNIQUE INDEX "visit_assessment_risk_clinic_assessment_idx" ON "visit_assessment_risk" USING btree ("clinic_id", "assessment_id");
ALTER TABLE "visit_assessment_risk"
	ADD CONSTRAINT "visit_assessment_risk_clinic_assessment_fk"
	FOREIGN KEY ("clinic_id", "assessment_id")
	REFERENCES "public"."visit_assessment"("clinic_id", "id")
	ON DELETE no action ON UPDATE no action;
CREATE UNIQUE INDEX "visit_vital_sign_clinic_assessment_idx" ON "visit_vital_sign" USING btree ("clinic_id", "assessment_id");
ALTER TABLE "visit_vital_sign"
	ADD CONSTRAINT "visit_vital_sign_clinic_assessment_fk"
	FOREIGN KEY ("clinic_id", "assessment_id")
	REFERENCES "public"."visit_assessment"("clinic_id", "id")
	ON DELETE no action ON UPDATE no action;
CREATE UNIQUE INDEX "visit_assessment_exam_clinic_assessment_idx" ON "visit_assessment_exam" USING btree ("clinic_id", "assessment_id");
ALTER TABLE "visit_assessment_exam"
	ADD CONSTRAINT "visit_assessment_exam_clinic_assessment_fk"
	FOREIGN KEY ("clinic_id", "assessment_id")
	REFERENCES "public"."visit_assessment"("clinic_id", "id")
	ON DELETE no action ON UPDATE no action;
CREATE INDEX "visit_body_finding_clinic_assessment_idx" ON "visit_body_finding" USING btree ("clinic_id", "assessment_id");
CREATE INDEX "visit_body_finding_clinic_body_part_idx" ON "visit_body_finding" USING btree ("clinic_id", "body_part_code");
ALTER TABLE "visit_body_finding"
	ADD CONSTRAINT "visit_body_finding_clinic_assessment_fk"
	FOREIGN KEY ("clinic_id", "assessment_id")
	REFERENCES "public"."visit_assessment"("clinic_id", "id")
	ON DELETE no action ON UPDATE no action;
ALTER TABLE "visit" ALTER COLUMN "height_cm" SET DATA TYPE numeric(5,2) USING "height_cm"::numeric(5,2);
ALTER TABLE "visit" ALTER COLUMN "weight_kg" SET DATA TYPE numeric(5,2) USING "weight_kg"::numeric(5,2);
