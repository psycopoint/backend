ALTER TABLE "subscriptions" ADD COLUMN "metadata" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "billing_anchor";