DO $$ BEGIN
 CREATE TYPE "public"."file_type" AS ENUM('pdf', 'docx', 'image');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "type" ADD VALUE 'diagram';--> statement-breakpoint
ALTER TYPE "type" ADD VALUE 'receipt';--> statement-breakpoint
ALTER TYPE "type" ADD VALUE 'document';--> statement-breakpoint
ALTER TABLE "documents" RENAME COLUMN "type" TO "document_type";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "file_type" "file_type" DEFAULT 'pdf';