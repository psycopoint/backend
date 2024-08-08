import {
  getPatientAnamnesis,
  updateAnamnesis,
} from "@/controllers/anamnesis.controllers";
import {
  createSituation,
  getSituation,
  getPatientDiagram,
  updateDiagram,
  updateSituation,
  deleteSituation,
} from "@/controllers/diagrams.controllers";
import { Hono } from "hono";

const app = new Hono();

// get patient diagram
app.get("/", ...getPatientDiagram);

// update patient diagram
app.patch("/", ...updateDiagram);

/**
 * ===============================================================
 *                D I A G R A M   S I T U A T I O N S
 * ===============================================================
 */

app.get("/situations/:situationId", ...getSituation);
app.post("/situations", ...createSituation);
app.delete("/situations/:situationId", ...deleteSituation);
app.patch("/situations/:situationId", ...updateSituation);

export default app;
