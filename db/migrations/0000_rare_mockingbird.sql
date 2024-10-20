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
 CREATE TYPE "public"."event_status_enum" AS ENUM('attended', 'absent', 'scheduled', 'not-scheduled', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type" AS ENUM('diagram', 'receipt', 'document', 'certificate', 'declaration', 'fowarding', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."recurring" AS ENUM('daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'once');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');
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
 CREATE TYPE "public"."methodsEnum" AS ENUM('pix', 'credit_card', 'bank_transfer', 'cash', 'other');
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
 CREATE TYPE "public"."transactionTypeEnum" AS ENUM('payment', 'expense');
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
DO $$ BEGIN
 CREATE TYPE "public"."file_type" AS ENUM('pdf', 'docx', 'image');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"password" text,
	"image" text,
	"user_type" "auth"."user_type" DEFAULT 'psychologist',
	"provider" "auth"."providers",
	"provider_id" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" bigint NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
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
	"type" "type" NOT NULL,
	"color" text,
	"editable" boolean DEFAULT false,
	"deletable" boolean DEFAULT false,
	"all_day" boolean DEFAULT false,
	"recurring" "recurring" DEFAULT 'once',
	"recurring_end" timestamp,
	"resource" jsonb,
	"link" text,
	"original_event_id" text,
	"status" "event_status_enum" DEFAULT 'scheduled',
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3),
	"data" jsonb DEFAULT '{}'::jsonb,
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
	"psychologist_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"title" text,
	"data" jsonb DEFAULT '{}'::jsonb,
	"status" "status" DEFAULT 'active',
	"priority" "priority" DEFAULT 'medium',
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"archived" boolean DEFAULT false,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3)
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
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text,
	"user_id" text,
	"transaction_type" "transactionTypeEnum" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "paymentStatusEnum" DEFAULT 'pending' NOT NULL,
	"transaction_date" timestamp(3) DEFAULT now(),
	"method" "methodsEnum" DEFAULT 'pix' NOT NULL,
	"receipts" jsonb DEFAULT '[]'::jsonb,
	"data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psychologists" (
	"userId" text PRIMARY KEY NOT NULL,
	"adidional_emails" jsonb DEFAULT '[]'::jsonb,
	"additional_phones" jsonb DEFAULT '[]'::jsonb,
	"website" text,
	"social_links" jsonb DEFAULT '[]',
	"gender" "gender",
	"birthdate" date,
	"phone" varchar(256),
	"address_info" jsonb DEFAULT '[]'::jsonb,
	"crp" varchar(256),
	"cpf" varchar(256),
	"signature" text,
	"specialty" text,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3),
	"clinic_id" text,
	CONSTRAINT "psychologists_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"customer_id" text,
	"pricing" text,
	"quantity" integer DEFAULT 1,
	"subscribed_at" text,
	"status" text NOT NULL,
	"subscription_id" text NOT NULL,
	"renews_at" text,
	"cancel_at" text,
	"canceled_at" text,
	"ended_at" text,
	"product_name" text,
	"metadata" jsonb DEFAULT '{}',
	"trial_ends_at" text,
	"visa" text,
	"card_last_four" text,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "subscriptions_subscription_id_unique" UNIQUE("subscription_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"psychologist_id" text NOT NULL,
	"patient_id" text,
	"title" text NOT NULL,
	"description" text,
	"document_type" "type",
	"file_type" "file_type" DEFAULT 'pdf',
	"data" jsonb NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "notes" ADD CONSTRAINT "notes_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
