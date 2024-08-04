import {
  createUser,
  getAllUsers,
  getMe,
  getUser,
  updateUser,
} from "@/controllers/users.controllers";
import { Context, Hono } from "hono";
import { z } from "zod";

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

export default app;
