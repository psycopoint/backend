DO $$ BEGIN
 CREATE TYPE "public"."account_status_enum" AS ENUM('active', 'pending', 'restricted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "account_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "account_status" "account_status_enum" DEFAULT 'restricted';