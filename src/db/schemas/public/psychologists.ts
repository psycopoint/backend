import {
  pgTable,
  text,
  varchar,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "../users";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const psychologists = pgTable("psychologists", {
  userId: text("userId")
    .primaryKey()
    .notNull()
    .unique()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  additionalEmails: jsonb("adidional_emails").default("{}"),
  password: text("password"),
  website: text("website"),
  socialLinks: jsonb("social_links").default("{}"),
  gender: genderEnum("gender"),
  birthdate: date("birthdate", { mode: "string" }),
  phone: varchar("phone", { length: 256 }),
  additionalPhones: jsonb("additional_phones").default("{}"),
  addressInfo: jsonb("address_info").default([]),
  crp: varchar("crp", { length: 256 }),
  cpf: varchar("cpf", { length: 256 }),
  avatar: text("avatar"),
  specialty: text("specialty"),
  preferences: jsonb("preferences").default("{}"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  // clinicId: text("clinic_id").references(() => clinics.id, {
  //   onDelete: "cascade",
  // }),
});

// RELATIONS
export const psychologistsRelations = relations(
  psychologists,
  ({ one, many }) => ({
    user: one(users, {
      fields: [psychologists.userId],
      references: [users.id],
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
