DO $$ BEGIN
 CREATE TYPE "public"."event_status_enum" AS ENUM('attended', 'absent', 'scheduled', 'not-scheduled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status" "event_status_enum" DEFAULT 'scheduled';