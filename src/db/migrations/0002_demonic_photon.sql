ALTER TABLE "payments" RENAME COLUMN "appointment_id" TO "event_id";--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_appointment_id_events_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
