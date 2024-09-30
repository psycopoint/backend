import { zValidator } from "@hono/zod-validator";
import { createAi } from "@lib/openai";
import { neon } from "@neondatabase/serverless";
import { getPatientAnamnesisService } from "@src/anamnesis/anamnese.services";
import { getPatientDiagramService } from "@src/diagrams/diagrams.services";
import { getEventsByPatientIdService } from "@src/events/events.services";
import { getPatientService } from "@src/patients/patients.services";
import { AIMessageSchema, responseFormat } from "@type/assistant";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import { ScheduleAIResponse, tools } from "./tools";
import {
  systemGeneral,
  systemPatient,
  userGeneral,
  userPatient,
} from "./prompts";
import { userPlan } from "@utils/subscription";

const factory = createFactory();

export const askAi = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      messages: z.array(AIMessageSchema),
      patientId: z.string().optional(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { messages, patientId } = c.req.valid("json");
    const openai = createAi(c);

    // verify users plan to prevent inserting
    const userCurrentPlan = await userPlan(c, db);

    if (!userCurrentPlan) {
      return c.json({ error: "AI limit reached" }, 403);
    }

    // get patient
    const patient = await getPatientService(c, db, patientId!);
    const events = await getEventsByPatientIdService(c, db, patientId!);
    const anamnesis = await getPatientAnamnesisService(c, db, patientId!);
    const diagram = await getPatientDiagramService(c, db, patientId!);

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: patientId ? systemPatient : systemGeneral,
        },
        {
          role: "user",
          content: patientId
            ? userPatient({
                anamnesis,
                diagram,
                events,
                patient,
              })
            : userGeneral({}),
        },
        ...messages,
      ],
      // stream: true,
      temperature: 1,
      response_format: zodResponseFormat(responseFormat, "event"),
      tools: tools,
    });

    const message = response.choices[0].message;

    // Retornando o texto como uma resposta para uso
    try {
      return c.json({ data: message.parsed });
    } catch (error) {
      console.error("Erro ao retornar JSON:", error);
      return c.json({ error: "Invalid response from OpenAI" });
    }
  }
);
