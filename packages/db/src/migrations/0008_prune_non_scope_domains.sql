DROP TABLE IF EXISTS "billing_item" CASCADE;
DROP TABLE IF EXISTS "payment" CASCADE;
DROP TABLE IF EXISTS "billing" CASCADE;

DROP TABLE IF EXISTS "prescription_item" CASCADE;
DROP TABLE IF EXISTS "prescription" CASCADE;
DROP TABLE IF EXISTS "emr_action" CASCADE;
DROP TABLE IF EXISTS "emr_diagnosis" CASCADE;
DROP TABLE IF EXISTS "emr_soap" CASCADE;

DROP TABLE IF EXISTS "dispensing_item" CASCADE;
DROP TABLE IF EXISTS "dispensing" CASCADE;
DROP TABLE IF EXISTS "stock_entry_item" CASCADE;
DROP TABLE IF EXISTS "stock_entry" CASCADE;
DROP TABLE IF EXISTS "stock_movement_item" CASCADE;
DROP TABLE IF EXISTS "stock_movement" CASCADE;
DROP TABLE IF EXISTS "stock_opname_item" CASCADE;
DROP TABLE IF EXISTS "stock_opname" CASCADE;

DROP TABLE IF EXISTS "vital_sign" CASCADE;
DROP TABLE IF EXISTS "queue" CASCADE;
DROP TABLE IF EXISTS "patient_allergy" CASCADE;
DROP TABLE IF EXISTS "visit" CASCADE;
DROP TABLE IF EXISTS "patient" CASCADE;

DROP TABLE IF EXISTS "doctor_schedule" CASCADE;
DROP TABLE IF EXISTS "icd10" CASCADE;

DROP TABLE IF EXISTS "medicine_price" CASCADE;
DROP TABLE IF EXISTS "medicine_price_type" CASCADE;
DROP TABLE IF EXISTS "dosage_instruction" CASCADE;
DROP TABLE IF EXISTS "registration_tariff" CASCADE;
DROP TABLE IF EXISTS "tariff_group" CASCADE;
DROP TABLE IF EXISTS "stock_location" CASCADE;
DROP TABLE IF EXISTS "expense_category" CASCADE;
DROP TABLE IF EXISTS "shift" CASCADE;
DROP TABLE IF EXISTS "room" CASCADE;
DROP TABLE IF EXISTS "payment_method" CASCADE;
DROP TABLE IF EXISTS "poly" CASCADE;

DROP TYPE IF EXISTS "public"."stock_opname_status" CASCADE;
DROP TYPE IF EXISTS "public"."stock_movement_status" CASCADE;
DROP TYPE IF EXISTS "public"."stock_entry_status" CASCADE;
DROP TYPE IF EXISTS "public"."stock_entry_payment_method" CASCADE;
DROP TYPE IF EXISTS "public"."dispensing_status" CASCADE;
DROP TYPE IF EXISTS "public"."visit_type" CASCADE;
DROP TYPE IF EXISTS "public"."visit_status" CASCADE;
DROP TYPE IF EXISTS "public"."queue_status" CASCADE;
DROP TYPE IF EXISTS "public"."religion" CASCADE;
DROP TYPE IF EXISTS "public"."marital_status" CASCADE;
DROP TYPE IF EXISTS "public"."gender" CASCADE;
DROP TYPE IF EXISTS "public"."blood_type" CASCADE;
DROP TYPE IF EXISTS "public"."allergy_type" CASCADE;
DROP TYPE IF EXISTS "public"."service_type" CASCADE;
DROP TYPE IF EXISTS "public"."payment_method_type" CASCADE;
DROP TYPE IF EXISTS "public"."prescription_item_type" CASCADE;
DROP TYPE IF EXISTS "public"."prescription_calculation_method" CASCADE;
DROP TYPE IF EXISTS "public"."discharge_status" CASCADE;
DROP TYPE IF EXISTS "public"."payment_status" CASCADE;
DROP TYPE IF EXISTS "public"."billing_status" CASCADE;
DROP TYPE IF EXISTS "public"."billing_item_source" CASCADE;
