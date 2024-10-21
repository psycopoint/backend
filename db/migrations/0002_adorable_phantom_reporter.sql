ALTER TABLE "psico_id" ADD COLUMN "username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "psico_id" ADD CONSTRAINT "psico_id_username_unique" UNIQUE("username");