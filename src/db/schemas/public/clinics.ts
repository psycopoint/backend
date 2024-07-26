import { relations } from "drizzle-orm";
import {
  json,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";
import { users } from "@db/schemas";
import { createId } from "@paralleldrive/cuid2";

export const clinics = pgTable("clinics", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull()
    .unique(),
  companyName: text("company_name").notNull(),
  phone: text("phone"),
  website: text("website"),
  cnpj: text("cnpj"),
  description: text("description"),
  logo: text("logo"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  hoursOfOperation: json("hours_of_operation"),
  addressInfo: jsonb("address_info").default([]),
});

// RELATIONS
export const clinicsRelations = relations(clinics, ({ one, many }) => ({
  psychologists: many(psychologists),
}));

export type InsertClinic = typeof clinics.$inferInsert;
export type SelectClinic = typeof clinics.$inferSelect;
