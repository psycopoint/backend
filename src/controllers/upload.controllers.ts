import {
  deleteFileService,
  deleteFolderService,
  updateFileService,
  uploadFileService,
} from "@/services/upload.services";
import { getAuth } from "@/utils/get-auth";
import { handleError } from "@/utils/handle-error";
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

  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }
  const body = await c.req.parseBody();

  try {
    const url = await uploadFileService(
      c,
      user,
      body["file"] as File,
      body["path"] as string
    );

    return c.json({ message: "success", data: { url: url } });
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

    const user = await getAuth(c, db);

    if (!user) {
      throw new Error("Not authenticated");
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

    const user = await getAuth(c, db);

    if (!user) {
      throw new Error("Not authenticated");
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

    const user = await getAuth(c, db);

    if (!user) {
      throw new Error("Not authenticated");
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
