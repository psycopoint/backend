DO $$ BEGIN
 CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psychologists" (
	"userId" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text NOT NULL,
	"adidional_emails" jsonb DEFAULT '{}',
	"password" text,
	"website" text,
	"social_links" jsonb DEFAULT '{}',
	"gender" "gender",
	"birthdate" date,
	"phone" varchar(256),
	"additional_phones" jsonb DEFAULT '{}',
	"address_info" jsonb DEFAULT '[]'::jsonb,
	"crp" varchar(256),
	"cpf" varchar(256),
	"avatar" text,
	"specialty" text,
	"preferences" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "psychologists_userId_unique" UNIQUE("userId"),
	CONSTRAINT "psychologists_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psychologists" ADD CONSTRAINT "psychologists_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
