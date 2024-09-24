import { Hono } from "hono";
import { Bindings, Variables } from "../../types/bindings";
import OpenAI from "openai";
import { createAi } from "@lib/gpt";

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

app.post("/teste", async (c) => {
  const { prompt } = await c.req.json();
  console.log(prompt);

  // const openai = createAi(c);

  // CHAT GPT
  // const stream = await openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: [{ role: "user", content: prompt }],
  //   stream: true,
  //   temperature: 1,
  //   response_format: {
  //     type: "text",
  //   },
  // });

  // let responseText = "";
  // for await (const chunk of stream) {
  //   if (chunk.choices) {
  //     responseText += chunk.choices[0].delta.content || "";
  //   }
  // }

  // CLOUDFLARE AI
  const res = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    prompt: prompt,
  });

  // Retornando o texto como uma resposta para uso
  return c.json({ res });
});

export default app;
