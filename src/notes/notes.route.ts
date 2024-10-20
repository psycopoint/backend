import { Hono } from "hono";
import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
} from "./notes.controllers";

const app = new Hono();

// get all notes
app.get("/", ...getNotes);

// get note by id
app.get("/:noteId", ...getNote);

// create a note
app.post("/", ...createNote);

// update a note
app.patch("/:noteId", ...updateNote);

// delete a note
app.delete("/:noteId", ...deleteNote);

export default app;
