import {
  InsertAnamnesis,
  InsertDiagram,
  InsertPatient,
  insertPatientSchema,
} from "@db/schemas";

import { createDiagramService } from "@src/diagrams/diagrams.services";
import {
  createEmergencyContactService,
  deletePatientEmergencyContactService,
  getPatientEmergencyContactService,
  getPatientEmergencyContactsService,
} from "@src/patients/patients.services";
import {
  createPatientService,
  deletePatientService,
  getAllPatientsService,
  getPatientService,
  updatePatientService,
} from "@src/patients/patients.services";
import { handleError } from "@utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { createId } from "@paralleldrive/cuid2";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { createFactory } from "hono/factory";
import { z } from "zod";
import { createAnamnesisService } from "@src/anamnesis/anamnese.services";
import { userPlan } from "@utils/subscription";

const factory = createFactory();

// GET ALL PATIENTS
export const getAllPatients = factory.createHandlers(async (c: Context) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const patients = await getAllPatientsService(c, db);
    return c.json({ data: patients });
  } catch (error) {
    return handleError(c, error);
  }
});

// GET PATIENT BY ID
export const getPatient = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      patientId: z.string().optional(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { patientId } = c.req.valid("param");

    if (!patientId) {
      return c.json({ error: "Missing Id" }, 400);
    }

    try {
      // get a single user's patient inside db
      const patient = await getPatientService(c, db, patientId);

      // get sessions
      // TODO: add sessions

      // get payments
      // TODO: add payments

      return c.json({ data: patient }, 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// CREATE PATIENT
export const createPatient = factory.createHandlers(
  zValidator(
    "json",
    insertPatientSchema.pick({
      avatar: true,
      birthdate: true,
      addressInfo: true,
      cpf: true,
      email: true,
      firstName: true,
      isActive: true,
      lastName: true,
      phone: true,
      gender: true,
      emergencyContacts: true,
      preferences: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const values = c.req.valid("json");

    // verify users plan to prevent inserting
    const patients = await getAllPatientsService(c, db);
    const userCurrentPlan = await userPlan(c, db);

    if (!userCurrentPlan) {
      if (patients.length > 3) {
        return c.json({ error: "Patient limit reached" }, 403);
      }
    }

    if (userCurrentPlan === "Profissional") {
      if (patients.length > 10) {
        return c.json({ error: "Patient limit reached" }, 403);
      }
    }

    try {
      const newPatient = await createPatientService(
        c,
        db,
        values as InsertPatient
      );

      // create pateint initial anamnesis
      const newAnamnesis = await createAnamnesisService(
        c,
        db,
        values as InsertAnamnesis,
        newPatient.id
      );

      // create pateint initial diagram
      const newDiagram = await createDiagramService(
        c,
        db,
        values as InsertDiagram,
        newPatient.id
      );

      const data = {
        patient: newPatient,
        anamnesis: newAnamnesis,
        diagram: newDiagram,
      };

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// DELETE PATIENT BY ID
export const deletePatient = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      patientId: z.string().optional(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { patientId } = c.req.valid("param");

    if (!patientId) {
      return c.json({ error: "Missing Id" }, 400);
    }

    try {
      // get a single user's patient inside db
      const patient = await deletePatientService(c, db, patientId);

      return c.json({ data: patient }, 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// UPDATE PATIENT
export const updatePatient = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      patientId: z.string().optional(),
    })
  ),
  zValidator(
    "json",
    insertPatientSchema.pick({
      birthdate: true,
      addressInfo: true,
      cpf: true,
      email: true,
      firstName: true,
      isActive: true,
      lastName: true,
      phone: true,
      emergencyContacts: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      gender: true,
      preferences: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    // get body data
    const { patientId } = c.req.valid("param");
    const values = c.req.valid("json");

    if (!patientId) {
      return c.json({ error: "Missing id" });
    }

    try {
      const patient = await updatePatientService(
        c,
        db,
        patientId,
        values as InsertPatient
      );

      return c.json({ data: patient }, 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

/**
 * ===============================================================
 *              E M E R G E N C Y   C O N T A C T S
 * ===============================================================
 */

// get all contacts
export const getEmergencyContacts = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const { patientId } = c.req.param();

  if (!patientId) {
    throw new Error("Missing ID");
  }

  try {
    const data = await getPatientEmergencyContactsService(c, db, patientId);

    return c.json({ data });
  } catch (error) {
    return handleError(c, error);
  }
});

// get contact by id
export const getEmergencyContact = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      contactId: z.string(),
      patientId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { contactId, patientId } = c.req.valid("param");

    if (!patientId) {
      throw new Error("Missing ID");
    }

    try {
      const data = await getPatientEmergencyContactService(
        c,
        db,
        patientId,
        contactId
      );

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// create a new emergency contact
export const createEmergencyContact = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      patientId: z.string(),
    })
  ),
  zValidator(
    "json",
    z.object({
      id: z.string().default(() => createId()),
      contactName: z.string(),
      contactRelation: z.string(),
      contactPhone: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { patientId } = c.req.valid("param");
    const values = c.req.valid("json");

    if (!patientId) {
      throw new Error("Missing ID");
    }

    try {
      const data = await createEmergencyContactService(
        c,
        db,
        values,
        patientId
      );

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// delete contact by id
export const deleteEmergencyContact = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      contactId: z.string(),
      patientId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { contactId, patientId } = c.req.valid("param");

    if (!patientId) {
      throw new Error("Missing ID");
    }

    try {
      const data = await deletePatientEmergencyContactService(
        c,
        db,
        patientId,
        contactId
      );

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);
