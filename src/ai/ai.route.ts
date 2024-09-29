import { Hono } from "hono";
import { Bindings, Variables } from "../../types/bindings";
import OpenAI from "openai";
import { createAi } from "@lib/openai";
import { patientInfo } from "./data";

import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { zValidator } from "@hono/zod-validator";
import { AIMessageSchema, responseFormat } from "@type/assistant";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getPatientService } from "@src/patients/patients.services";
import {
  getEventsByPatientIdService,
  getEventsService,
} from "@src/events/events.services";

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

class Message {
  constructor(
    public id: string,
    public role: "assistant" | "user" | "system",
    public content: string,
    public createdAt: Date
  ) {}
}

app.post("/cf", async (c) => {
  const values = await c.req.json();

  // CLOUDFLARE AI
  // const res = await c.env.AI.run("@cf/meta-llama/llama-2-7b-chat-hf-lora", {
  //   prompt: prompt,
  // });

  // Retornando o texto como uma resposta para uso
  try {
    return c.json({ data: JSON.stringify("teste") });
  } catch (error) {
    console.error("Erro ao retornar JSON:", error);
    return c.json({ error: "Invalid response from OpenAI" });
  }
});

app.post(
  "/gpt",
  zValidator(
    "json",
    z.object({
      messages: z.array(AIMessageSchema),
      patientId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { messages, patientId } = c.req.valid("json");
    const openai = createAi(c);

    // get patient
    const patient = await getPatientService(c, db, patientId);
    const events = await getEventsByPatientIdService(c, db, patientId);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a daily assistant to a psychologist. Your role is to help the psychologist respond to questions about specific patients and provide relevant general information. It is essential that your responses are accurate and contextualized. Always frame your responses as 'assistant,' maintaining a friendly and warm tone. Focus on being approachable and engaging, ensuring your answers are helpful, empathetic, and concise. Importantly, do not include concluding phrases that offer further assistance, such as 'If you need more information, I'm here to help.' Additionally, all responses should be returned in a JSON format that includes a 'formattedContent' field, allowing for HTML formatting options, and the entire response should still be in Portuguese (Brazil).",
        },
        {
          role: "user",
          content: `Please analyze the following patient data to answer the upcoming questions: 
          Patient Data: ${JSON.stringify(patient)} 
          Registered Events: ${JSON.stringify(events)}`,
        },
        ...messages,
      ],
      stream: true,
      temperature: 1,
      response_format: zodResponseFormat(responseFormat, "event"),
    });

    let responseText = "";
    for await (const chunk of stream) {
      if (chunk.choices) {
        responseText += chunk.choices[0].delta.content || "";
      }
    }

    // Retornando o texto como uma resposta para uso
    try {
      return c.json({ data: JSON.parse(responseText) });
    } catch (error) {
      console.error("Erro ao retornar JSON:", error);
      return c.json({ error: "Invalid response from OpenAI" });
    }
  }
);

export default app;
