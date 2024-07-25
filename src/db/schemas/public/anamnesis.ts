import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  text,
  unique,
  jsonb,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { patients } from "./patients";
import { psychologists } from "./psychologists";
import { createInsertSchema } from "drizzle-zod";

export const anamnesis = pgTable(
  "anamnesis",
  {
    id: text("id").primaryKey(),
    patientId: text("patient_id")
      .references(() => patients.id, { onDelete: "cascade" })
      .notNull(),
    psychologistId: text("psychologist_id").references(
      () => psychologists.userId,
      {
        onDelete: "cascade",
      }
    ),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    consent: boolean("consent").default(false), // Consentimento do paciente
    // followUpDate: timestamp("follow_up_date", { mode: "string" }), // Data de acompanhamento // TODO: adicionar relacionamento com sessões

    eeh: integer("eeh"),
    hama: integer("ham_a"),
    bdi: integer("bdi"),

    // Informações médicas e históricas
    chiefComplaint: text("chief_complaint"), // Queixa principal
    historyOfPresentIllness: text("history_of_present_illness"), // História da doença atual
    pastPsychiatricHistory: text("past_psychiatric_history"), // Histórico psiquiátrico passado
    medicalHistory: text("medical_history"), // Histórico médico
    familyHistory: text("family_history"), // Histórico familiar
    socialHistory: text("social_history"), // Histórico social
    substanceUse: text("substance_use"), // Uso de substâncias
    medications: text("medications"), // Medicações
    allergies: text("allergies"), // Alergias
    mentalStatusExam: text("mental_status_exam"), // Exame do estado mental
    diagnosis: text("diagnosis"), // Diagnóstico
    // treatmentPlan: jsonb("treatment_plan"), // TODO: create a separete schema for this one
    riskAssessment: text("risk_assessment"), // Avaliação de risco
    lifeInfos: text("lifeInfos"),
  },
  (t) => ({
    uniquePatient: unique().on(t.patientId), // Definindo a restrição de unicidade
  })
);

export const insertAnamnesisSchema = createInsertSchema(anamnesis);

// RELATIONS
export const anamnesisRelations = relations(anamnesis, ({ one, many }) => ({
  patient: one(patients, {
    fields: [anamnesis.patientId],
    references: [patients.id],
  }),
}));

export type InsertAnamnesis = typeof anamnesis.$inferInsert;
export type SelectAnamnesis = typeof anamnesis.$inferSelect;
