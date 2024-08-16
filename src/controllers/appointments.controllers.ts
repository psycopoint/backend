import { appointments, insertappointmentSchema } from "@/db/schemas";
import {
  createAppointmentService,
  deleteAppointmentService,
  getAppointmentService,
  getAppointmentsService,
  updateAppointmentService,
} from "@/services/appointments.services";
import { handleError } from "@/utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";
import { z } from "zod";

const factory = createFactory();

// get all appointments
export const getAppointments = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const appointments = await getAppointmentsService(c, db);

    return c.json({ data: appointments });
  } catch (error) {
    return handleError(c, error);
  }
});

// get appointment by id
export const getAppointment = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      appointmentId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { appointmentId } = c.req.valid("param");

    try {
      const appointment = await getAppointmentService(c, db, appointmentId);

      return c.json({ data: appointment });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// create appointment
export const createAppointment = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      patientId: z.string(),
    })
  ),
  zValidator(
    "json",
    insertappointmentSchema.pick({
      agendaAvatar: true,
      allDay: true,
      color: true,
      deletable: true,
      disabled: true,
      draggable: true,
      editable: true,
      end: true,
      appointmentDetails: true,
      appointmentMood: true,
      start: true,
      sx: true,
      textColor: true,
      title: true,
      appointmentDuration: true,
      appointmentFeedback: true,
      appointmentFocus: true,
      appointmentOutcome: true,
      followUpDate: true,
      isCompleted: true,
      nextSteps: true,
      patientConcerns: true,
      patientMood: true,
      patientNotes: true,
      psychologistNotes: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { patientId } = c.req.valid("param");
    const values = c.req.valid("json");

    const data = await createAppointmentService(
      c,
      db,
      { ...values, id: createId() },
      patientId
    );
    return c.json({ data });
  }
);

// create appointment
export const updateAppointment = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      appointmentId: z.string(),
    })
  ),
  zValidator(
    "json",
    insertappointmentSchema.pick({
      agendaAvatar: true,
      allDay: true,
      color: true,
      deletable: true,
      disabled: true,
      draggable: true,
      editable: true,
      end: true,
      appointmentDetails: true,
      appointmentMood: true,
      start: true,
      sx: true,
      textColor: true,
      title: true,
      appointmentDuration: true,
      appointmentFeedback: true,
      appointmentFocus: true,
      appointmentOutcome: true,
      followUpDate: true,
      isCompleted: true,
      nextSteps: true,
      patientConcerns: true,
      patientMood: true,
      patientNotes: true,
      psychologistNotes: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { appointmentId } = c.req.valid("param");
    const values = c.req.valid("json");

    const data = await updateAppointmentService(
      c,
      db,
      { ...values, id: createId() },
      appointmentId
    );
    return c.json({ data });
  }
);

// delete appointment
export const deleteAppointment = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      appointmentId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { appointmentId } = c.req.valid("param");

    try {
      const result = await deleteAppointmentService(c, db, appointmentId);

      if (!result) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ message: "Success" }, 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);
