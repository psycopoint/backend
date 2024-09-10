CREATE TABLE IF NOT EXISTS "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"psychologist_id" text NOT NULL,
	"patient_id" text,
	"title" text NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
