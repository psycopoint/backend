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

export const psicoLinkTypeEnum = z.enum(["website", "social", "other"]);
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

export const psicoId = pgTable("psico_id", {
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

  // Links adicionais
  links: jsonb("links")
    .$type<TPsicoIdLinks[] | null>()
    .default(sql`'[]'::jsonb`),

  // Personalização
  themeColor: themeColorEnum("theme_color").default("purple"),
  showContactForm: boolean("show_contact_form").default(false),
  showAvailability: boolean("show_availability").default(false),
  layoutStyle: layoutStyleEnum("layout_style").default("list"), // Padrão de layout (ex: grid, lista, etc.)

  // Data de criação e atualização
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// TYPES
export const insertPsicoIdSchema = createInsertSchema(psicoId);

export type InsertPsicoId = typeof psicoId.$inferInsert;
export type SelectPsicoId = typeof psicoId.$inferSelect;
export type InsertLink = TPsicoIdLinks;
export type SelectLink = Omit<TPsicoIdLinks, "id" | "createdAt" | "updatedAt">;
