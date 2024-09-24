ALTER TABLE "subscriptions" ADD COLUMN "pricing" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "quantity" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "subscribed_at" text;