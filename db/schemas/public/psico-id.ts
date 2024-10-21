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

export enum PsicoIdLinkType {
  WEBSITE = "website",
  SOCIAL = "social",
  OTHER = "other",
}

export type TPsicoIdLinks = {
  title: string;
  url: string;
  icon?: string;
  type?: PsicoIdLinkType;
  description?: string;
  order: number;
  createdAt: Date | string;
  isActive: boolean;
  clickCount?: number;
  target?: "_blank" | "_self" | "_parent" | "_top";
};

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
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  // Informações básicas
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  userName: text("username").unique().notNull(),

  // Links adicionais
  links: jsonb("links")
    .$type<TPsicoIdLinks[] | null>()
    .default(sql`'[]'::jsonb`),

  // Personalização
  themeColor: themeColorEnum("theme_color").default("purple"),
  showContactForm: boolean("show_contact_form").default(false),
  showAvailability: boolean("show_availability").default(false),
  layoutStyle: layoutStyleEnum("layout_style").default("list"), // Padrão de layout (ex: grid, lista, etc.)

  // Social media
  socialMedia: jsonb("social_media_links")
    .$type<TPsicoIdLinks[] | null>()
    .default(sql`'[]'::jsonb`), // Armazenar links para redes sociais (ex: [{name: 'LinkedIn', url: 'https://...'}])

  // Data de criação e atualização
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// TYPES
export const insertPsicoIdSchema = createInsertSchema(psicoId);

export type InsertPsicoId = typeof psicoId.$inferInsert;
export type SelectPsicoId = typeof psicoId.$inferSelect;
