import {
  createPatient,
  deletePatient,
  getAllPatients,
  getPatient,
  updatePatient,
} from "@/controllers/patients.controllers";

import { Hono } from "hono";
import { Env } from "@/types/bindings";
import { JwtVariables } from "hono/jwt";
import { Session } from "hono-sessions";

// ROUTES
import anamnesis from "./anamnesis.route";
import diagrams from "./diagrams.route";
import appointments from "@/routes/appointments.route";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>();

// get all patients
app.get("/", ...getAllPatients);

// get patient by id
app.get("/:id", ...getPatient);

// create patient
app.post("/", ...createPatient);

// delete patient by id
app.delete("/:id", ...deletePatient);

// delete patient by id
app.patch("/:id", ...updatePatient);

// NESTING ROUTES
app.route("/:patientId/anamnesis", anamnesis);
app.route("/:patientId/diagram", diagrams);
app.route("/:patientId", appointments);

export default app;
