CREATE SCHEMA "auth";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "auth"."providers" AS ENUM('google', 'linkedin', 'apple', 'credentials');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "auth"."user_type" AS ENUM('psychologist', 'clinic', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."event_type" AS ENUM('social_post', 'patient_session', 'administrative_task', 'unavailability', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('active', 'inactive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."methodsEnum" AS ENUM('pix', 'credit-card');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."paymentStatusEnum" AS ENUM('paid', 'pending', 'overdue');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"password" text,
	"image" text,
	"user_type" "auth"."user_type" DEFAULT 'psychologist',
	"provider" "auth"."providers",
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" text PRIMARY KEY NOT NULL,
	"psychologist_id" text,
	"clinic_id" text,
	"title" text NOT NULL,
	"start" timestamp(3),
	"end" timestamp(3),
	"disabled" boolean DEFAULT false,
	"event_type" "event_type" NOT NULL,
	"color" text,
	"editable" boolean DEFAULT false,
	"deletable" boolean DEFAULT false,
	"all_day" boolean DEFAULT false,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3),
	"event_content" jsonb DEFAULT '[]'::jsonb,
	CONSTRAINT "events_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patients_anamnesis" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"psychologist_id" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	"consent" boolean DEFAULT false,
	"eeh" integer,
	"ham_a" integer,
	"bdi" integer,
	"chief_complaint" text,
	"history_of_present_illness" text,
	"past_psychiatric_history" text,
	"medical_history" text,
	"family_history" text,
	"social_history" text,
	"substance_use" text,
	"medications" text,
	"allergies" text,
	"mental_status_exam" text,
	"diagnosis" text,
	"risk_assessment" text,
	"lifeInfos" text,
	CONSTRAINT "patients_anamnesis_patient_id_unique" UNIQUE("patient_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clinics" (
	"userId" text PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"phone" text,
	"website" text,
	"cnpj" text,
	"description" text,
	"logo" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3),
	"hours_of_operation" json,
	"address_info" jsonb DEFAULT '[]'::jsonb,
	CONSTRAINT "clinics_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patients_diagrams" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3),
	"relevant_history" text,
	"central_beliefs" text,
	"rule_beliefs" text,
	"belief_maintenance" text,
	"situations" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"content" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3),
	"status" "status" DEFAULT 'active',
	"patient_id" text,
	"psychologists_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text,
	"phone" text,
	"birthdate" text,
	"avatar" text,
	"cpf" text,
	"gender" "gender",
	"is_active" boolean,
	"address_info" jsonb DEFAULT '{}',
	"emergency_contacts" jsonb DEFAULT '[]',
	"preferences" jsonb DEFAULT '{}',
	"psychologist_id" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"appointment_id" text NOT NULL,
	"psychologist_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "paymentStatusEnum" DEFAULT 'pending' NOT NULL,
	"payment_date" timestamp DEFAULT now(),
	"method" "methodsEnum" DEFAULT 'pix' NOT NULL,
	"receipts" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psychologists" (
	"userId" text PRIMARY KEY NOT NULL,
	"adidional_emails" jsonb DEFAULT '{}',
	"website" text,
	"social_links" jsonb DEFAULT '{}',
	"gender" "gender",
	"birthdate" date,
	"phone" varchar(256),
	"additional_phones" jsonb DEFAULT '{}',
	"address_info" jsonb DEFAULT '[]'::jsonb,
	"crp" varchar(256),
	"cpf" varchar(256),
	"specialty" text,
	"preferences" jsonb DEFAULT '{}',
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3),
	"clinic_id" text,
	CONSTRAINT "psychologists_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"status" text NOT NULL,
	"status_formatted" text NOT NULL,
	"subscription_id" text NOT NULL,
	"renews_at" text,
	"ends_at" text,
	"product_name" text,
	"variant_name" text,
	"trial_ends_at" text,
	"visa" text,
	"billing_anchor" integer,
	"card_last_four" text,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "subscriptions_subscription_id_unique" UNIQUE("subscription_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_clinic_id_clinics_userId_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patients_anamnesis" ADD CONSTRAINT "patients_anamnesis_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patients_anamnesis" ADD CONSTRAINT "patients_anamnesis_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinics" ADD CONSTRAINT "clinics_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patients_diagrams" ADD CONSTRAINT "patients_diagrams_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_psychologists_id_psychologists_userId_fk" FOREIGN KEY ("psychologists_id") REFERENCES "public"."psychologists"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patients" ADD CONSTRAINT "patients_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_events_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psychologists" ADD CONSTRAINT "psychologists_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "psychologists" ADD CONSTRAINT "psychologists_clinic_id_clinics_userId_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_psychologists_userId_fk" FOREIGN KEY ("user_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
