DO $$ BEGIN
 CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "notes" RENAME COLUMN "psychologists_id" TO "psychologist_id";--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_psychologists_id_psychologists_userId_fk";
--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "content" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "psychologists" ALTER COLUMN "adidional_emails" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "psychologists" ALTER COLUMN "additional_phones" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "psychologists" ALTER COLUMN "preferences" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "resource" jsonb;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "priority" "priority" DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "attachments" text;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "archived" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN IF EXISTS "patient_id";