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
import { SelectReceipt } from "@/types/transactions";
import { users } from "../auth/users";
import { z } from "zod";

// Enums para status de pagamento e métodos de pagamento
export const paymentStatusEnum = pgEnum("paymentStatusEnum", [
  "paid",
  "pending",
  "overdue",
]);
export const methodsEnum = pgEnum("methodsEnum", [
  "pix",
  "credit_card",
  "bank_transfer",
  "cash",
  "other",
]);

export const transactionTypeEnum = pgEnum("transactionTypeEnum", [
  "payment",
  "expense",
]);

export const transactions = pgTable("transactions", {
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

  transactionType: transactionTypeEnum("transaction_type").notNull(),

  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentDate: timestamp("transaction_date", {
    mode: "string",
    precision: 3,
  }).defaultNow(),
  method: methodsEnum("method").notNull().default("pix"),
  receipts: jsonb("receipts")
    .$type<SelectReceipt[]>()
    .default(sql`'[]'::jsonb`), // Armazenando como JSONB para suportar múltiplos recibos
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
export const transactionsRelations = relations(transactions, ({ one }) => ({
  session: one(events, {
    fields: [transactions.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  patient: one(patients, {
    fields: [transactions.patientId],
    references: [patients.id],
  }),
}));

// Schema para validação de inserções
export const insertTransactionSchema = createInsertSchema(transactions, {
  amount: z.union([z.number(), z.string()]),
});

export type InsertTransaction = typeof transactions.$inferInsert;
export type SelectTransaction = typeof transactions.$inferSelect;
