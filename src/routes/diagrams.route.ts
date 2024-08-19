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
  getAllSituations,
} from "@/controllers/diagrams.controllers";
import { Env } from "@/types/bindings";
import { Hono } from "hono";
import { Session } from "hono-sessions";
import { JwtVariables } from "hono/jwt";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>();

// get patient diagram
app.get("/", ...getPatientDiagram);

// update patient diagram
app.patch("/", ...updateDiagram);

/**
 * ===============================================================
 *                D I A G R A M   S I T U A T I O N S
 * ===============================================================
 */

app.get("/situations", ...getAllSituations);
app.get("/situations/:situationId", ...getSituation);
app.post("/situations", ...createSituation);
app.delete("/situations/:situationId", ...deleteSituation);
app.patch("/situations/:situationId", ...updateSituation);

export default app;
