import {
  pgTable,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";
import { clinics } from "./clinics";
import { EventContent } from "@/types/events";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Enum para o tipo de evento
export const eventTypeEnum = pgEnum("event_type", [
  "social_post",
  "patient_session",
  "administrative_task",
  "unavailability",
  "other",
]);

export const events = pgTable("events", {
  id: text("id").primaryKey().notNull().unique(),
  psychologistId: text("psychologist_id").references(
    () => psychologists.userId,
    {
      onDelete: "cascade",
    }
  ),
  clinic: text("clinic_id").references(() => clinics.userId, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  start: timestamp("start", { mode: "string", precision: 3 }),
  end: timestamp("end", { mode: "string", precision: 3 }),
  disabled: boolean("disabled").default(false),
  type: eventTypeEnum("event_type").notNull(),
  color: text("color"),
  editable: boolean("editable").default(false),
  deletable: boolean("deletable").default(false),
  allDay: boolean("all_day").default(false),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
  // Coluna JSONB que armazena o conteúdo do evento
  eventContent: jsonb("event_content")
    .$type<EventContent>()
    .default(sql`'{}'::jsonb`),
});

// relations
export const eventsRelations = relations(events, ({ one }) => ({
  psychologist: one(psychologists, {
    fields: [events.psychologistId],
    references: [psychologists.userId],
  }),

  clinic: one(clinics, {
    fields: [events.psychologistId],
    references: [clinics.userId],
  }),
}));

// TYPES
export const insertEventSchema = createInsertSchema(events);

export type InsertEvent = typeof events.$inferInsert;
export type SelectEvent = typeof events.$inferSelect;
