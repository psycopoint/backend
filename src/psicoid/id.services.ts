import {
  InsertLink,
  InsertPsicoId,
  InsertPsicoIdLead,
  SelectLink,
  SelectPsicoId,
  SelectPsicoIdLead,
  SelectPsychologist,
  SelectUser,
  TPsicoIdLinks,
  psicoId,
  psychologists,
  subscriptions,
  users,
} from "@db/schemas";
import { init } from "@paralleldrive/cuid2";
import { and, eq, getTableColumns } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

// get psicoId
export const getPsicoIdService = async (
  c: Context,
  db: NeonHttpDatabase,
  userTag?: string
): Promise<{
  user: Partial<SelectPsychologist & SelectUser>;
  psicoId: SelectPsicoId;
}> => {
  const user = c.get("user") as SelectUser;

  if (!user && !userTag) {
    throw new Error("User not authenticated and no userTag provided");
  }

  let data: {
    user: Partial<SelectPsychologist & SelectUser>;
    psicoId: SelectPsicoId;
  };

  // REST FROM USERS & PSYCHOLOGIST TABLES
  const { password, ...userRest } = getTableColumns(users);
  const { addressInfo, cpf, preferences, ...psychologistRest } =
    getTableColumns(psychologists);

  // get the psicoId data based on the provided userTag or logged-in user
  const [psicoIdDb] = await db
    .select()
    .from(psicoId)
    .where(
      userTag ? eq(psicoId.userTag, userTag) : eq(psicoId.userId, user.id)
    );

  if (!psicoIdDb || !psicoIdDb.enabled) {
    if (!user) {
      throw new Error("Not found");
    }
  }

  // find user subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, psicoIdDb.userId));

  if (!subscription) {
    throw new Error("Unauthorized");
  }

  // IF THE USER IS LOGGED IN
  if (user) {
    const [userDb] = await db
      .select({
        ...userRest,
      })
      .from(users)
      .where(eq(users.id, user.id));

    const [psychologistDb] = await db
      .select({
        ...psychologistRest,
      })
      .from(psychologists)
      .where(eq(psychologists.userId, user.id));

    data = {
      user: {
        ...userDb,
        ...psychologistDb,
      },
      psicoId: psicoIdDb,
    };

    return data;
  } else {
    const [userDb] = await db
      .select({
        ...userRest,
      })
      .from(users)
      .where(eq(users.id, psicoIdDb.userId));

    const [psychologistDb] = await db
      .select({
        ...psychologistRest,
      })
      .from(psychologists)
      .where(eq(psychologists.userId, psicoIdDb.userId));

    data = {
      user: {
        ...userDb,
        ...psychologistDb,
      },
      psicoId: psicoIdDb,
    };

    return data;
  }
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

// upadte psicoId
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

  if (!values || !userTag) {
    throw new Error("Missing body");
  }

  const [data] = await db
    .update(psicoId)
    .set(values)
    .where(and(eq(psicoId.userId, user.id), eq(psicoId.userTag, userTag)))
    .returning();

  return data;
};

// validate userTag
export const validateUserTagService = async (
  c: Context,
  db: NeonHttpDatabase,
  userTag: string
): Promise<boolean> => {
  const user = c.get("user") as SelectUser;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!userTag) {
    throw new Error("Missing body");
  }

  // search the current suer tag
  const [existing] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userTag, userTag));

  if (existing) return false;

  return true;
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
    clickCount: 0,
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

// update a new link
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

  const links = existing.links ?? [];

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

// add a new link
export const updateClickCountService = async (
  c: Context,
  db: NeonHttpDatabase,
  linkId: string,
  userTag: string
): Promise<SelectLink> => {
  if (!linkId) {
    throw new Error("Missing body");
  }

  // get current links
  const [existing] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userTag, userTag));

  const links = existing.links ?? [];

  // find the link to update
  const linkIndex = links.findIndex((link) => link.id === linkId);
  if (linkIndex === -1) {
    throw new Error("Link not found");
  }

  // update the link with the new values
  const updatedLink = {
    ...links[linkIndex],
    clickCount: (links[linkIndex].clickCount as number) + 1,
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
    .where(eq(psicoId.userTag, userTag))
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

// LEADS

// add a new lead
export const createLeadService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertPsicoIdLead,
  userTag: string
): Promise<InsertPsicoIdLead> => {
  if (!values) {
    throw new Error("Missing body");
  }

  const createId = init({
    length: 14,
  });

  // get current leads
  const [existing] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userTag, userTag));
  const leads = existing.leads || [];

  const newLead: InsertPsicoIdLead = {
    ...values,
    id: createId(),
    status: "new",
  };

  const updatedData: InsertPsicoId = {
    ...existing,
    leads: [...leads, newLead],
  };

  const [data] = await db
    .update(psicoId)
    .set(updatedData)
    .where(eq(psicoId.userTag, userTag))
    .returning();

  return newLead;
};

// update lead
export const updateLeadService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertPsicoIdLead,
  leadId: string
): Promise<InsertPsicoIdLead> => {
  const user = c.get("user") as SelectUser;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!leadId || !values) {
    throw new Error("Missing body");
  }

  // get current links
  const [existing] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userId, user.id));

  const leads = existing.leads ?? [];

  // find the link to update
  const leadIndex = leads.findIndex((lead) => lead.id === leadId);
  if (leadIndex === -1) {
    throw new Error("Lead not found");
  }

  // update the link with the new values
  const updatedLead = {
    ...leads[leadIndex],
    ...values,
  };

  // replace the old link with the updated link
  leads[leadIndex] = updatedLead;

  const updatedData: InsertPsicoId = {
    ...existing,
    leads: leads,
  };

  const [data] = await db
    .update(psicoId)
    .set(updatedData)
    .where(eq(psicoId.userId, user.id))
    .returning();

  return updatedLead;
};

// delete a lead
export const deleteLeadService = async (
  c: Context,
  db: NeonHttpDatabase,
  leadId: string
): Promise<SelectPsicoIdLead[]> => {
  const user = c.get("user") as SelectUser;
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!leadId) {
    throw new Error("Missing body");
  }

  // get current leads
  const [existing] = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userId, user.id));

  const leads = existing.leads || [];
  const filteredLeads = leads.filter((leads) => leads.id !== leadId);

  const updatedData: InsertPsicoId = {
    ...existing,
    leads: filteredLeads,
  };

  const [data] = await db
    .update(psicoId)
    .set(updatedData)
    .where(eq(psicoId.userId, user.id))
    .returning();

  return filteredLeads;
};
