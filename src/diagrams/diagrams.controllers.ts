import {
  InsertDiagram,
  diagramSituationSchema,
  insertDiagramsSchema,
} from "@db/schemas";
import {
  createSituationService,
  deleteSituationService,
  getPatientDiagramService,
  getSituationService,
  getSituationsService,
  updateDiagramService,
  updateSituationService,
} from "@src/diagrams/diagrams.services";
import { handleError } from "@utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";

const factory = createFactory();

// GET ALL DIAGRAMS
export const getAllDiagrams = factory.createHandlers(async (c) => {
  const { patientId } = c.req.param();

  return c.text("Get All Diagrams");
});

// GET DIAGRAMS
export const getPatientDiagram = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const { patientId } = c.req.param();

  if (!patientId) {
    throw new Error("Missing ID");
  }

  try {
    // get anamnesis from user :id inside db
    const data = await getPatientDiagramService(c, db, patientId);

    return c.json({ data }, 200);
  } catch (error) {
    return handleError(c, error);
  }
});

// UPDATE DIAGRAM
export const updateDiagram = factory.createHandlers(
  zValidator(
    "json",
    insertDiagramsSchema.pick({
      beliefMaintenance: true,
      centralBeliefs: true,
      relevantHistory: true,
      ruleBeliefs: true,
      situations: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { patientId } = c.req.param();
    const values = c.req.valid("json");

    try {
      const data = await updateDiagramService(
        c,
        db,
        patientId,
        values as InsertDiagram
      );

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

/**
 * ===============================================================
 *                D I A G R A M   S I T U A T I O N S
 * ===============================================================
 */

// GET ALL SITUATIONS
export const getAllSituations = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const { patientId } = c.req.param();

  if (!patientId) {
    throw new Error("Missing ID");
  }

  try {
    // get situations from user :id inside db
    const data = await getSituationsService(c, db, patientId);

    return c.json({ data }, 200);
  } catch (error) {
    return handleError(c, error);
  }
});

// CREATE DIAGRAM SITUATION
export const createSituation = factory.createHandlers(
  zValidator("json", diagramSituationSchema),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const patientId = c.req.param("patientId");
    const values = c.req.valid("json");
    try {
      // update situations
      const newSituations = await createSituationService(
        c,
        db,
        patientId,
        values
      );

      return c.json({ data: newSituations });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// DELETE DIAGRAM SITUATION
export const deleteSituation = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const patientId = c.req.param("patientId");
  const situationId = c.req.param("situationId");

  try {
    // get updated situation to retriev it
    const deletedSituation = await deleteSituationService(
      c,
      db,
      patientId,
      situationId
    );

    return c.json({ data: deletedSituation });
  } catch (error) {
    return handleError(c, error);
  }
});

// UPDATE DIAGRAM SITUATIONS
export const updateSituation = factory.createHandlers(
  zValidator("json", diagramSituationSchema),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const patientId = c.req.param("patientId");
    const situationId = c.req.param("situationId");
    const values = c.req.valid("json");

    try {
      // update situations
      const allSituations = await updateSituationService(
        c,
        db,
        patientId,
        situationId,
        values
      );

      // get updated situation to retriev it
      const updatedSituation = await getSituationService(
        c,
        db,
        patientId,
        situationId
      );

      return c.json({ data: updatedSituation });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

export const getSituation = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const patientId = c.req.param("patientId");
  const situationId = c.req.param("situationId");

  try {
    const situation = await getSituationService(c, db, patientId, situationId);

    return c.json({ data: situation });
  } catch (error) {
    return handleError(c, error);
  }
});
