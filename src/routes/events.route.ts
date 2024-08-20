import {
  getPatientAnamnesis,
  updateAnamnesis,
} from "@/controllers/anamnesis.controllers";
import {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  updateEvent,
} from "@/controllers/events.controllers";
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

/**
 * The patient id is optional in order to be able to create/get eventss on/from "/users/@me/eventss/:patientId" route.
 * Since the "/users/@me/patients/:patientId/eventss" already brings the patientId.
 */

// get all eventss
app.get("/:patientId?", ...getEvents);

// get events by id
app.get("/:eventId", ...getEvent);

// create events
app.post("/", ...createEvent);

// delete events
app.delete("/:eventId", ...deleteEvent);

// update events
app.patch("/:eventId", ...updateEvent);

export default app;
