ALTER TYPE "type" ADD VALUE 'certificate';--> statement-breakpoint
ALTER TYPE "type" ADD VALUE 'declaration';--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "document_type" DROP DEFAULT;