ALTER TABLE "psico_id" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "psico_id" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "psico_id" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "psico_id" ALTER COLUMN "updated_at" DROP DEFAULT;