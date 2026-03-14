-- ALTER TYPE "public"."medical_action_type" ADD VALUE 'regular' BEFORE 'tindakan';
-- ↑ Applied manually outside migration (PostgreSQL cannot ALTER TYPE ADD VALUE inside a transaction)
SELECT 1;