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

import { Hono } from "hono";

const app = new Hono();

/**
 * The patient id is optional in order to be able to create/get eventss on/from "/users/@me/eventss/:patientId" route.
 * Since the "/users/@me/patients/:patientId/eventss" already brings the patientId.
 */

// get all eventss
app.get("/", ...getEvents);

// get events by id
app.get("/:eventId", ...getEvent);

// create events
app.post("/", ...createEvent);

// delete events
app.delete("/:eventId", ...deleteEvent);

// update events
app.patch("/:eventId", ...updateEvent);

export default app;
