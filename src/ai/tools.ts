import { zodFunction } from "openai/helpers/zod.mjs";
import { z } from "zod";

const ScheduleEventParameters = z.object({
  title: z.string().describe("The title of the event."),
  start: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "start must be a valid ISO date string.",
    })
    .describe("The start time of the event in ISO format."),
  end: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "end must be a valid ISO date string.",
    })
    .describe("The end time of the event in ISO format."),
  type: z
    .string()
    .describe(
      "The event type can be 'patient_session', 'social_post' or 'others' "
    ),
  patietnId: z.string().optional().describe("The patientId"),
  content: z
    .string()
    .describe(
      "The success or error response, a message like 'The session was scheduled suyccesfully, time: 00AM till 00AM' date: DD/MM/YYYY"
    ),
});

export const tools = [
  zodFunction({ name: "scheduleEvent", parameters: ScheduleEventParameters }),
];

export type ScheduleAIResponse = z.infer<typeof ScheduleEventParameters>;
