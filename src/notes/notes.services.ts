import { InsertNote, notes, SelectEvent, SelectNote } from "@db/schemas";
import { init } from "@paralleldrive/cuid2";
import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

// get all notes
export const getNotesService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<SelectNote[]> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  // verify if the note exists
  const [existing] = await db
    .select()
    .from(notes)
    .where(eq(notes.psychologistId, user.id!));

  if (!existing) {
    throw new Error("Not found");
  }

  const data = await db
    .select()
    .from(notes)
    .where(eq(notes.psychologistId, user.id));

  return data as SelectNote[];
};

// get not by id
export const getNoteService = async (
  c: Context,
  db: NeonHttpDatabase,
  noteId: string
): Promise<SelectNote> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  // verify if the notes exists
  // TODO: verify this if is breally needed
  const [existing] = await db
    .select()
    .from(notes)
    .where(eq(notes.psychologistId, user.id));

  if (!existing) {
    throw new Error("Not found");
  }

  const [data] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.psychologistId, user.id)));

  return data as SelectNote;
};

// create a note
export const createNoteService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertNote,
  patientId?: string
): Promise<SelectNote> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const createId = init({
    length: 10,
  });

  const [data] = await db
    .insert(notes)
    .values({
      ...values,
      id: createId(),
      psychologistId: user.id,
    })
    .returning();

  return data as SelectNote;
};

// update note
export const updateNoteService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertNote,
  noteId: string
): Promise<SelectNote> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log(values);

  const [data] = await db
    .update(notes)
    .set({
      ...values,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
    })
    .where(eq(notes.id, noteId))
    .returning();

  return data as SelectNote;
};

// delete note
export const deleteNoteService = async (
  c: Context,
  db: NeonHttpDatabase,
  noteId: string
): Promise<SelectNote> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .delete(notes)
    .where(and(eq(notes.psychologistId, user.id), eq(notes.id, noteId)))
    .returning();

  return data as SelectNote;
};
