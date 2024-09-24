ALTER TABLE "auth"."users" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "auth"."users" ADD COLUMN "provider_id" text;