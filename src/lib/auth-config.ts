import { type AuthConfig } from "@hono/auth-js";
import { Context } from "hono";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  InsertClinic,
  InsertPsychologist,
  accounts,
  clinics,
  psychologists,
  sessions,
  users,
  verificationTokens,
} from "../db/schemas";
import { eq } from "drizzle-orm";

export const getAuthConfig = (c: Context): AuthConfig => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return {
    secret: c.env.AUTH_SECRET,
    // remove the line in production
    trustHost: true,
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: [
      Google({
        clientId: c.env.GOOGLE_CLIENT_ID,
        clientSecret: c.env.GOOGLE_CLIENT_SECRET,
      }),
      // Credentials({
      //   credentials: {
      //     username: { label: "Username" },
      //     password: { label: "Password", type: "password" },
      //   },
      //   authorize: async (credentials) => {
      //     // Verifique se as credenciais foram fornecidas
      //     if (!credentials?.username || !credentials?.password) {
      //       return null;
      //     }

      //     // Aqui você deve implementar a lógica para verificar as credenciais
      //     // Por exemplo, buscar o usuário no banco de dados e comparar a senha
      //     const user = {
      //       id: "1",
      //       username: credentials.username,
      //       password: credentials.password,
      //     };

      //     if (!user) {
      //       throw new Error("Usuário não encontrado.");
      //     }

      //     // Retorne o objeto do usuário se a autenticação for bem-sucedida
      //     return user;
      //   },
      // }),
    ],
    callbacks: {
      async signIn({ user }) {
        // verify if user exist inside db
        const [existing] = await db
          .select()
          .from(psychologists)
          .where(eq(psychologists.userId, user.id!));

        // if user is psychologist create user inside psychologist table
        if (!existing && user.userType === "psychologist") {
          const data: InsertPsychologist = {
            userId: user.id!,
            email: user.email!,
            firstName: user.name?.split(" ")[0]!,
            lastName: user.name?.split(" ")[1]!,
            avatar: user.image,
          };
          await db.insert(psychologists).values(data);
        }

        // if user is psychologist create user inside psychologist table
        //TODO: improve this according to clinic fields inside schema db
        if (!existing && user.userType === "clinic") {
          const data: InsertClinic = {
            companyName: user.name!,
            userId: user.id!,
            email: user.email!,
            password: "test",
            logo: user.image,
          };
          await db.insert(clinics).values(data);
        }

        return true;
      },
    },
    basePath: "/v1/auth",
    session: { strategy: "database" },
  };
};

export const getAuth = (c: Context) => {
  return c.get("authUser");
};
