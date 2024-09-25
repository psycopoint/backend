import { insertDocumentSchema } from "@db/schemas/public/documents";
import {
  createDocumentService,
  deleteDocumentService,
  getDocumentsService,
  updateDocumentService,
} from "@src/documents/documents.services";
import { handleError } from "@utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { init } from "@paralleldrive/cuid2";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";
import { z } from "zod";

import { createDocumentPdf } from "@utils/documents";
import { getUserDataService } from "@src/users/users.services";
import { convertTextualValue } from "@utils/money";
import { events } from "@db/schemas";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";
import { Address } from "@type/patients";

const factory = createFactory();

// GENERATE DOCUMENT PDF
export const generatePdf = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      documentType: z.enum([
        "diagram",
        "receipt",
        "document",
        "certificate",
        "declaration",
        "fowarding",
        "other",
      ]),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const user = await getUserDataService(c, db);

    const { documentType } = c.req.valid("param");
    const values = await c.req.json();

    // get the event from values.data.eventId
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, values.document.data.eventId));

    // create the PDF
    let pdf;
    const patientGender = values.patient.gender;

    const genderFormat = (gender: string, type: "portador" | "psicologo") => {
      switch (type) {
        case "portador":
          if (gender === "male") return "portador";
          if (gender === "female") return "portadora";
          if (gender === "other") return "portador(a)";
          break;
        case "psicologo":
          if (gender === "male") return "psicólogo";
          if (gender === "female") return "psicóloga";
          if (gender === "other") return "psicólogo(a)";
          break;
      }
    };

    switch (documentType) {
      case "document":
        pdf = await createDocumentPdf({
          content: {
            text: "",
            title: "Documento XYZ",
            city:
              (user.addressInfo as Address).city || "________________________",
            crp: user.crp || "________________________",
            name: user.name || "________________________",
          },
        });
        break;

      case "receipt":
        const receiptText = `Eu ${user.name}, ${genderFormat(
          user.gender as string,
          "portador"
        )} do CPF: ${user.cpf} | recebi de ${values.patient.firstName} ${
          values.patient.lastName
        }, ${genderFormat(patientGender as string, "portador")} do CPF: ${
          values.patient.cpf
        } | a importância de R$ ${
          values.document.data.amount
        } (${convertTextualValue(values.document.data.amount)}) | ${
          values.document.data.description
        }`;

        pdf = await createDocumentPdf({
          content: {
            text: receiptText,
            title: "Recibo de Sessão",
            city: (user.addressInfo as Address).city || "___________",
            crp: user.crp || "___________",
            name: user.name || "___________",
          },
        });
        break;

      case "certificate":
        const certificateText = `Eu ${user.name}, ${genderFormat(
          user.gender as string,
          "psicologo"
        )} com registro no CRP: ${user.crp}, | atesto que ${
          values.patient.firstName
        } ${values.patient.lastName}, ${genderFormat(
          patientGender as string,
          "portador"
        )} do CPF: ${
          values.patient.cpf
        }, | compareceu ao atendimento psicológico no dia ${dayjs(
          event.start
        ).format(
          "DD/MM/YYYY"
        )}, e necessita de afastamento | de suas atividades laborais por ${
          values.document.data.daysOff
        } ${
          parseInt(values.document.data.daysOff) === 1 ? "dia" : "dias"
        }, devido a ${values.document.data.description}.`;
        pdf = await createDocumentPdf({
          content: {
            text: certificateText,
            title: "Declaração de Horas",
            city: (user.addressInfo as Address).city || "___________",
            crp: user.crp || "___________",
            name: user.name || "___________",
          },
        });
        break;

      case "declaration":
        const declarationText = `Eu ${user.name}, ${genderFormat(
          user.gender as string,
          "psicologo"
        )} com registro no CRP ${user.crp}, | declaro que ${
          values.patient.firstName
        } ${values.patient.lastName}, ${genderFormat(
          patientGender as string,
          "portador"
        )} do CPF: ${
          values.patient.cpf
        }, | compareceu ao atendimento psicológico na ${dayjs(
          event.start
        ).format("dddd, [dia] DD [de] YYYY")} das ${dayjs(event.start).format(
          "hh:mmA"
        )} às ${dayjs(event.end).format("hh:mmA")}.`;
        pdf = await createDocumentPdf({
          content: {
            text: declarationText,
            title: "Declaração de Comparecimento",
            city: (user.addressInfo as Address).city || "___________",
            crp: user.crp || "___________",
            name: user.name || "___________",
          },
        });
        break;

      case "fowarding":
        console.log(values);
        const fowardingText = `Ao convênio, Solicito a avaliação de um ${values.document.data.fowardTo} | para o(a) paciente ${values.patient.firstName} ${values.patient.lastName}, portador(a) do CPF ${values.patient.cpf}, | encontra-se em tratamento psicológico e tem como hipótese diagnóstica o CID ${values.document.data.cid}.`;
        pdf = await createDocumentPdf({
          content: {
            text: fowardingText,
            title: "Encaminhamento de Paciente",
            city: (user.addressInfo as Address).city || "___________",
            crp: user.crp || "___________",
            name: user.name || "___________",
          },
        });

        break;
    }

    // TODO: verify this error
    return c.body(pdf as any, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="document.pdf"',
    });
  }
);

// GET ALL DOCUMENTS BY PATIENT ID
export const getDocuments = factory.createHandlers(
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

    try {
      const data = await getDocumentsService(c, db, patientId);

      return c.json({ message: "success", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// GET DOCUMENT BY ID
export const getDocument = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      documentId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { documentId } = c.req.valid("param");

    try {
      const data = await getDocumentsService(c, db, documentId);

      return c.json({ message: "success", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// CREATE DOCUMENT
export const createDocument = factory.createHandlers(
  zValidator(
    "json",
    insertDocumentSchema.pick({
      data: true,
      description: true,
      patientId: true,
      title: true,
      documentType: true,
      fileType: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const user = c.get("user");
    if (!user) {
      throw new Error("Unauthorized");
    }

    const values = c.req.valid("json");

    const createId = init({
      length: 10,
    });

    try {
      const data = await createDocumentService(c, db, {
        ...values,
        id: createId(),
        psychologistId: user.id,
      });

      return c.json({ message: "susccess", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// DELETE DOCUMENT
export const deleteDocument = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      documentId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { documentId } = c.req.valid("param");

    try {
      const data = await deleteDocumentService(c, db, documentId);

      return c.json({ message: "success" });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// UPDATE DOCUMENT
export const updateDocument = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      documentId: z.string(),
    })
  ),
  zValidator(
    "json",
    insertDocumentSchema.pick({
      data: true,
      description: true,
      patientId: true,
      psychologistId: true,
      title: true,
      documentType: true,
      fileType: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { documentId } = c.req.valid("param");
    const values = c.req.valid("json");

    const createId = init({
      length: 10,
    });

    try {
      const data = await updateDocumentService(c, db, documentId, {
        ...values,
        id: documentId,
      });

      return c.json({ message: "success", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);
