CREATE TYPE "public"."billing_item_source" AS ENUM('registration', 'action', 'prescription', 'manual', 'other');--> statement-breakpoint
CREATE TYPE "public"."billing_status" AS ENUM('draft', 'open', 'partially_paid', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."discharge_status" AS ENUM('pulang', 'rujuk', 'rawat_inap', 'meninggal', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."prescription_calculation_method" AS ENUM('manual', 'per_dosis', 'per_hari', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."prescription_item_type" AS ENUM('biasa', 'racikan', 'alkes', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('superadmin', 'admin', 'receptionist', 'nurse', 'doctor', 'pharmacist', 'cashier');--> statement-breakpoint
CREATE TYPE "public"."guarantor_type" AS ENUM('pribadi', 'bpjs', 'asuransi');--> statement-breakpoint
CREATE TYPE "public"."inventory_method" AS ENUM('fifo', 'lifo', 'average');--> statement-breakpoint
CREATE TYPE "public"."medical_action_type" AS ENUM('tindakan', 'radiologi', 'laboratorium');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('cash', 'transfer', 'qris', 'debit_card', 'credit_card', 'edc', 'other');--> statement-breakpoint
CREATE TYPE "public"."pricing_method" AS ENUM('hpp', 'markup');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('rawat_jalan', 'penunjang', 'kamar_operasi');--> statement-breakpoint
CREATE TYPE "public"."allergy_type" AS ENUM('obat', 'makanan', 'lingkungan', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."blood_type" AS ENUM('A', 'B', 'AB', 'O');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('laki_laki', 'perempuan');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('belum_menikah', 'menikah', 'cerai_hidup', 'cerai_mati', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."religion" AS ENUM('islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."queue_status" AS ENUM('waiting', 'called', 'serving', 'completed', 'skipped', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."visit_status" AS ENUM('registered', 'in_queue', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."visit_type" AS ENUM('baru', 'lama', 'kontrol', 'rujukan', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."dispensing_status" AS ENUM('draft', 'dispensed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."stock_entry_payment_method" AS ENUM('tunai', 'tempo', 'transfer', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."stock_entry_status" AS ENUM('draft', 'posted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_status" AS ENUM('draft', 'posted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."stock_opname_status" AS ENUM('draft', 'posted', 'cancelled');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"visit_id" text NOT NULL,
	"billing_number" text,
	"guarantor_id" text,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"total_discount" integer DEFAULT 0 NOT NULL,
	"total_paid" integer DEFAULT 0 NOT NULL,
	"remaining_balance" integer DEFAULT 0 NOT NULL,
	"status" "billing_status" DEFAULT 'draft' NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_item" (
	"id" text PRIMARY KEY NOT NULL,
	"billing_id" text NOT NULL,
	"source_type" "billing_item_source" DEFAULT 'other' NOT NULL,
	"source_reference_id" text,
	"code" text,
	"description" text NOT NULL,
	"unit_price" integer DEFAULT 0 NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"is_checked" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"billing_id" text NOT NULL,
	"receipt_number" text NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"received_from" text,
	"cash_amount" integer DEFAULT 0 NOT NULL,
	"card_amount" integer DEFAULT 0 NOT NULL,
	"claim_amount" integer DEFAULT 0 NOT NULL,
	"claim_guarantor_id" text,
	"card_payment_method_id" text,
	"total_bill_amount" integer DEFAULT 0 NOT NULL,
	"total_paid_amount" integer DEFAULT 0 NOT NULL,
	"total_discount" integer DEFAULT 0 NOT NULL,
	"cash_received" integer DEFAULT 0 NOT NULL,
	"cash_back" integer DEFAULT 0 NOT NULL,
	"remaining_balance" integer DEFAULT 0 NOT NULL,
	"print_bank_slip" boolean DEFAULT false NOT NULL,
	"status" "payment_status" DEFAULT 'paid' NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emr_action" (
	"id" text PRIMARY KEY NOT NULL,
	"visit_id" text NOT NULL,
	"medical_action_id" text,
	"action_name_snapshot" text NOT NULL,
	"unit_tariff" integer DEFAULT 0 NOT NULL,
	"qty" smallint DEFAULT 1 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emr_diagnosis" (
	"id" text PRIMARY KEY NOT NULL,
	"visit_id" text NOT NULL,
	"icd10_id" text,
	"diagnosis_text" text,
	"note" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_secondary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emr_soap" (
	"id" text PRIMARY KEY NOT NULL,
	"visit_id" text NOT NULL,
	"start_at" timestamp,
	"submitted_at" timestamp,
	"anamnesis" text,
	"subjective" text,
	"objective" text,
	"assessment" text,
	"plan" text,
	"nursing_care" text,
	"discharge_status" "discharge_status",
	"is_referred_to_inpatient" boolean DEFAULT false NOT NULL,
	"pcare_consciousness" text,
	"pcare_tacc_name" text,
	"pcare_tacc_reason" text,
	"updated_by_employee_id" text,
	"last_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescription" (
	"id" text PRIMARY KEY NOT NULL,
	"visit_id" text NOT NULL,
	"prescription_number" text NOT NULL,
	"prescribed_at" timestamp DEFAULT now() NOT NULL,
	"doctor_id" text,
	"source_poly_id" text,
	"destination" text,
	"medicine_price_type_id" text,
	"patient_weight_kg" text,
	"anamnesis_snapshot" text,
	"allergy_note_snapshot" text,
	"medication_note" text,
	"total_compounding_fee" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescription_item" (
	"id" text PRIMARY KEY NOT NULL,
	"prescription_id" text NOT NULL,
	"medicine_id" text,
	"item_type" "prescription_item_type" DEFAULT 'biasa' NOT NULL,
	"calculation_method" "prescription_calculation_method" DEFAULT 'manual' NOT NULL,
	"dosage_instruction_id" text,
	"dosage_instruction_text" text,
	"bso" text,
	"dose" text,
	"dose_unit" text,
	"qty" integer DEFAULT 1 NOT NULL,
	"unit_name_snapshot" text,
	"selling_price" integer DEFAULT 0 NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"compounding_fee" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"phone" text,
	"email" text,
	"website" text,
	"owner_name" text,
	"responsible_doctor" text,
	"sip_number" text,
	"license_number" text,
	"npwp_number" text,
	"npwp_file_url" text,
	"skt_file_url" text,
	"logo_url" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_member" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"user_id" text NOT NULL,
	"code" text,
	"display_name" text,
	"nik" text,
	"sip_number" text,
	"sip_expiry_date" date,
	"str_number" text,
	"str_expiry_date" date,
	"bpjs_doctor_code" text,
	"specialization" text,
	"employment_type" "employment_type" DEFAULT 'full_time' NOT NULL,
	"integrations" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "action_tariff" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"medical_action_id" text NOT NULL,
	"guarantor_id" text NOT NULL,
	"doctor_fee" integer DEFAULT 0 NOT NULL,
	"clinic_fee" integer DEFAULT 0 NOT NULL,
	"other_fee" integer DEFAULT 0 NOT NULL,
	"referral_fee" integer DEFAULT 0 NOT NULL,
	"total_fee" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dosage_instruction" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"instruction" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_category" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guarantor" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" "guarantor_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manufacturer" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_action" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"tariff_group_id" text,
	"action_type" "medical_action_type" DEFAULT 'tindakan' NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_compound" boolean DEFAULT false NOT NULL,
	"medicine_category_id" text,
	"manufacturer_id" text,
	"storage_location" text,
	"default_tax_pct" smallint DEFAULT 0 NOT NULL,
	"pricing_method" "pricing_method" DEFAULT 'hpp' NOT NULL,
	"inventory_method" "inventory_method" DEFAULT 'average' NOT NULL,
	"last_purchase_price" integer DEFAULT 0 NOT NULL,
	"highest_purchase_price" integer DEFAULT 0 NOT NULL,
	"avg_purchase_price" integer DEFAULT 0 NOT NULL,
	"max_retail_price" integer DEFAULT 0 NOT NULL,
	"small_unit_id" text,
	"package_unit_id" text,
	"package_conversion" integer,
	"package_unit2_id" text,
	"package_conversion2" integer,
	"compound_unit_id" text,
	"compound_quantity" integer,
	"dosage_info" text,
	"drug_interactions" text,
	"composition" text,
	"mechanism_of_action" text,
	"indications" text,
	"contraindications" text,
	"warnings" text,
	"pharmacology_id" text,
	"supplier_id" text,
	"kfa_code" text,
	"bpjs_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine_category" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine_pharmacology" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine_price" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"medicine_price_type_id" text NOT NULL,
	"profit_margin_pct" smallint DEFAULT 0 NOT NULL,
	"additional_cost" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine_price_type" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine_unit" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_method" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" "payment_method_type" DEFAULT 'other' NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poly" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"service_type" "service_type" DEFAULT 'rawat_jalan' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_tariff" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"doctor_fee" integer DEFAULT 0 NOT NULL,
	"clinic_fee" integer DEFAULT 0 NOT NULL,
	"total_fee" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"poly_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"bed_count" smallint DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shift" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_location" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tariff_group" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor_schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"poly_id" text NOT NULL,
	"shift_id" text NOT NULL,
	"day_of_week" smallint NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"max_patients" smallint,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "icd10" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"display" text NOT NULL,
	"version" text DEFAULT 'ICD10_2010' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"mr_number" text NOT NULL,
	"old_mr_number" text,
	"first_registered_at" date DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"place_of_birth" text,
	"date_of_birth" date,
	"gender" "gender",
	"blood_type" "blood_type",
	"religion" "religion",
	"occupation" text,
	"marital_status" "marital_status",
	"citizenship" text DEFAULT 'Indonesia',
	"phone" text,
	"home_phone" text,
	"email" text,
	"photo_url" text,
	"address" text,
	"address2" text,
	"city" text,
	"sub_district" text,
	"village" text,
	"nik" text,
	"bpjs_number" text,
	"member_number" text,
	"satu_sehat_patient_id" text,
	"special_condition" text,
	"father_name" text,
	"mother_name" text,
	"parent_address" text,
	"parent_address2" text,
	"parent_city" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_allergy" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"allergen" text NOT NULL,
	"type" "allergy_type" DEFAULT 'lainnya' NOT NULL,
	"reaction" text,
	"notes" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queue" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"visit_id" text NOT NULL,
	"queue_number" smallint NOT NULL,
	"queue_date" timestamp DEFAULT now() NOT NULL,
	"status" "queue_status" DEFAULT 'waiting' NOT NULL,
	"called_at" timestamp,
	"served_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visit" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"registration_number" text NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"nurse_id" text,
	"guarantor_id" text,
	"poly_id" text,
	"doctor_id" text,
	"registration_tariff_id" text,
	"registration_fee" integer DEFAULT 0 NOT NULL,
	"visit_type" "visit_type" DEFAULT 'lama' NOT NULL,
	"referral_note" text,
	"chief_complaint" text,
	"status" "visit_status" DEFAULT 'registered' NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vital_sign" (
	"id" text PRIMARY KEY NOT NULL,
	"visit_id" text NOT NULL,
	"oxygen_saturation" smallint,
	"temperature_c" numeric(4, 1),
	"height_cm" numeric(5, 2),
	"weight_kg" numeric(5, 2),
	"abdominal_circumference_cm" numeric(5, 2),
	"bmi" numeric(5, 2),
	"head_circumference_cm" numeric(5, 2),
	"systolic" smallint,
	"diastolic" smallint,
	"respiratory_rate" smallint,
	"heart_rate" smallint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispensing" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"visit_id" text NOT NULL,
	"prescription_id" text,
	"billing_number" text,
	"dispensed_at" timestamp DEFAULT now() NOT NULL,
	"stock_location_id" text NOT NULL,
	"medicine_price_type_id" text,
	"total_compounding_fee" integer DEFAULT 0 NOT NULL,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"status" "dispensing_status" DEFAULT 'draft' NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispensing_item" (
	"id" text PRIMARY KEY NOT NULL,
	"dispensing_id" text NOT NULL,
	"medicine_id" text,
	"item_code_snapshot" text,
	"item_name_snapshot" text NOT NULL,
	"item_type" text,
	"qty" integer DEFAULT 1 NOT NULL,
	"ending_stock" integer,
	"unit_name_snapshot" text,
	"dose" text,
	"dose_unit" text,
	"selling_price" integer DEFAULT 0 NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"compounding_fee" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"entry_number" text NOT NULL,
	"entry_at" timestamp DEFAULT now() NOT NULL,
	"stock_location_id" text NOT NULL,
	"supplier_id" text,
	"invoice_date" date,
	"delivery_order_number" text,
	"notes" text,
	"payment_method" "stock_entry_payment_method" DEFAULT 'tunai' NOT NULL,
	"due_date" date,
	"total_discount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"status" "stock_entry_status" DEFAULT 'draft' NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_entry_item" (
	"id" text PRIMARY KEY NOT NULL,
	"stock_entry_id" text NOT NULL,
	"medicine_id" text,
	"item_code_snapshot" text,
	"item_name_snapshot" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"unit_name_snapshot" text,
	"purchase_price" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"tax_pct" integer DEFAULT 0 NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"batch_number" text,
	"expired_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movement" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"movement_number" text NOT NULL,
	"moved_at" timestamp DEFAULT now() NOT NULL,
	"source_stock_location_id" text NOT NULL,
	"target_stock_location_id" text NOT NULL,
	"note_for_patient" text,
	"status" "stock_movement_status" DEFAULT 'draft' NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movement_item" (
	"id" text PRIMARY KEY NOT NULL,
	"stock_movement_id" text NOT NULL,
	"medicine_id" text,
	"item_code_snapshot" text,
	"item_name_snapshot" text NOT NULL,
	"principle_qty" integer DEFAULT 0 NOT NULL,
	"moved_qty" integer DEFAULT 0 NOT NULL,
	"available_stock" integer DEFAULT 0 NOT NULL,
	"target_stock" integer DEFAULT 0 NOT NULL,
	"unit_name_snapshot" text,
	"hna" integer DEFAULT 0 NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_opname" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"opname_number" text NOT NULL,
	"opname_at" timestamp DEFAULT now() NOT NULL,
	"stock_location_id" text NOT NULL,
	"notes" text,
	"status" "stock_opname_status" DEFAULT 'draft' NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_opname_item" (
	"id" text PRIMARY KEY NOT NULL,
	"stock_opname_id" text NOT NULL,
	"medicine_id" text,
	"item_code_snapshot" text,
	"item_name_snapshot" text NOT NULL,
	"difference_qty" integer DEFAULT 0 NOT NULL,
	"system_stock" integer DEFAULT 0 NOT NULL,
	"physical_stock" integer DEFAULT 0 NOT NULL,
	"cost_price" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_guarantor_id_guarantor_id_fk" FOREIGN KEY ("guarantor_id") REFERENCES "public"."guarantor"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_item" ADD CONSTRAINT "billing_item_billing_id_billing_id_fk" FOREIGN KEY ("billing_id") REFERENCES "public"."billing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_billing_id_billing_id_fk" FOREIGN KEY ("billing_id") REFERENCES "public"."billing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_claim_guarantor_id_guarantor_id_fk" FOREIGN KEY ("claim_guarantor_id") REFERENCES "public"."guarantor"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_card_payment_method_id_payment_method_id_fk" FOREIGN KEY ("card_payment_method_id") REFERENCES "public"."payment_method"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emr_action" ADD CONSTRAINT "emr_action_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emr_action" ADD CONSTRAINT "emr_action_medical_action_id_medical_action_id_fk" FOREIGN KEY ("medical_action_id") REFERENCES "public"."medical_action"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emr_diagnosis" ADD CONSTRAINT "emr_diagnosis_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emr_diagnosis" ADD CONSTRAINT "emr_diagnosis_icd10_id_icd10_id_fk" FOREIGN KEY ("icd10_id") REFERENCES "public"."icd10"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emr_soap" ADD CONSTRAINT "emr_soap_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emr_soap" ADD CONSTRAINT "emr_soap_updated_by_employee_id_employee_id_fk" FOREIGN KEY ("updated_by_employee_id") REFERENCES "public"."employee"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_doctor_id_employee_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."employee"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_source_poly_id_poly_id_fk" FOREIGN KEY ("source_poly_id") REFERENCES "public"."poly"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_medicine_price_type_id_medicine_price_type_id_fk" FOREIGN KEY ("medicine_price_type_id") REFERENCES "public"."medicine_price_type"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_prescription_id_prescription_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_dosage_instruction_id_dosage_instruction_id_fk" FOREIGN KEY ("dosage_instruction_id") REFERENCES "public"."dosage_instruction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_member" ADD CONSTRAINT "clinic_member_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_member" ADD CONSTRAINT "clinic_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_medical_action_id_medical_action_id_fk" FOREIGN KEY ("medical_action_id") REFERENCES "public"."medical_action"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_guarantor_id_guarantor_id_fk" FOREIGN KEY ("guarantor_id") REFERENCES "public"."guarantor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dosage_instruction" ADD CONSTRAINT "dosage_instruction_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_category" ADD CONSTRAINT "expense_category_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guarantor" ADD CONSTRAINT "guarantor_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manufacturer" ADD CONSTRAINT "manufacturer_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_action" ADD CONSTRAINT "medical_action_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_action" ADD CONSTRAINT "medical_action_tariff_group_id_tariff_group_id_fk" FOREIGN KEY ("tariff_group_id") REFERENCES "public"."tariff_group"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_medicine_category_id_medicine_category_id_fk" FOREIGN KEY ("medicine_category_id") REFERENCES "public"."medicine_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_manufacturer_id_manufacturer_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_small_unit_id_medicine_unit_id_fk" FOREIGN KEY ("small_unit_id") REFERENCES "public"."medicine_unit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_package_unit_id_medicine_unit_id_fk" FOREIGN KEY ("package_unit_id") REFERENCES "public"."medicine_unit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_package_unit2_id_medicine_unit_id_fk" FOREIGN KEY ("package_unit2_id") REFERENCES "public"."medicine_unit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_compound_unit_id_medicine_unit_id_fk" FOREIGN KEY ("compound_unit_id") REFERENCES "public"."medicine_unit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_pharmacology_id_medicine_pharmacology_id_fk" FOREIGN KEY ("pharmacology_id") REFERENCES "public"."medicine_pharmacology"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_category" ADD CONSTRAINT "medicine_category_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_pharmacology" ADD CONSTRAINT "medicine_pharmacology_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_price" ADD CONSTRAINT "medicine_price_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_price" ADD CONSTRAINT "medicine_price_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_price" ADD CONSTRAINT "medicine_price_medicine_price_type_id_medicine_price_type_id_fk" FOREIGN KEY ("medicine_price_type_id") REFERENCES "public"."medicine_price_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_price_type" ADD CONSTRAINT "medicine_price_type_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_unit" ADD CONSTRAINT "medicine_unit_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_method" ADD CONSTRAINT "payment_method_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poly" ADD CONSTRAINT "poly_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_tariff" ADD CONSTRAINT "registration_tariff_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_poly_id_poly_id_fk" FOREIGN KEY ("poly_id") REFERENCES "public"."poly"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift" ADD CONSTRAINT "shift_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_location" ADD CONSTRAINT "stock_location_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariff_group" ADD CONSTRAINT "tariff_group_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_schedule" ADD CONSTRAINT "doctor_schedule_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_schedule" ADD CONSTRAINT "doctor_schedule_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_schedule" ADD CONSTRAINT "doctor_schedule_poly_id_poly_id_fk" FOREIGN KEY ("poly_id") REFERENCES "public"."poly"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_schedule" ADD CONSTRAINT "doctor_schedule_shift_id_shift_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shift"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_allergy" ADD CONSTRAINT "patient_allergy_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue" ADD CONSTRAINT "queue_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue" ADD CONSTRAINT "queue_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_nurse_id_employee_id_fk" FOREIGN KEY ("nurse_id") REFERENCES "public"."employee"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_guarantor_id_guarantor_id_fk" FOREIGN KEY ("guarantor_id") REFERENCES "public"."guarantor"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_poly_id_poly_id_fk" FOREIGN KEY ("poly_id") REFERENCES "public"."poly"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_doctor_id_employee_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."employee"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_registration_tariff_id_registration_tariff_id_fk" FOREIGN KEY ("registration_tariff_id") REFERENCES "public"."registration_tariff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_sign" ADD CONSTRAINT "vital_sign_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensing" ADD CONSTRAINT "dispensing_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensing" ADD CONSTRAINT "dispensing_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensing" ADD CONSTRAINT "dispensing_prescription_id_prescription_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescription"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensing" ADD CONSTRAINT "dispensing_stock_location_id_stock_location_id_fk" FOREIGN KEY ("stock_location_id") REFERENCES "public"."stock_location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensing" ADD CONSTRAINT "dispensing_medicine_price_type_id_medicine_price_type_id_fk" FOREIGN KEY ("medicine_price_type_id") REFERENCES "public"."medicine_price_type"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensing_item" ADD CONSTRAINT "dispensing_item_dispensing_id_dispensing_id_fk" FOREIGN KEY ("dispensing_id") REFERENCES "public"."dispensing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensing_item" ADD CONSTRAINT "dispensing_item_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_entry" ADD CONSTRAINT "stock_entry_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_entry" ADD CONSTRAINT "stock_entry_stock_location_id_stock_location_id_fk" FOREIGN KEY ("stock_location_id") REFERENCES "public"."stock_location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_entry" ADD CONSTRAINT "stock_entry_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_entry_item" ADD CONSTRAINT "stock_entry_item_stock_entry_id_stock_entry_id_fk" FOREIGN KEY ("stock_entry_id") REFERENCES "public"."stock_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_entry_item" ADD CONSTRAINT "stock_entry_item_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_source_stock_location_id_stock_location_id_fk" FOREIGN KEY ("source_stock_location_id") REFERENCES "public"."stock_location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_target_stock_location_id_stock_location_id_fk" FOREIGN KEY ("target_stock_location_id") REFERENCES "public"."stock_location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement_item" ADD CONSTRAINT "stock_movement_item_stock_movement_id_stock_movement_id_fk" FOREIGN KEY ("stock_movement_id") REFERENCES "public"."stock_movement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement_item" ADD CONSTRAINT "stock_movement_item_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_opname" ADD CONSTRAINT "stock_opname_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_opname" ADD CONSTRAINT "stock_opname_stock_location_id_stock_location_id_fk" FOREIGN KEY ("stock_location_id") REFERENCES "public"."stock_location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_opname_item" ADD CONSTRAINT "stock_opname_item_stock_opname_id_stock_opname_id_fk" FOREIGN KEY ("stock_opname_id") REFERENCES "public"."stock_opname"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_opname_item" ADD CONSTRAINT "stock_opname_item_medicine_id_medicine_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicine"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_visit_id_idx" ON "billing" USING btree ("visit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_clinic_billing_number_idx" ON "billing" USING btree ("clinic_id","billing_number");--> statement-breakpoint
CREATE INDEX "billing_clinic_id_idx" ON "billing" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "billing_status_idx" ON "billing" USING btree ("status");--> statement-breakpoint
CREATE INDEX "billing_active_clinic_status_created_at_idx" ON "billing" USING btree ("clinic_id","status","created_at") WHERE "billing"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "billing_item_billing_id_idx" ON "billing_item" USING btree ("billing_id");--> statement-breakpoint
CREATE INDEX "billing_item_source_idx" ON "billing_item" USING btree ("source_type","source_reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_clinic_receipt_number_idx" ON "payment" USING btree ("clinic_id","receipt_number");--> statement-breakpoint
CREATE INDEX "payment_clinic_id_idx" ON "payment" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "payment_billing_id_idx" ON "payment" USING btree ("billing_id");--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "payment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_active_clinic_paid_at_idx" ON "payment" USING btree ("clinic_id","paid_at") WHERE "payment"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "payment_active_clinic_status_paid_at_idx" ON "payment" USING btree ("clinic_id","status","paid_at") WHERE "payment"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "emr_action_visit_id_idx" ON "emr_action" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "emr_action_medical_action_id_idx" ON "emr_action" USING btree ("medical_action_id");--> statement-breakpoint
CREATE INDEX "emr_diagnosis_visit_id_idx" ON "emr_diagnosis" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "emr_diagnosis_icd10_id_idx" ON "emr_diagnosis" USING btree ("icd10_id");--> statement-breakpoint
CREATE INDEX "emr_diagnosis_visit_primary_idx" ON "emr_diagnosis" USING btree ("visit_id","is_primary");--> statement-breakpoint
CREATE UNIQUE INDEX "emr_soap_visit_id_idx" ON "emr_soap" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "emr_soap_updated_by_employee_id_idx" ON "emr_soap" USING btree ("updated_by_employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prescription_visit_number_idx" ON "prescription" USING btree ("visit_id","prescription_number");--> statement-breakpoint
CREATE INDEX "prescription_visit_id_idx" ON "prescription" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "prescription_doctor_id_idx" ON "prescription" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "prescription_item_prescription_id_idx" ON "prescription_item" USING btree ("prescription_id");--> statement-breakpoint
CREATE INDEX "prescription_item_medicine_id_idx" ON "prescription_item" USING btree ("medicine_id");--> statement-breakpoint
CREATE INDEX "prescription_item_dosage_instruction_id_idx" ON "prescription_item" USING btree ("dosage_instruction_id");--> statement-breakpoint
CREATE UNIQUE INDEX "clinic_member_clinic_user_idx" ON "clinic_member" USING btree ("clinic_id","user_id");--> statement-breakpoint
CREATE INDEX "clinic_member_clinic_id_idx" ON "clinic_member" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "clinic_member_user_id_idx" ON "clinic_member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_clinic_user_idx" ON "employee" USING btree ("clinic_id","user_id");--> statement-breakpoint
CREATE INDEX "employee_clinic_id_idx" ON "employee" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "employee_user_id_idx" ON "employee" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "action_tariff_unique_idx" ON "action_tariff" USING btree ("clinic_id","medical_action_id","guarantor_id");--> statement-breakpoint
CREATE INDEX "action_tariff_clinic_id_idx" ON "action_tariff" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "action_tariff_medical_action_id_idx" ON "action_tariff" USING btree ("medical_action_id");--> statement-breakpoint
CREATE INDEX "action_tariff_guarantor_id_idx" ON "action_tariff" USING btree ("guarantor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dosage_instruction_clinic_code_idx" ON "dosage_instruction" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "dosage_instruction_clinic_id_idx" ON "dosage_instruction" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "expense_category_clinic_code_idx" ON "expense_category" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "expense_category_clinic_id_idx" ON "expense_category" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guarantor_clinic_code_idx" ON "guarantor" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "guarantor_clinic_id_idx" ON "guarantor" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "manufacturer_clinic_code_idx" ON "manufacturer" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "manufacturer_clinic_id_idx" ON "manufacturer" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "medical_action_clinic_code_idx" ON "medical_action" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "medical_action_clinic_id_idx" ON "medical_action" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "medical_action_clinic_type_idx" ON "medical_action" USING btree ("clinic_id","action_type");--> statement-breakpoint
CREATE INDEX "medical_action_tariff_group_id_idx" ON "medical_action" USING btree ("tariff_group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "medicine_clinic_code_idx" ON "medicine" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "medicine_clinic_id_idx" ON "medicine" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "medicine_category_id_idx" ON "medicine" USING btree ("medicine_category_id");--> statement-breakpoint
CREATE INDEX "medicine_manufacturer_id_idx" ON "medicine" USING btree ("manufacturer_id");--> statement-breakpoint
CREATE INDEX "medicine_pharmacology_id_idx" ON "medicine" USING btree ("pharmacology_id");--> statement-breakpoint
CREATE INDEX "medicine_supplier_id_idx" ON "medicine" USING btree ("supplier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "medicine_category_clinic_code_idx" ON "medicine_category" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "medicine_category_clinic_id_idx" ON "medicine_category" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "medicine_pharmacology_clinic_code_idx" ON "medicine_pharmacology" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "medicine_pharmacology_clinic_id_idx" ON "medicine_pharmacology" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "medicine_price_unique_idx" ON "medicine_price" USING btree ("clinic_id","medicine_id","medicine_price_type_id");--> statement-breakpoint
CREATE INDEX "medicine_price_clinic_id_idx" ON "medicine_price" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "medicine_price_medicine_id_idx" ON "medicine_price" USING btree ("medicine_id");--> statement-breakpoint
CREATE INDEX "medicine_price_type_id_idx" ON "medicine_price" USING btree ("medicine_price_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "medicine_price_type_clinic_code_idx" ON "medicine_price_type" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "medicine_price_type_clinic_id_idx" ON "medicine_price_type" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "medicine_unit_clinic_code_idx" ON "medicine_unit" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "medicine_unit_clinic_id_idx" ON "medicine_unit" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_method_clinic_code_idx" ON "payment_method" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "payment_method_clinic_id_idx" ON "payment_method" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "poly_clinic_code_idx" ON "poly" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "poly_clinic_id_idx" ON "poly" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registration_tariff_clinic_code_idx" ON "registration_tariff" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "registration_tariff_clinic_id_idx" ON "registration_tariff" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "room_clinic_code_idx" ON "room" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "room_clinic_id_idx" ON "room" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "room_poly_id_idx" ON "room" USING btree ("poly_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shift_clinic_code_idx" ON "shift" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "shift_clinic_id_idx" ON "shift" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_location_clinic_code_idx" ON "stock_location" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "stock_location_clinic_id_idx" ON "stock_location" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_clinic_code_idx" ON "supplier" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "supplier_clinic_id_idx" ON "supplier" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tariff_group_clinic_code_idx" ON "tariff_group" USING btree ("clinic_id","code");--> statement-breakpoint
CREATE INDEX "tariff_group_clinic_id_idx" ON "tariff_group" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "doctor_schedule_unique_idx" ON "doctor_schedule" USING btree ("clinic_id","employee_id","poly_id","day_of_week","shift_id");--> statement-breakpoint
CREATE INDEX "doctor_schedule_clinic_id_idx" ON "doctor_schedule" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "doctor_schedule_employee_id_idx" ON "doctor_schedule" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "doctor_schedule_poly_id_idx" ON "doctor_schedule" USING btree ("poly_id");--> statement-breakpoint
CREATE INDEX "doctor_schedule_shift_id_idx" ON "doctor_schedule" USING btree ("shift_id");--> statement-breakpoint
CREATE UNIQUE INDEX "icd10_code_idx" ON "icd10" USING btree ("code");--> statement-breakpoint
CREATE INDEX "icd10_display_idx" ON "icd10" USING btree ("display");--> statement-breakpoint
CREATE UNIQUE INDEX "patient_clinic_mr_idx" ON "patient" USING btree ("clinic_id","mr_number");--> statement-breakpoint
CREATE INDEX "patient_clinic_id_idx" ON "patient" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "patient_clinic_name_idx" ON "patient" USING btree ("clinic_id","name");--> statement-breakpoint
CREATE INDEX "patient_clinic_nik_idx" ON "patient" USING btree ("clinic_id","nik");--> statement-breakpoint
CREATE INDEX "patient_clinic_bpjs_idx" ON "patient" USING btree ("clinic_id","bpjs_number");--> statement-breakpoint
CREATE INDEX "patient_clinic_satu_sehat_id_idx" ON "patient" USING btree ("clinic_id","satu_sehat_patient_id");--> statement-breakpoint
CREATE INDEX "patient_active_clinic_created_at_idx" ON "patient" USING btree ("clinic_id","created_at") WHERE "patient"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "patient_allergy_patient_allergen_idx" ON "patient_allergy" USING btree ("patient_id","allergen");--> statement-breakpoint
CREATE INDEX "patient_allergy_patient_id_idx" ON "patient_allergy" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "patient_allergy_type_idx" ON "patient_allergy" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "queue_visit_id_idx" ON "queue" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "queue_clinic_id_idx" ON "queue" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "queue_clinic_date_number_idx" ON "queue" USING btree ("clinic_id","queue_date","queue_number");--> statement-breakpoint
CREATE INDEX "queue_status_idx" ON "queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "queue_clinic_status_date_number_idx" ON "queue" USING btree ("clinic_id","status","queue_date","queue_number");--> statement-breakpoint
CREATE UNIQUE INDEX "visit_clinic_registration_number_idx" ON "visit" USING btree ("clinic_id","registration_number");--> statement-breakpoint
CREATE INDEX "visit_clinic_id_idx" ON "visit" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "visit_patient_id_idx" ON "visit" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "visit_clinic_registered_at_idx" ON "visit" USING btree ("clinic_id","registered_at");--> statement-breakpoint
CREATE INDEX "visit_status_idx" ON "visit" USING btree ("status");--> statement-breakpoint
CREATE INDEX "visit_doctor_id_idx" ON "visit" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "visit_poly_id_idx" ON "visit" USING btree ("poly_id");--> statement-breakpoint
CREATE INDEX "visit_active_clinic_status_registered_at_idx" ON "visit" USING btree ("clinic_id","status","registered_at") WHERE "visit"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "visit_active_clinic_doctor_registered_at_idx" ON "visit" USING btree ("clinic_id","doctor_id","registered_at") WHERE "visit"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "visit_active_clinic_poly_registered_at_idx" ON "visit" USING btree ("clinic_id","poly_id","registered_at") WHERE "visit"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "vital_sign_visit_id_idx" ON "vital_sign" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "vital_sign_systolic_diastolic_idx" ON "vital_sign" USING btree ("systolic","diastolic");--> statement-breakpoint
CREATE UNIQUE INDEX "dispensing_clinic_billing_number_idx" ON "dispensing" USING btree ("clinic_id","billing_number");--> statement-breakpoint
CREATE INDEX "dispensing_clinic_id_idx" ON "dispensing" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "dispensing_visit_id_idx" ON "dispensing" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "dispensing_prescription_id_idx" ON "dispensing" USING btree ("prescription_id");--> statement-breakpoint
CREATE INDEX "dispensing_stock_location_id_idx" ON "dispensing" USING btree ("stock_location_id");--> statement-breakpoint
CREATE INDEX "dispensing_active_clinic_status_dispensed_idx" ON "dispensing" USING btree ("clinic_id","status","dispensed_at") WHERE "dispensing"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "dispensing_active_clinic_location_dispensed_idx" ON "dispensing" USING btree ("clinic_id","stock_location_id","dispensed_at") WHERE "dispensing"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "dispensing_item_dispensing_id_idx" ON "dispensing_item" USING btree ("dispensing_id");--> statement-breakpoint
CREATE INDEX "dispensing_item_medicine_id_idx" ON "dispensing_item" USING btree ("medicine_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_entry_clinic_number_idx" ON "stock_entry" USING btree ("clinic_id","entry_number");--> statement-breakpoint
CREATE INDEX "stock_entry_clinic_id_idx" ON "stock_entry" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "stock_entry_stock_location_id_idx" ON "stock_entry" USING btree ("stock_location_id");--> statement-breakpoint
CREATE INDEX "stock_entry_supplier_id_idx" ON "stock_entry" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "stock_entry_status_idx" ON "stock_entry" USING btree ("status");--> statement-breakpoint
CREATE INDEX "stock_entry_active_clinic_status_entry_idx" ON "stock_entry" USING btree ("clinic_id","status","entry_at") WHERE "stock_entry"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "stock_entry_active_clinic_location_entry_idx" ON "stock_entry" USING btree ("clinic_id","stock_location_id","entry_at") WHERE "stock_entry"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "stock_entry_item_stock_entry_id_idx" ON "stock_entry_item" USING btree ("stock_entry_id");--> statement-breakpoint
CREATE INDEX "stock_entry_item_medicine_id_idx" ON "stock_entry_item" USING btree ("medicine_id");--> statement-breakpoint
CREATE INDEX "stock_entry_item_batch_number_idx" ON "stock_entry_item" USING btree ("batch_number");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_movement_clinic_number_idx" ON "stock_movement" USING btree ("clinic_id","movement_number");--> statement-breakpoint
CREATE INDEX "stock_movement_clinic_id_idx" ON "stock_movement" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "stock_movement_source_location_id_idx" ON "stock_movement" USING btree ("source_stock_location_id");--> statement-breakpoint
CREATE INDEX "stock_movement_target_location_id_idx" ON "stock_movement" USING btree ("target_stock_location_id");--> statement-breakpoint
CREATE INDEX "stock_move_active_clinic_status_moved_idx" ON "stock_movement" USING btree ("clinic_id","status","moved_at") WHERE "stock_movement"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "stock_move_active_clinic_source_moved_idx" ON "stock_movement" USING btree ("clinic_id","source_stock_location_id","moved_at") WHERE "stock_movement"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "stock_movement_item_movement_id_idx" ON "stock_movement_item" USING btree ("stock_movement_id");--> statement-breakpoint
CREATE INDEX "stock_movement_item_medicine_id_idx" ON "stock_movement_item" USING btree ("medicine_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_opname_clinic_number_idx" ON "stock_opname" USING btree ("clinic_id","opname_number");--> statement-breakpoint
CREATE INDEX "stock_opname_clinic_id_idx" ON "stock_opname" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "stock_opname_stock_location_id_idx" ON "stock_opname" USING btree ("stock_location_id");--> statement-breakpoint
CREATE INDEX "stock_opname_active_clinic_status_opname_idx" ON "stock_opname" USING btree ("clinic_id","status","opname_at") WHERE "stock_opname"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "stock_opname_active_clinic_location_opname_idx" ON "stock_opname" USING btree ("clinic_id","stock_location_id","opname_at") WHERE "stock_opname"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "stock_opname_item_opname_id_idx" ON "stock_opname_item" USING btree ("stock_opname_id");--> statement-breakpoint
CREATE INDEX "stock_opname_item_medicine_id_idx" ON "stock_opname_item" USING btree ("medicine_id");