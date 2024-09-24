import {
  pgTable,
  text,
  varchar,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

import { createInsertSchema } from "drizzle-zod";
import { relations, sql } from "drizzle-orm";
import { clinics, users } from "..";
import {
  AdditionalEmails,
  AdditionalPhones,
  UserPreferences,
} from "../../../types/psychologists";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const psychologists = pgTable("psychologists", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull()
    .unique(),
  additionalEmails: jsonb("adidional_emails")
    .$type<AdditionalEmails[] | undefined>()
    .default(sql`'[]'::jsonb`),
  additionalPhones: jsonb("additional_phones")
    .$type<AdditionalPhones[] | undefined>()
    .default(sql`'[]'::jsonb`),
  website: text("website"),
  socialLinks: jsonb("social_links").default("[]"),
  gender: genderEnum("gender"),
  birthdate: date("birthdate", { mode: "string" }),
  phone: varchar("phone", { length: 256 }),
  addressInfo: jsonb("address_info").default([]),
  crp: varchar("crp", { length: 256 }),
  cpf: varchar("cpf", { length: 256 }),
  specialty: text("specialty"),
  preferences: jsonb("preferences")
    .$type<UserPreferences>()
    .default(sql`'[]'::jsonb`),

  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
  clinicId: text("clinic_id").references(() => clinics.userId, {
    onDelete: "cascade",
  }),
});

// RELATIONS
export const psychologistsRelations = relations(
  psychologists,
  ({ one, many }) => ({
    user: one(users, {
      fields: [psychologists.userId],
      references: [users.id],
    }),

    clinic: one(clinics, {
      fields: [psychologists.clinicId],
      references: [clinics.userId],
    }),
  })
);

export const insertPsychologistsSchema = createInsertSchema(psychologists);

export type InsertPsychologist = typeof psychologists.$inferInsert;

export type SelectPsychologist = typeof psychologists.$inferSelect;
