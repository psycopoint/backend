ALTER TABLE "psico_id" RENAME TO "psicoid";--> statement-breakpoint
ALTER TABLE "psicoid" DROP CONSTRAINT "psico_id_user_tag_unique";--> statement-breakpoint
ALTER TABLE "psicoid" DROP CONSTRAINT "psico_id_user_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psicoid" ADD CONSTRAINT "psicoid_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "psicoid" ADD CONSTRAINT "psicoid_user_tag_unique" UNIQUE("user_tag");