CREATE SCHEMA "auth";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_type" AS ENUM('psychologist', 'clinic', 'admin');
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
CREATE TABLE IF NOT EXISTS "auth"."account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"password" text,
	"image" text,
	"user_type" "user_type" DEFAULT 'psychologist'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anamnesis" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"psychologist_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
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
	CONSTRAINT "anamnesis_patient_id_unique" UNIQUE("patient_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"patient_id" text,
	"psychologist_id" text,
	"title" text,
	"start" timestamp,
	"end" timestamp,
	"disabled" boolean DEFAULT false,
	"color" text,
	"text_color" text,
	"editable" boolean DEFAULT false,
	"deletable" boolean DEFAULT false,
	"draggable" boolean DEFAULT false,
	"all_day" boolean DEFAULT false,
	"agenda_avatar" jsonb,
	"sx" jsonb,
	"appointment_mood" integer,
	"appointment_details" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_completed" boolean DEFAULT false,
	"patient_mood" integer,
	"patient_notes" text,
	"psychologist_notes" text,
	"appointment_focus" text,
	"appointment_outcome" text,
	"next_steps" text,
	"follow_up_date" timestamp,
	"patient_concerns" text,
	"appointment_feedback" text,
	"appointment_duration" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clinics" (
	"id" text NOT NULL,
	"userId" text PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"phone" text,
	"website" text,
	"cnpj" text,
	"description" text,
	"logo" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"hours_of_operation" json,
	"address_info" jsonb DEFAULT '[]'::jsonb,
	CONSTRAINT "clinics_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diagrams" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
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
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
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
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psychologists" (
	"id" text NOT NULL,
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
	"avatar" text,
	"specialty" text,
	"preferences" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
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
	"variant_name" text,
	"trial_ends_at" text,
	"visa" text,
	"billing_anchor" integer,
	"card_last_four" text,
	CONSTRAINT "subscriptions_subscription_id_unique" UNIQUE("subscription_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."account" ADD CONSTRAINT "account_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."authenticator" ADD CONSTRAINT "authenticator_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."session" ADD CONSTRAINT "session_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anamnesis" ADD CONSTRAINT "anamnesis_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anamnesis" ADD CONSTRAINT "anamnesis_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
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
