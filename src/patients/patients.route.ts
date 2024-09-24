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
} from "@src/patients/patients.controllers";

import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";

// ROUTES
import anamnesis from "@src/anamnese/anamnese.route";
import diagrams from "@src/diagrams/diagrams.route";
import events from "@src/events/events.route";

const app = new Hono();

// get all patients
app.get("/", ...getAllPatients);

// get patient by id
app.get("/:patientId", ...getPatient);

// create patient
app.post("/", ...createPatient);

// delete patient by id
app.delete("/:patientId", ...deletePatient);

// delete patient by id
app.patch("/:patientId", ...updatePatient);

// NESTING ROUTES
app.route("/:patientId/anamnesis", anamnesis);
app.route("/:patientId/diagram", diagrams);
app.route("/:patientId/events", events);

/**
 * ===============================================================
 *              E M E R G E N C Y   C O N T A C T S
 * ===============================================================
 */
// get all contacts
app.get("/:patientId/emergency-contacts", ...getEmergencyContacts);

// get a contact by id
app.get("/:patientId/emergency-contacts/:contactId", ...getEmergencyContact);

// create a contact
app.post("/:patientId/emergency-contacts", ...createEmergencyContact);

// delete a contact
app.delete(
  "/:patientId/emergency-contacts/:contactId",
  ...deleteEmergencyContact
);
export default app;
