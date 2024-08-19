import {
  createUser,
  getAllUsers,
  getMe,
  getUser,
  updateUser,
} from "@/controllers/users.controllers";

import { Hono } from "hono";
import { Env } from "@/types/bindings";
import { JwtVariables } from "hono/jwt";
import { Session } from "hono-sessions";

// ROUTES
import patients from "@/routes/patients.route";
import appointments from "@/routes/appointments.route";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>();

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
// NESTING APPOINTMENTS ROUTE
app.route("/@me/appointments", appointments);

export default app;
