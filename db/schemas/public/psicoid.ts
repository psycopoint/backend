import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  varchar,
  json,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "../auth/users";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const psicoLinkTypeEnum = z.enum(["website", "social", "cta", "other"]);
export type PsicoIdLinkType = z.infer<typeof psicoLinkTypeEnum>;

export const psicoIdLinkSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(), // Validação de URL
  icon: z.string().optional(),
  type: psicoLinkTypeEnum.default("website"),
  description: z.string().optional(),
  order: z.number(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  isActive: z.boolean(),
  clickCount: z.number().optional(),
  target: z.enum(["_blank", "_self", "_parent", "_top"]).optional(),
});

export type TPsicoIdLinks = z.infer<typeof psicoIdLinkSchema>;

export const psicoIdLeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  message: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["new", "contacted", "converted", "closed"]).default("new"),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
  internalNotes: z.string().optional(),
  referralId: z.string().optional(),
  interestArea: z.string().optional(),
});

export const themeColorEnum = pgEnum("theme_color_enum", [
  "blue",
  "red",
  "green",
  "purple",
  "orange",
  "pink",
  "gray",
  "black",
  "white",
]);

export const layoutStyleEnum = pgEnum("layout_style", [
  "grid",
  "list",
  "carousel",
]);

export const psicoId = pgTable("psicoid", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  enabled: boolean("enabled").default(true),

  // Informações básicas
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  userTag: text("user_tag").unique(),

  // additio adicionais
  links: jsonb("links")
    .$type<TPsicoIdLinks[] | null>()
    .default(sql`'[]'::jsonb`),
  ctaButton: boolean("cta_button").default(true),

  // Links adicionais
  leads: jsonb("leads")
    .$type<SelectPsicoIdLead[] | null>()
    .default(sql`'[]'::jsonb`),

  // Personalização
  themeColor: themeColorEnum("theme_color").default("purple"),
  showContactForm: boolean("show_contact_form").default(false),
  showAvailability: boolean("show_availability").default(false),
  layoutStyle: layoutStyleEnum("layout_style").default("list"), // Padrão de layout (ex: grid, lista, etc.)

  // Data de criação e atualização
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
});

// TYPES
export const insertPsicoIdSchema = createInsertSchema(psicoId);

export type InsertPsicoId = typeof psicoId.$inferInsert;
export type SelectPsicoId = typeof psicoId.$inferSelect;
export type InsertLink = TPsicoIdLinks;
export type SelectLink = Omit<TPsicoIdLinks, "id" | "createdAt" | "updatedAt">;
export type InsertPsicoIdLead = z.infer<typeof psicoIdLeadSchema>;
export type SelectPsicoIdLead = Partial<z.infer<typeof psicoIdLeadSchema>>;
