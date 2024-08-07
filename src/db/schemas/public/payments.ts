import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { patients } from "./patients";
import { psychologists } from "./psychologists";
import { appointments } from "./appointments";
import { relations, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const paymentStatusEnum = pgEnum("paymentStatusEnum", [
  "paid",
  "pending",
  "overdue",
]);
export const methodsEnum = pgEnum("methodsEnum", ["pix", "credit-card"]);

export const payments = pgTable("payments", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  appointmentId: text("appointment_id")
    .references(() => appointments.id, {
      onDelete: "cascade",
    })
    .notNull(),
  psychologistId: text("psychologist_id")
    .references(() => psychologists.userId, {
      onDelete: "cascade",
    })
    .notNull(),
  patientId: text("patient_id")
    .references(() => patients.id, {
      onDelete: "cascade",
    })
    .notNull(),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentDate: timestamp("payment_date", { mode: "string" }).defaultNow(),
  method: methodsEnum("method").notNull().default("pix"),
  receipts: text("receipts"),
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
});

// RELATIONS
export const paymentsRelations = relations(payments, ({ one }) => ({
  session: one(appointments, {
    fields: [payments.appointmentId],
    references: [appointments.id],
  }),
  psychologist: one(psychologists, {
    fields: [payments.psychologistId],
    references: [psychologists.userId],
  }),
  patient: one(patients, {
    fields: [payments.patientId],
    references: [patients.id],
  }),
}));

export type InsertPayment = typeof payments.$inferInsert;
export type SelectPayment = typeof payments.$inferSelect;
