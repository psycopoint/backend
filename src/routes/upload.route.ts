import { Hono } from "hono";
import { Env } from "@/types/bindings";
import { JwtVariables } from "hono/jwt";
import { Session } from "hono-sessions";
import {
  deleteFile,
  deleteFolder,
  updateFile,
  uploadFile,
} from "@/controllers/upload.controllers";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>();

// upload file
app.post("/upload", ...uploadFile);

// update file
app.patch("/update", ...updateFile);

// delete file
app.delete("/delete", ...deleteFile);

app.delete("/delete/folder", ...deleteFolder);

export default app;
