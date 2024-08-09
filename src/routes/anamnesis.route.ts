import {
  getPatientAnamnesis,
  updateAnamnesis,
} from "@/controllers/anamnesis.controllers";
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

// get patient anamnesis
app.get("/", ...getPatientAnamnesis);

// create  anamnesis
//TODO: post router and others...

// update anamnesis
app.patch("/", ...updateAnamnesis);

export default app;
