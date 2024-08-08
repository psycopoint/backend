import {
  createPatient,
  deletePatient,
  getAllPatients,
  getPatient,
  updatePatient,
} from "@/controllers/patients.controllers";

import { bearerMiddleware } from "@/middlewares/bearer-middleware";
import { Hono } from "hono";

// ROUTES
import anamnesis from "./anamnesis.route";

const app = new Hono();

app.use("/*", bearerMiddleware);

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

export default app;
