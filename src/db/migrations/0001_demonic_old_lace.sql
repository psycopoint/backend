DO $$ BEGIN
 CREATE TYPE "public"."providers" AS ENUM('google', 'linkedin', 'apple', 'credentials');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" "providers";