import {
  pgTable,
  text,
  varchar,
  timestamp,
  date,
  jsonb,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { clinics, users } from "@/db/schemas";
import { createId } from "@paralleldrive/cuid2";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const psychologists = pgTable("psychologists", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull()
    .unique(),
  additionalEmails: jsonb("adidional_emails").default("{}"),
  website: text("website"),
  socialLinks: jsonb("social_links").default("{}"),
  gender: genderEnum("gender"),
  birthdate: date("birthdate", { mode: "string" }),
  phone: varchar("phone", { length: 256 }),
  additionalPhones: jsonb("additional_phones").default("{}"),
  addressInfo: jsonb("address_info").default([]),
  crp: varchar("crp", { length: 256 }),
  cpf: varchar("cpf", { length: 256 }),
  specialty: text("specialty"),
  preferences: jsonb("preferences").default("{}"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
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

export type InsertPsychologist = typeof psychologists.$inferInsert & {
  // preferences: Preferences | null;
  // addressInfo: Address | null;
};

export type SelectPsychologist = typeof psychologists.$inferSelect & {
  // preferences: Preferences | null;
  // addressInfo: Address | null;
};
