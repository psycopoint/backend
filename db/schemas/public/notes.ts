import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";
import { relations, sql } from "drizzle-orm";

export const statusEnum = pgEnum("status", ["active", "inactive"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  psychologistId: text("psychologist_id")
    .notNull()
    .references(() => psychologists.userId),
  title: text("title"),
  data: text("data")
    .$type<any>()
    .default(sql`'{}'::jsonb`),
  status: statusEnum("status").default("active"),
  priority: priorityEnum("priority").default("medium"),
  attachments: text("attachments"),
  archived: boolean("archived").default(false),
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
});

// RELATIONS
export const notesRelations = relations(notes, ({ one, many }) => ({
  psychologist: one(psychologists, {
    fields: [notes.id],
    references: [psychologists.userId],
  }),
}));

export type InsertNotes = typeof notes.$inferInsert;
export type SelectNotes = typeof notes.$inferSelect;
