import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";
import { anamnesis } from "./anamnesis";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { Address, PatientPreferences } from "@/types/patient-types";
import { createId } from "@paralleldrive/cuid2";
import { diagrams } from "./diagrams";
import { appointments } from "./appointments";
import { payments } from "./payments";

const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const patients = pgTable("patients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  birthdate: text("birthdate"),
  avatar: text("avatar"),
  cpf: text("cpf"),
  gender: genderEnum("gender"),
  isActive: boolean("is_active"),
  addressInfo: jsonb("address_info").default("{}"),
  emergencyContacts: jsonb("emergency_contacts").default("[]"),
  preferences: jsonb("preferences").default("{}"),
  psychologistId: text("psychologist_id").references(
    () => psychologists.userId,
    {
      onDelete: "cascade",
    }
  ),
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
});

// RELATIONS
export const patientsRelations = relations(patients, ({ one, many }) => ({
  psychologist: one(psychologists, {
    fields: [patients.id],
    references: [psychologists.userId],
  }),

  anamnesis: one(anamnesis, {
    fields: [patients.id],
    references: [anamnesis.patientId],
  }),

  patientDiagram: one(diagrams, {
    fields: [patients.id],
    references: [diagrams.patientId],
  }),

  sessions: many(appointments),
  payments: many(payments),
}));

export const insertPatientSchema = createInsertSchema(patients);
export const selectPatientSchema = createSelectSchema(patients);

export type InsertPatient = typeof patients.$inferInsert & {
  addressInfo: Address | null;
  preferences: PatientPreferences | null;
};

export type SelectPatient = typeof patients.$inferSelect & {
  addressInfo: Address | null;
  preferences: PatientPreferences | null;
};
