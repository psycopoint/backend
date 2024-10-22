ALTER TABLE "psico_id" RENAME COLUMN "username" TO "user_tag";--> statement-breakpoint
ALTER TABLE "psico_id" DROP CONSTRAINT "psico_id_username_unique";--> statement-breakpoint
ALTER TABLE "psico_id" ADD CONSTRAINT "psico_id_user_tag_unique" UNIQUE("user_tag");