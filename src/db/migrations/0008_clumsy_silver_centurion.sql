ALTER TABLE "subscriptions" RENAME COLUMN "ends_at" TO "cancel_at";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "canceled_at" text;