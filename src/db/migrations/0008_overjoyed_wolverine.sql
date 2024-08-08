ALTER TABLE "anamnesis" RENAME TO "patients_anamnesis";--> statement-breakpoint
ALTER TABLE "appointments" RENAME TO "patients_appointments";--> statement-breakpoint
ALTER TABLE "diagrams" RENAME TO "patients_diagrams";--> statement-breakpoint
ALTER TABLE "patients_anamnesis" DROP CONSTRAINT "anamnesis_patient_id_unique";--> statement-breakpoint
ALTER TABLE "patients_anamnesis" DROP CONSTRAINT "anamnesis_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "patients_anamnesis" DROP CONSTRAINT "anamnesis_psychologist_id_psychologists_userId_fk";
--> statement-breakpoint
ALTER TABLE "patients_appointments" DROP CONSTRAINT "appointments_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "patients_appointments" DROP CONSTRAINT "appointments_psychologist_id_psychologists_userId_fk";
--> statement-breakpoint
ALTER TABLE "patients_diagrams" DROP CONSTRAINT "diagrams_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_appointment_id_appointments_id_fk";
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
 ALTER TABLE "patients_appointments" ADD CONSTRAINT "patients_appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patients_appointments" ADD CONSTRAINT "patients_appointments_psychologist_id_psychologists_userId_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("userId") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_patients_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."patients_appointments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "patients_anamnesis" ADD CONSTRAINT "patients_anamnesis_patient_id_unique" UNIQUE("patient_id");