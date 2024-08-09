import {
  createUser,
  getAllUsers,
  getMe,
  getUser,
  updateUser,
} from "@/controllers/users.controllers";
import { bearerMiddleware } from "@/middlewares/bearer-middleware";
import { Hono } from "hono";

// ROUTES
import patients from "@/routes/patients.route";
import { JwtVariables } from "hono/jwt";
import { Session } from "hono-sessions";
import { Env } from "@/types/bindings";

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

export default app;
