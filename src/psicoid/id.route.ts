import { Hono } from "hono";
import {
  createLink,
  createPsicoId,
  deleteLink,
  getPsicoId,
  updateLink,
  updatePsicoId,
} from "./id.controllers";

const app = new Hono();

// LINKS
app.post("/links", ...createLink);
app.delete("/links/:linkId", ...deleteLink);
app.patch("/links/:linkId", ...updateLink);

// get psicoid by userTab
app.get("/:userTag", ...getPsicoId);

// create psicoId
app.post("/", ...createPsicoId);

// update psicoId
app.patch("/:userTag", ...updatePsicoId);

export default app;
