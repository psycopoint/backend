ALTER TABLE "auth"."refresh_token" RENAME TO "refresh_tokens";--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" DROP CONSTRAINT "refresh_token_userId_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
