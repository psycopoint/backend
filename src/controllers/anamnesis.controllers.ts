import { InsertAnamnesis, insertAnamnesisSchema } from "@/db/schemas";
import {
  getPatientAnamnesisService,
  updateAnamnesisService,
} from "@/services/anamnesis.services";
import { handleError } from "@/utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { createFactory } from "hono/factory";
import { decode } from "hono/jwt";
import { Resend } from "resend";
import { z } from "zod";

const factory = createFactory();

// GET ALL ANAMNESIS
export const getAllAnamnese = factory.createHandlers(async (c) => {
  const { patientId } = c.req.param();

  console.log("PARAM:", patientId);
  return c.text("Get All Anamnese");
});

// GET ANAMNESIS
export const getPatientAnamnesis = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const { patientId } = c.req.param();

  console.log(patientId);

  if (!patientId) {
    throw new Error("Missing ID");
  }

  try {
    // get anamnesis from user :id inside db
    const data = await getPatientAnamnesisService(c, db, patientId);

    return c.json({ data }, 200);
  } catch (error) {
    return handleError(c, error);
  }
});

// UPDATE ANAMNESIS
export const updateAnamnesis = factory.createHandlers(
  zValidator(
    "json",
    insertAnamnesisSchema.pick({
      allergies: true,
      chiefComplaint: true,
      consent: true,
      createdAt: true,
      diagnosis: true,
      familyHistory: true,
      historyOfPresentIllness: true,
      medicalHistory: true,
      medications: true,
      mentalStatusExam: true,
      pastPsychiatricHistory: true,
      riskAssessment: true,
      socialHistory: true,
      substanceUse: true,
      updatedAt: true,
      lifeInfos: true,
      bdi: true,
      eeh: true,
      hama: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { patientId } = c.req.param();
    const values = c.req.valid("json");

    try {
      const data = await updateAnamnesisService(
        c,
        db,
        patientId,
        values as InsertAnamnesis
      );

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);
