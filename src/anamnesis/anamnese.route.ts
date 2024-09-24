import {
  getPatientAnamnesis,
  updateAnamnesis,
} from "@src/anamnesis/anamnesis.controllers";

import { Hono } from "hono";

const app = new Hono();

// get patient anamnesis
app.get("/", ...getPatientAnamnesis);

// create  anamnesis
//TODO: post router and others...

// update anamnesis
app.patch("/", ...updateAnamnesis);

export default app;
