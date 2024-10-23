import { Hono } from "hono";
import {
  createLink,
  deleteLink,
  updateClickCount,
  updateLink,
} from "./id.controllers";

const app = new Hono();

// LINKS
app.post("/", ...createLink);
app.delete("/:linkId", ...deleteLink);
app.patch("/:linkId", ...updateLink);
app.post("/clicks", ...updateClickCount);

export default app;
