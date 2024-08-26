import {
  pgTable,
  text,
  timestamp,
  numeric,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { patients } from "./patients";
import { psychologists } from "./psychologists";
import { events } from "./events";
import { relations, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { createInsertSchema } from "drizzle-zod";
import { SelectReceipt } from "@/types/payments";
import { users } from "../auth/users";

// Enums para status de pagamento e métodos de pagamento
export const paymentStatusEnum = pgEnum("paymentStatusEnum", [
  "paid",
  "pending",
  "overdue",
]);
export const methodsEnum = pgEnum("methodsEnum", ["pix", "credit_card"]);

export const payments = pgTable("payments", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  eventId: text("event_id").references(() => events.id, {
    onDelete: "cascade",
  }),

  userId: text("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),

  patientId: text("patient_id").references(() => patients.id, {
    onDelete: "cascade",
  }),

  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentDate: timestamp("payment_date", {
    mode: "string",
    precision: 3,
  }).defaultNow(),
  method: methodsEnum("method").notNull().default("pix"),
  receipts: jsonb("receipts")
    .$type<SelectReceipt[]>()
    .default(sql`'{}'::jsonb`), // Armazenando como JSONB para suportar múltiplos recibos
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

// RELAÇÕES
export const paymentsRelations = relations(payments, ({ one }) => ({
  session: one(events, {
    fields: [payments.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  patient: one(patients, {
    fields: [payments.patientId],
    references: [patients.id],
  }),
}));

// Schema para validação de inserções
export const insertPaymentSchema = createInsertSchema(payments);

export type InsertPayment = typeof payments.$inferInsert;
export type SelectPayment = typeof payments.$inferSelect;
