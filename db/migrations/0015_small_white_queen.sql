ALTER TYPE "type" ADD VALUE 'pdf';--> statement-breakpoint
ALTER TYPE "type" ADD VALUE 'docx';--> statement-breakpoint
ALTER TYPE "type" ADD VALUE 'image';--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "type" "type" DEFAULT 'other';