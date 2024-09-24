import { Hono } from "hono";

// ROUTES
import patients from "@src/patients/patients.route";
import events from "@src/events/events.route";
import transactions from "@src/transactions/transactions.route";
import documents from "@src/documents/documents.route";
import {
  createUser,
  getAllUsers,
  getMe,
  getUser,
  updateUser,
} from "@src/users/users.controllers";

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

export default app;
