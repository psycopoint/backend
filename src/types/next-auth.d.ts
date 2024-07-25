import { User, Session, AuthUser } from "@auth/core/types";

declare module "@auth/core/types" {
  interface User {
    userType?: "psychologist" | "clinic" | "admin";
  }

  interface Session {
    user: {
      id: string;
      userType?: "psychologist" | "clinic" | "admin";
    } & Session["user"];
  }
}
