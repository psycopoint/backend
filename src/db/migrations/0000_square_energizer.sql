DO $$ BEGIN
 CREATE TYPE "public"."colors" AS ENUM('red', 'green', 'blue');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"color" "colors" DEFAULT 'red'
);
