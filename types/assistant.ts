import { z } from "zod";

export const AIMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["assistant", "user", "system"]),
  content: z.string(),
  createdAt: z.string(),
});

export const responseFormat = z.object({
  content: z.string(),
  role: z.string(),
});

export type SelectAIMessage = z.infer<typeof AIMessageSchema>;
