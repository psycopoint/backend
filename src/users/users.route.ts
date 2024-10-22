import { Hono } from "hono";

import {
  createUser,
  getAllUsers,
  getMe,
  getUser,
  updateUser,
} from "@src/users/users.controllers";

// ROUTES
import patients from "@src/patients/patients.route";
import events from "@src/events/events.route";
import transactions from "@src/transactions/transactions.route";
import documents from "@src/documents/documents.route";
import notes from "@src/notes/notes.route";
import psicoid from "@src/psicoid/id.route";

const app = new Hono();

// get all users
app.get("/", ...getAllUsers);

// get @me
app.get("/@me", ...getMe);

// get user by id
app.get("/:id", ...getUser);

// create user
app.post("/", ...createUser);

// update user
app.patch("/:id", ...updateUser);

// NESTING PATIENT ROUTE
app.route("/@me/patients", patients);
// NESTING EVENTS ROUTE
app.route("/@me/events", events);
// NESTING TRANSACTIONS ROUTE
app.route("/@me/transactions", transactions);
// NESTING DOCUMENTS ROUTE
app.route("/@me/documents", documents);
// NESTING NOTES ROUTE
app.route("/@me/notes", notes);

export default app;
