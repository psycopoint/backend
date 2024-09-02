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
  createTransaction,
  deleteTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
} from "@/controllers/transactions.controllers";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>();

// get all transactions
app.get("/", ...getTransactions);

// get transaction by id
app.get("/:transactionId", ...getTransaction);

//  create a transaction
app.post("/", ...createTransaction);

//  update transaction
app.patch("/:transactionId", ...updateTransaction);

// delete transaction
app.delete("/:transactionId", ...deleteTransaction);

export default app;
