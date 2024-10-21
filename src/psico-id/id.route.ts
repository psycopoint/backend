import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  return c.json({ response: "teste" });
});

export default app;
