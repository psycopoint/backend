import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  integer,
  text,
  boolean,
  jsonb,
  pgEnum,
  pgSchema,
} from "drizzle-orm/pg-core";
import { psychologists } from "../public/psychologists";
import { patients } from "../public/patients";
import { createInsertSchema } from "drizzle-zod";
import { createId } from "@paralleldrive/cuid2";
import { payments } from "../public/payments";
import { clinics } from "../public/clinics";

export const eventsSchema = pgSchema("events");

export const eventTypeEnum = pgEnum("event_type", [
  "social_media_post",
  "administrative_task",
  "unavailability",
  "webinar_workshop",
  "clinical_supervision",
  "license_renewal",
  "payment_due_date",
  "other",
]);

export const events = eventsSchema.table("events", {
  id: text("id").primaryKey(),
  psychologistId: text("psychologist_id").references(
    () => psychologists.userId,
    {
      onDelete: "cascade",
    }
  ),
  clinic: text("clinic_id").references(() => clinics.userId, {
    onDelete: "cascade",
  }),
  title: text("title"),
  start: timestamp("start", { mode: "string", precision: 3 }),
  end: timestamp("end", { mode: "string", precision: 3 }),
  disabled: boolean("disabled").default(false),
  type: eventTypeEnum("type").default("other"),
  color: text("color"),
  editable: boolean("editable").default(false),
  deletable: boolean("deletable").default(false),

  allDay: boolean("all_day").default(false),
  isCompleted: boolean("is_completed").default(false),

  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
});

export const eventsPatientsSessions = eventsSchema.table(
  "events_patients_sessions",
  {
    eventId: text("event_id")
      .primaryKey()
      .references(() => events.id, { onDelete: "cascade" }),
    patientId: text("patient_id").references(() => patients.id, {
      onDelete: "cascade",
    }),

    sessionMood: integer("session_mood"),
    sessionDetails: text("session_details"),

    // additional fields about the sessions
    patientMood: integer("patient_mood"), // Humor do paciente durante a sessão (1-10)
    patientNotes: text("patient_notes"), // Anotações sobre o paciente
    psychologistNotes: text("psychologist_notes"), // Anotações do psicólogo sobre a sessão
    sessionFocus: text("session_focus"), // Foco principal da sessão
    sessionOutcome: text("session_outcome"), // Resultado esperado ou alcançado na sessão
    nextSteps: text("next_steps"), // Próximos passos recomendados para o paciente
    // attachments: jsonb("attachments"), // Anexos relacionados à sessão (documentos, imagens, etc.)
    followUpDate: timestamp("follow_up_date", { mode: "string" }), // Data para acompanhamento futuro
    patientConcerns: text("patient_concerns"), // Preocupações levantadas pelo paciente durante a sessão
    sessionFeedback: text("session_feedback"), // Feedback do paciente sobre a sessão
    sessionDuration: integer("session_duration"), // Duração da sessão em minutos
  }
);

export const insertPatientSessionSchema = createInsertSchema(
  eventsPatientsSessions
);

// RELATIONS
export const eventsRelations = relations(
  eventsPatientsSessions,
  ({ one, many }) => ({
    patient: one(patients, {
      fields: [eventsPatientsSessions.patientId],
      references: [patients.id],
    }),
    psychologist: one(psychologists, {
      fields: [eventsPatientsSessions.psychologistId],
      references: [psychologists.userId],
    }),
    payment: one(payments, {
      fields: [eventsPatientsSessions.id],
      references: [payments.appointmentId],
    }),
  })
);

export type InsertAppointment = typeof events_appointments.$inferInsert;
export type SelectAppointment = typeof events_appointments.$inferSelect;
