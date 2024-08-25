DO $$ BEGIN
 CREATE TYPE "public"."recurring" AS ENUM('daily', 'weekly', 'monthly', 'yearly', 'once');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "recurring" "recurring" DEFAULT 'once';