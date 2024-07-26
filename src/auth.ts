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
  sessions,
  users,
  verificationTokens,
} from "@db/schemas";
import { eq } from "drizzle-orm";
import { psychologists } from "@/db/schemas/public/psychologists";
import { comparePassword } from "./utils/password";
import Resend from "@auth/core/providers/resend";

export const getAuthConfig = (c: Context): AuthConfig => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const jwtSessionConfig = {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    secret: c.env.JWT_SECRET,
  };

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
      Credentials({
        credentials: {
          email: { label: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          // Verifique se as credenciais foram fornecidas
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          console.log(credentials);

          // get user from db using the credentials.email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string));

          if (!user) {
            throw new Error("Usuário não encontrado.");
          }

          //compare password
          const isMatch = await comparePassword(
            credentials.password as string,
            user.password as string
          );

          console.log(isMatch);

          if (!isMatch) {
            throw new Error("Bad credentials");
          }

          // Retorne o objeto do usuário se a autenticação for bem-sucedida
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            userType: user.userType!,
          };
        },
      }),
      Resend({
        from: "suporte@psycohub.com",
        server: "smtp.resend.com",
        name: "Psycohub Team",
      }),
    ],
    events: {
      async createUser({ user }) {
        try {
          // verify if user exist inside db
          const [existing] = await db
            .select()
            .from(psychologists)
            .where(eq(psychologists.userId, user.id!));

          // if user is psychologist create user inside psychologist table
          if (!existing) {
            console.log("user donot exist");
            const data: InsertPsychologist = {
              userId: user.id!,
              image: user.image,
            };

            await db.insert(psychologists).values(data);
            // await db
            //   .insert(clinics)
            //   .values({ ...data, companyName: user.name! });
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
        }
      },
      async updateUser({ user }) {
        console.log("USER UPDATED");
      },
    },
    callbacks: {
      // use this to redirect user after login
      async redirect({ url, baseUrl }) {
        //baseUrl is the back-end url
        //url is the front-end url

        const parsedUrl = new URL(url);
        if (!parsedUrl.pathname.endsWith("/protected")) {
          return `${url}/protected`;
        }
        return url;
      },

      async session({ session, user, token, newSession, trigger }) {
        return session;
      },
    },
    basePath: "/v1/auth",
    session: {
      strategy: "database",
    },
  };
};

export const getAuth = (c: Context) => {
  return c.get("authUser");
};
