import { Hono } from "hono";
import { Bindings, Variables } from "../../types/bindings";
import OpenAI from "openai";
import { createAi } from "@lib/openai";
import { patientInfo } from "./data";

import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

const TreatmentPlanSchema = z.object({
  identificacao_do_paciente: z.object({
    nome: z.string(),
    idade: z.number(),
    data_de_nascimento: z.string(), // poderia ser um Date, mas está como string para simplificação
    data_da_avaliacao: z.string(),
    diagnostico: z.string(),
    historico_medico_relevante: z.string(),
  }),
  objetivos_do_tratamento: z.object({
    objetivos_gerais: z.string(),
    objetivos_especificos: z.array(z.string()),
  }),
  intervencoes_e_estrategias: z.object({
    terapia: z.array(z.string()), // tipos de terapia
    medicacao: z
      .object({
        nome: z.string(),
        dosagem: z.string(),
        horario: z.string(),
      })
      .nullable(), // medicação pode ser nula
    tecnicas_complementares: z.array(z.string()),
  }),
  cronograma_de_tratamento: z.object({
    frequencia: z.string(),
    duracao_estimativa: z.string(),
    revisoes_regulares: z.string(),
  }),
  monitoramento_e_avaliacao: z.object({
    metodos: z.array(z.string()),
    criterios: z.array(z.string()),
  }),
  envolvimento_familiar: z.object({
    incluir_familia: z.boolean(),
    recursos_de_apoio: z.array(z.string()),
  }),
  consideracoes_finais: z.array(z.string()),
  consentimento: z.object({
    paciente: z.boolean(),
    profissional: z.boolean(),
  }),
});

app.post("/teste", async (c) => {
  const { prompt } = await c.req.json();

  const openai = createAi(c);

  // CHAT GPT
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You're a psychologist and based on the following patient information, extract key behavioral insights and develop a comprehensive treatment plan for this patient, and you must return it in JSON format and in Portuguese (PT-BR) language.",
      },
      {
        role: "user",
        content: `Provide me a treatment plan for this patient: ${patientInfo}`,
      },
      { role: "user", content: prompt },
    ],
    stream: true,
    temperature: 1,
    response_format: zodResponseFormat(TreatmentPlanSchema, "event"),
  });

  let responseText = "";
  for await (const chunk of stream) {
    if (chunk.choices) {
      responseText += chunk.choices[0].delta.content || "";
    }
  }

  // CLOUDFLARE AI
  // const res = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
  //   prompt: prompt,
  // });

  // Retornando o texto como uma resposta para uso
  return c.json({ data: JSON.parse(responseText) });
});

export default app;
