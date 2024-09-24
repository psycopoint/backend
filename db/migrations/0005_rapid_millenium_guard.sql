ALTER TABLE "transactions" DROP CONSTRAINT "transactions_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "data" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "patient_id";