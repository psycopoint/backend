import {
  deleteFileService,
  deleteFolderService,
  updateFileService,
  uploadFileService,
  uploadMultipleFilesService,
} from "@src/uploads/upload.services";

import { handleError } from "@utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";
import { z } from "zod";

const factory = createFactory();

// UPLOAD FILE
export const uploadFile = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const body = await c.req.parseBody();

  console.log("BODY RECEBIDO NO UPLOAD:", body);

  const files = Object.values(body).filter(
    (value) => value instanceof File
  ) as File[];

  console.log(files);

  const singleFile = body["file"] as File | undefined;
  const path = body["path"] as string;

  if (files.length === 0) {
    throw new Error("No files provided for upload");
  }

  let urls;

  try {
    if (files.length > 1) {
      // Upload de múltiplos arquivos
      urls = await uploadMultipleFilesService(c, user, files, path);
      return c.json({ message: "success", data: { urls } });
    } else {
      // Upload de um único arquivo
      urls = await uploadFileService(c, user, files[0], path);
      return c.json({ message: "success", data: { urls } });
    }
  } catch (error) {
    return handleError(c, error);
  }
});

// UPDATE FILE
export const updateFile = factory.createHandlers(
  zValidator(
    "form",
    z.object({
      oldPath: z.string(),
      file: z.instanceof(File),
      newPath: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const user = c.get("user");
    if (!user) {
      throw new Error("Unauthorized");
    }

    const body = await c.req.parseBody();

    console.log(body["oldPath"]);
    console.log(body["file"]);
    console.log(body["newPath"]);

    try {
      const updatedFile = await updateFileService(
        c,
        user,
        body["oldPath"] as string,
        body["file"] as File,
        body["newPath"] as string
      );

      return c.json({ message: "success" });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// DELETE FILE
export const deleteFile = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      path: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const user = c.get("user");
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { path } = c.req.valid("json");

    try {
      const deletedFile = await deleteFileService(c, user, path);

      console.log(deletedFile);

      return c.json({ message: "success" });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// DELETE FOLDER
export const deleteFolder = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      folder: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const user = c.get("user");
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { folder } = c.req.valid("json");

    try {
      const deletedFile = await deleteFolderService(
        c,
        c.env.R2_BUCKET_NAME,
        folder
      );

      return c.json({ message: "success" });
    } catch (error) {
      return handleError(c, error);
    }
  }
);
