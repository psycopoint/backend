import {
  createUser,
  getAllUsers,
  getMe,
  getUser,
  updateUser,
} from "@/controllers/users.controllers";

import { Hono } from "hono";

// ROUTES
import patients from "@/routes/patients.route";
import events from "@/routes/events.route";
import transactions from "@/routes/transactions.route";
import documents from "@/routes/documents.route";

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
