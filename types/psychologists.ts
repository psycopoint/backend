import { z } from "zod";

// PREFERENCES
export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  notificationSettings: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
    })
    .optional(),
  language: z.string().optional(),
  appointmentReminders: z
    .object({
      enabled: z.boolean().optional(),
      reminderTime: z.string().optional(),
    })
    .optional(),
  privacySettings: z
    .object({
      shareNotesWithPatients: z.boolean().optional(),
      shareNotesWithColleagues: z.boolean().optional(),
    })
    .optional(),
  layoutSettings: z
    .object({
      sidebarCollapsed: z.boolean().optional(),
      defaultView: z.enum(["calendar", "list"]).optional(),
    })
    .optional(),

  calendar: z.object({
    endHour: z.number().default(23),
    slotStep: z.number().default(60),
    workView: z.boolean().default(true),
    startHour: z.number().default(8),
    slotDuration: z.number().default(1),
  }),
});

// ADICIONAL PHONES
export const additionalPhonesSchema = z
  .array(
    z
      .array(
        z
          .string()
          .min(1)
          .regex(/^\+?[1-9]\d{1,14}$/)
      )
      .optional()
  )
  .optional();

// ADICIONAL EMAILS
export const additionalEmailsSchema = z.array(z.string().email()).optional();

export type UserPreferences = z.infer<typeof preferencesSchema>;
export type AdditionalPhones = z.infer<typeof additionalPhonesSchema>;
export type AdditionalEmails = z.infer<typeof additionalEmailsSchema>;
