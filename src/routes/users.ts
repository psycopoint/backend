import {
  createUser,
  getAllUsers,
  getMe,
  getUser,
  updateUser,
} from "@/controllers/userControllers";
import { clinics, psychologists } from "@/db/schemas";
import { getAuth } from "@/auth";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { Context, Hono } from "hono";
import { z } from "zod";

const app = new Hono()
  // get all users
  .get("/", ...getAllUsers)

  // get @me
  .get("/@me", ...getMe)

  // get user by id
  .get("/:id", ...getUser)

  // create user
  .post("/", ...createUser)

  // update user
  .patch("/:id", ...updateUser);

export default app;
