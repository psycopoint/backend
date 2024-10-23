import { Hono } from "hono";
import {
  createLead,
  createLink,
  createPsicoId,
  deleteLead,
  deleteLink,
  getPsicoId,
  updateClickCount,
  updateLead,
  updateLink,
  updatePsicoId,
  validatePsicoIdUserTag,
} from "./id.controllers";

// ROUTES
import links from "./links.route";
import leads from "./leads.route";

const app = new Hono();

// get psicoid by userTab
app.get("/:userTag?", ...getPsicoId);

// Validate user tag
app.post("/validate/:userTag?", ...validatePsicoIdUserTag);

// create psicoId
app.post("/", ...createPsicoId);

// update psicoId
app.patch("/:userTag", ...updatePsicoId);

// ROUTES
app.route("/links", links);
app.route("/leads", leads);

export default app;
