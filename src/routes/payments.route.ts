import {
  createEmergencyContact,
  createPatient,
  deleteEmergencyContact,
  deletePatient,
  getAllPatients,
  getEmergencyContact,
  getEmergencyContacts,
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
import events from "@/routes/events.route";
import {
  createPayment,
  deletePayment,
  getPayment,
  getPayments,
  updatePayment,
} from "@/controllers/payments.controllers";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>();

// get all payments
app.get("/", ...getPayments);

// get payment by id
app.get("/:paymentId", ...getPayment);

//  create a payment
app.post("/", ...createPayment);

//  update payment
app.patch("/:paymentId", ...updatePayment);

// delete payment
app.delete("/:paymentId", ...deletePayment);

export default app;
