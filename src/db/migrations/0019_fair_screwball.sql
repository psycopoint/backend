ALTER TABLE "auth"."sessions" RENAME COLUMN "sessionToken" TO "id";--> statement-breakpoint
ALTER TABLE "auth"."sessions" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "auth"."sessions" RENAME COLUMN "expires" TO "expires_at";--> statement-breakpoint
ALTER TABLE "auth"."sessions" DROP CONSTRAINT "sessions_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "auth"."sessions" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
