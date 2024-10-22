import {
  InsertLink,
  InsertPsicoId,
  SelectLink,
  SelectPsicoId,
  SelectPsychologist,
  SelectUser,
  TPsicoIdLinks,
  psicoId,
  psychologists,
  subscriptions,
  users,
} from "@db/schemas";
import { init } from "@paralleldrive/cuid2";
import { getUserById } from "@src/auth/auth.services";
import { and, eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

// get psicoId by username
export const getPsicoIdByUserTagService = async (
  c: Context,
  db: NeonHttpDatabase,
  userTag: string
): Promise<{
  user: Partial<SelectPsychologist & SelectUser>;
  psicoId: SelectPsicoId;
}> => {
  const [data] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userTag, userTag));

  // find user subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, data.userId));

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, data.userId));
  const [psychologistProfile] = await db
    .select({
      additionalEmails: psychologists.additionalEmails,
      additionalPhones: psychologists.additionalPhones,
      website: psychologists.website,
      socialLinks: psychologists.socialLinks,
      gender: psychologists.gender,
      birthdate: psychologists.birthdate,
      phone: psychologists.phone,
      crp: psychologists.crp,
      signature: psychologists.signature,
      specialty: psychologists.specialty,
    })
    .from(psychologists)
    .where(eq(psychologists.userId, data.userId));

  if (!subscription) {
    throw new Error("Unauthorized, user has no subscription");
  }

  if (!data.enabled) {
    throw new Error("PsicoId, is not enabled");
  }

  return {
    user: { ...user, ...psychologistProfile },
    psicoId: data,
  };
};

// get psicoId by username
export const getPsicoIdServiceByUserId = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<{
  user: Partial<SelectPsychologist & SelectUser>;
  psicoId: SelectPsicoId;
}> => {
  const user = c.get("user") as SelectUser;
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userId, user.id));

  // find user subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, data.userId));

  const [userDb] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, data.userId));
  const [psychologistProfile] = await db
    .select({
      additionalEmails: psychologists.additionalEmails,
      additionalPhones: psychologists.additionalPhones,
      website: psychologists.website,
      socialLinks: psychologists.socialLinks,
      gender: psychologists.gender,
      birthdate: psychologists.birthdate,
      phone: psychologists.phone,
      crp: psychologists.crp,
      signature: psychologists.signature,
      specialty: psychologists.specialty,
    })
    .from(psychologists)
    .where(eq(psychologists.userId, data.userId));

  if (!subscription) {
    throw new Error("Unauthorized, user has no subscription");
  }

  if (!data.enabled) {
    throw new Error("PsicoId, is not enabled");
  }

  return {
    user: { ...userDb, ...psychologistProfile },
    psicoId: data,
  };
};

// create psicoId
export const createPsicoIdService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertPsicoId
): Promise<SelectPsicoId> => {
  const user = c.get("user") as SelectUser;

  if (!user) {
    throw new Error("Unauthorized");
  }

  const createId = init({
    length: 14,
  });

  // verify if psicoId already exists
  const [existing] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userId, user.id));
  if (existing) throw new Error("Psico ID already exists");

  const [data] = await db
    .insert(psicoId)
    .values({
      ...values,
      id: createId(),
      userId: user.id,
      userTag: values.userTag ?? `@${user.email.split("@")[0]}`,
    })
    .returning();

  return data;
};

// create psicoId
export const updatePsicoIdService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertPsicoId,
  userTag: string
): Promise<SelectPsicoId> => {
  const user = c.get("user") as SelectUser;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!values || userTag) {
    throw new Error("Missing body");
  }

  const [data] = await db
    .update(psicoId)
    .set(values)
    .where(and(eq(psicoId.userId, user.id), eq(psicoId.userTag, userTag)))
    .returning();

  return data;
};

// LINKS

// add a new link
export const createLinkService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertLink
): Promise<SelectLink> => {
  const user = c.get("user") as SelectUser;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!values) {
    throw new Error("Missing body");
  }

  const createId = init({
    length: 14,
  });

  // get current links
  const [existing] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userId, user.id));
  const links = existing.links || [];

  const newLink: InsertLink = {
    ...values,
    id: createId(),
    order: links?.length || 0 + 1,
  };

  const updatedData: InsertPsicoId = {
    ...existing,
    links: [...links, newLink],
  };

  const [data] = await db
    .update(psicoId)
    .set(updatedData)
    .where(eq(psicoId.userId, user.id))
    .returning();

  return newLink;
};

// add a new link
export const updateLinkService = async (
  c: Context,
  db: NeonHttpDatabase,
  linkId: string,
  values: InsertLink
): Promise<SelectLink> => {
  const user = c.get("user") as SelectUser;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!linkId || !values) {
    throw new Error("Missing body");
  }

  // get current links
  const [existing] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userId, user.id));

  const links = existing.links || [];

  // find the link to update
  const linkIndex = links.findIndex((link) => link.id === linkId);
  if (linkIndex === -1) {
    throw new Error("Link not found");
  }

  // update the link with the new values
  const updatedLink = {
    ...links[linkIndex],
    ...values,
  };

  // replace the old link with the updated link
  links[linkIndex] = updatedLink;

  const updatedData: InsertPsicoId = {
    ...existing,
    links: links,
  };

  const [data] = await db
    .update(psicoId)
    .set(updatedData)
    .where(eq(psicoId.userId, user.id))
    .returning();

  return updatedLink;
};

// delete a new link
export const deleteLinkService = async (
  c: Context,
  db: NeonHttpDatabase,
  linkId: string
): Promise<SelectLink[]> => {
  const user = c.get("user") as SelectUser;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!linkId) {
    throw new Error("Missing body");
  }

  // get current links
  const [existing] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userId, user.id));

  const links = existing.links || [];
  const filteredLinks = links.filter((link) => link.id !== linkId);

  const updatedData: InsertPsicoId = {
    ...existing,
    links: filteredLinks,
  };

  const [data] = await db
    .update(psicoId)
    .set(updatedData)
    .where(eq(psicoId.userId, user.id))
    .returning();

  return filteredLinks;
};
