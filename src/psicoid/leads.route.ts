import { Hono } from "hono";
import {
  createLead,
  createLink,
  deleteLead,
  deleteLink,
  updateClickCount,
  updateLead,
  updateLink,
} from "./id.controllers";

const app = new Hono();

// LEADS
app.post("/:userTag", ...createLead);
app.delete("/:leadId", ...deleteLead);
app.patch("/:leadId", ...updateLead);

export default app;
