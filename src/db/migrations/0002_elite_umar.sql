ALTER TABLE "auth"."refresh_tokens" ALTER COLUMN "expires_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" DROP COLUMN IF EXISTS "token";--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" DROP COLUMN IF EXISTS "refresh_token";