import { User, Session } from "@auth/core/types";

declare module "@auth/core/types" {
  interface User {
    userType?: "psychologist" | "clinic";
  }

  interface Session {
    user: {
      id: string;
      userType?: "psychologist" | "clinic";
    } & Session["user"];
  }
}
