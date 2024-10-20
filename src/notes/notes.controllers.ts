import { handleError } from "@utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";
import { z } from "zod";

import { init } from "@paralleldrive/cuid2";
import { userPlan } from "@utils/subscription";
import {
  createNoteService,
  deleteNoteService,
  getNoteService,
  getNotesService,
  updateNoteService,
} from "./notes.services";
import { InsertNote, insertNoteSchema } from "@db/schemas";

const factory = createFactory();

// get all notes
export const getNotes = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const notes = await getNotesService(c, db);

    return c.json({ data: notes });
  } catch (error) {
    return handleError(c, error);
  }
});

// get note by id
export const getNote = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      noteId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { noteId } = c.req.valid("param");

    try {
      const data = await getNoteService(c, db, noteId);

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// create note
export const createNote = factory.createHandlers(
  zValidator(
    "json",
    insertNoteSchema.pick({
      patientId: true,
      title: true,
      attachments: true,
      data: true,
      archived: true,
      priority: true,
      status: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const patientId = c.req.param("patientId");
    const values = c.req.valid("json");

    if (!values) {
      return c.text("values not provided");
    }

    const createId = init({
      length: 10,
    });

    // verify users plan to prevent inserting
    // const userCurrentPlan = await userPlan(c, db);

    // if (userCurrentPlan === "Free") {
    //   const events = await getEventsService(c, db);
    //   if (events.length > 40) {
    //     return c.json({ error: "Events limit reached" }, 403);
    //   }
    // }

    try {
      const data = await createNoteService(
        c,
        db,
        values as InsertNote,
        patientId
      );

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// update note
export const updateNote = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      noteId: z.string(),
    })
  ),
  zValidator(
    "json",
    insertNoteSchema.pick({
      patientId: true,
      title: true,
      attachments: true,
      data: true,
      archived: true,
      priority: true,
      status: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { noteId } = c.req.valid("param");
    const values = c.req.valid("json");

    try {
      const data = await updateNoteService(c, db, values as InsertNote, noteId);

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// delete note
export const deleteNote = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      noteId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { noteId } = c.req.valid("param");

    try {
      const data = await deleteNoteService(c, db, noteId);

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json(
        { success: true, message: "Event deleted successfully", data },
        200
      );
    } catch (error) {
      return handleError(c, error);
    }
  }
);
