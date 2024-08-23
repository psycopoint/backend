import { z } from "zod";

// PatientSession Schema
export const PatientSessionSchema = z.object({
  patientId: z.string(),
  sessionMood: z.number(),
  sessionDetails: z.string(),
  patientMood: z.number().optional(),
  patientNotes: z.string().optional(),
  psychologistNotes: z.string().optional(),
  sessionFocus: z.string().optional(),
  sessionOutcome: z.string().optional(),
  nextSteps: z.string().optional(),
  followUpDate: z.string().optional(),
  patientConcerns: z.string().optional(),
  sessionFeedback: z.string().optional(),
  sessionDuration: z.number().optional(),
});

// SocialPost Schema
export const SocialPostSchema = z.object({
  platform: z.enum(["twitter", "facebook", "instagram"]),
  content: z.string(),
  contentUrl: z.string().optional(),
  status: z.enum(["draft", "published"]),
  analytics: z.record(z.number()).optional(), // Para incluir likes, shares, etc.
});

// AdministrativeTask Schema
export const AdministrativeTaskSchema = z.object({
  taskType: z.string(),
  content: z.string(),
});

// EventData Schema (Union of the above)
export const EventDataSchema = z.union([
  PatientSessionSchema,
  SocialPostSchema,
  AdministrativeTaskSchema,
]);

// Tipos TypeScript gerados a partir dos schemas
export type PatientSession = z.infer<typeof PatientSessionSchema>;
export type SocialPost = z.infer<typeof SocialPostSchema>;
export type AdministrativeTask = z.infer<typeof AdministrativeTaskSchema>;
export type EventData = z.infer<typeof EventDataSchema>;
