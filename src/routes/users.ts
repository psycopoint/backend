import { getUser } from "@/controllers/userControllers";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  return c.json("test");
});
app.get("/:id", ...getUser);

export default app;
