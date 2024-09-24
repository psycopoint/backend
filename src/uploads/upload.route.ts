import { Hono } from "hono";

import {
  deleteFile,
  deleteFolder,
  updateFile,
  uploadFile,
} from "@src/uploads/upload.controllers";

const app = new Hono();

// upload file
app.post("/upload", ...uploadFile);

// update file
app.patch("/update", ...updateFile);

// delete file
app.delete("/delete", ...deleteFile);

app.delete("/delete/folder", ...deleteFolder);

export default app;
