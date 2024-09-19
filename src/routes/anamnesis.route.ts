import {
  getPatientAnamnesis,
  updateAnamnesis,
} from "@/controllers/anamnesis.controllers";
import { Bindings } from "@/types/bindings";
import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";

const app = new Hono();

// get patient anamnesis
app.get("/", ...getPatientAnamnesis);

// create  anamnesis
//TODO: post router and others...

// update anamnesis
app.patch("/", ...updateAnamnesis);

export default app;
