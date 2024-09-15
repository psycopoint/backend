import {
  appointmentConfirmation,
  appointmentReminder,
} from "@/controllers/weebhooks.controllers";
import { createTwilio } from "@/lib/twilio";
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

// TWILLIO
app.post("/appointments/confirm", ...appointmentConfirmation);

app.post("/appointments/reminder", ...appointmentReminder);

export default app;
