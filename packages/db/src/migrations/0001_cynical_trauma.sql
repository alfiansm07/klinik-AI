CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX "medical_action_name_trgm_idx" ON "medical_action" USING gin ((lower("name")) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "medicine_name_trgm_idx" ON "medicine" USING gin ((lower("name")) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "icd10_display_trgm_idx" ON "icd10" USING gin ((lower("display")) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "patient_active_name_trgm_idx" ON "patient" USING gin ((lower("name")) gin_trgm_ops) WHERE "patient"."deleted_at" is null;
