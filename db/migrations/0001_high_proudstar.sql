DO $$ BEGIN
 CREATE TYPE "public"."layout_style" AS ENUM('grid', 'list', 'carousel');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."theme_color_enum" AS ENUM('blue', 'red', 'green', 'purple', 'orange', 'pink', 'gray', 'black', 'white');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psico_id" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"bio" text,
	"website" varchar(255),
	"links" jsonb DEFAULT '[]'::jsonb,
	"theme_color" "theme_color_enum" DEFAULT 'purple',
	"show_contact_form" boolean DEFAULT false,
	"show_availability" boolean DEFAULT false,
	"layout_style" "layout_style" DEFAULT 'list',
	"social_media_links" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psico_id" ADD CONSTRAINT "psico_id_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
