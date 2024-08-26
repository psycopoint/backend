ALTER TABLE "payments" RENAME COLUMN "psychologist_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_psychologist_id_psychologists_userId_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
