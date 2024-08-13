import {
  getPatientAnamnesis,
  updateAnamnesis,
} from "@/controllers/anamnesis.controllers";
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getAppointments,
  updateAppointment,
} from "@/controllers/appointments.controllers";
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
 * The patient id is optional in order to be able to create/get appointments on/from "/users/@me/appointments/:patientId" route.
 * Since the "/users/@me/patients/:patientId/appointments" already brings the patientId.
 */

// get all appointments
app.get("/:patientId?", ...getAppointments);

// get appointment by id
app.get("/appointment/:appointmentId", ...getAppointment);

// create appointment
app.post("/:patientId?", ...createAppointment);

// delete appointment
app.delete("/:appointmentId", ...deleteAppointment);

// update appointment
app.patch("/appointment/:appointmentId", ...updateAppointment);

export default app;
