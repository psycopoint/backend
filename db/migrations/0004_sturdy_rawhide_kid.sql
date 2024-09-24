DO $$ BEGIN
 CREATE TYPE "public"."transactionTypeEnum" AS ENUM('payment', 'expense');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "methodsEnum" ADD VALUE 'bank_transfer';--> statement-breakpoint
ALTER TYPE "methodsEnum" ADD VALUE 'cash';--> statement-breakpoint
ALTER TYPE "methodsEnum" ADD VALUE 'other';--> statement-breakpoint
ALTER TABLE "payments" RENAME TO "transactions";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "payment_date" TO "transaction_date";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "payments_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "payments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "payments_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "receipts" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "transaction_type" "transactionTypeEnum" NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
