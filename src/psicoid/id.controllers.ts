import {
  InsertLink,
  InsertPsicoId,
  SelectUser,
  insertPsicoIdSchema,
  psicoIdLinkSchema,
} from "@db/schemas";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { handleError } from "@utils/handle-error";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { createFactory } from "hono/factory";
import {
  createLinkService,
  createPsicoIdService,
  deleteLinkService,
  getPsicoIdService,
  updateClickCountService,
  updateLinkService,
  updatePsicoIdService,
} from "./id.services";
import { z } from "zod";
import { createApiResponse } from "@utils/response";

const factory = createFactory();

// get by userTag
export const getPsicoId = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      userTag: z.string().optional(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);
    const { userTag } = c.req.valid("param");

    try {
      const data = await getPsicoIdService(c, db, userTag);

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// create
export const createPsicoId = factory.createHandlers(
  zValidator(
    "json",
    insertPsicoIdSchema.pick({
      enabled: true,
      bio: true,
      layoutStyle: true,
      links: true,
      showAvailability: true,
      showContactForm: true,
      themeColor: true,
      userTag: true,
      website: true,
      createdAt: true,
      updatedAt: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const values = c.req.valid("json");

    try {
      const data = await createPsicoIdService(c, db, values as InsertPsicoId);

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// update
export const updatePsicoId = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      userTag: z.string(),
    })
  ),
  zValidator(
    "json",
    insertPsicoIdSchema.pick({
      enabled: true,
      bio: true,
      layoutStyle: true,
      links: true,
      showAvailability: true,
      showContactForm: true,
      themeColor: true,
      userTag: true,
      website: true,
      createdAt: true,
      updatedAt: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const values = c.req.valid("json");
    const { userTag } = c.req.valid("param");

    try {
      const data = await updatePsicoIdService(
        c,
        db,
        values as InsertPsicoId,
        userTag
      );
      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// LINKS
export const createLink = factory.createHandlers(
  zValidator(
    "json",
    psicoIdLinkSchema.pick({
      clickCount: true,
      description: true,
      icon: true,
      isActive: true,
      order: true,
      target: true,
      title: true,
      type: true,
      url: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const values = c.req.valid("json");

    try {
      const data = await createLinkService(c, db, values as InsertLink);

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

export const deleteLink = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      linkId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { linkId } = c.req.valid("param");

    try {
      const data = await deleteLinkService(c, db, linkId);

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

export const updateLink = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      linkId: z.string(),
    })
  ),
  zValidator(
    "json",
    psicoIdLinkSchema.pick({
      clickCount: true,
      description: true,
      icon: true,
      isActive: true,
      order: true,
      target: true,
      title: true,
      type: true,
      url: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const values = c.req.valid("json");
    const { linkId } = c.req.valid("param");

    try {
      const data = await updateLinkService(c, db, linkId, values as InsertLink);

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

export const updateClickCount = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      linkId: z.string(),
      userTag: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { linkId, userTag } = c.req.valid("json");

    try {
      await updateClickCountService(c, db, linkId, userTag);

      return c.json(createApiResponse("success", []), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);
