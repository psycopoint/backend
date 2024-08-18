import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  integer,
  text,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";
import { patients } from "./patients";
import { createInsertSchema } from "drizzle-zod";
import { createId } from "@paralleldrive/cuid2";
import { payments } from "./payments";

export const appointments = pgTable("patients_appointments", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .$defaultFn(() => createId())
    .notNull(),
  patientId: text("patient_id").references(() => patients.id, {
    onDelete: "cascade",
  }),
  psychologistId: text("psychologist_id").references(
    () => psychologists.userId,
    {
      onDelete: "cascade",
    }
  ),
  title: text("title"),
  start: timestamp("start", { mode: "string", precision: 3 }),
  end: timestamp("end", { mode: "string", precision: 3 }),
  disabled: boolean("disabled").default(false),
  color: text("color"), // String ou "palette.path", mantido como text
  textColor: text("text_color"), // String ou "palette.path", mantido como text
  editable: boolean("editable").default(false),
  deletable: boolean("deletable").default(false),
  draggable: boolean("draggable").default(false),
  allDay: boolean("all_day").default(false),
  agendaAvatar: jsonb("agenda_avatar"), // React.ReactElement ou string, utilizando jsonb
  sx: jsonb("sx"), // Mui sx prop, utilizando jsonb
  appointmentMood: integer("appointment_mood"),
  appointmentDetails: text("appointment_details"),
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
  isCompleted: boolean("is_completed").default(false),

  // additional fields about the appointments
  patientMood: integer("patient_mood"), // Humor do paciente durante a sessão (1-10)
  patientNotes: text("patient_notes"), // Anotações sobre o paciente
  psychologistNotes: text("psychologist_notes"), // Anotações do psicólogo sobre a sessão
  appointmentFocus: text("appointment_focus"), // Foco principal da sessão
  appointmentOutcome: text("appointment_outcome"), // Resultado esperado ou alcançado na sessão
  nextSteps: text("next_steps"), // Próximos passos recomendados para o paciente
  // attachments: jsonb("attachments"), // Anexos relacionados à sessão (documentos, imagens, etc.)
  followUpDate: timestamp("follow_up_date", { mode: "string" }), // Data para acompanhamento futuro
  patientConcerns: text("patient_concerns"), // Preocupações levantadas pelo paciente durante a sessão
  appointmentFeedback: text("appointment_feedback"), // Feedback do paciente sobre a sessão
  appointmentDuration: integer("appointment_duration"), // Duração da sessão em minutos
});

export const insertappointmentSchema = createInsertSchema(appointments);

// RELATIONS
export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  psychologist: one(psychologists, {
    fields: [appointments.psychologistId],
    references: [psychologists.userId],
  }),
  payment: one(payments, {
    fields: [appointments.id],
    references: [payments.appointmentId],
  }),
}));

export type InsertAppointment = typeof appointments.$inferInsert;
export type SelectAppointment = typeof appointments.$inferSelect;
