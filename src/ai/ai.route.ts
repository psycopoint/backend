import { Hono } from "hono";
import { Bindings, Variables } from "../../types/bindings";
import { createAi } from "@lib/openai";

import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { zValidator } from "@hono/zod-validator";
import { AIMessageSchema, responseFormat } from "@type/assistant";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getPatientService } from "@src/patients/patients.services";
import { getEventsByPatientIdService } from "@src/events/events.services";

import { getPatientAnamnesisService } from "@src/anamnesis/anamnese.services";
import { getPatientDiagramService } from "@src/diagrams/diagrams.services";
import { askAi } from "./ai.controllers";

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

// CLOUDFLARE
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

// GPT
app.post("/gpt", ...askAi);

export default app;
