import { Session, User } from "lucia";

export type Bindings = {
  PROJECT_NAME: string;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  BACKEND_URL: string;
  DOMAIN: string;
  JWT_SECRET_KEY: string;
  LOGO_URL: string;

  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  RESEND_API_KEY: string;
  SESSION_SECRET: string;
  SESSEION_DURATION: number;

  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_ACCOUNT_ID: string;
  DEFAULT_UPLOAD_SIZE: number;

  STRIPE_API_KEY: string;
  STRIPE_WEBHOOK_SECRET_KEY: string;
  STRIPE_ACCOUNT_ID: string;

  TWILLIO_ACCOUNT_SID: string;
  TWILLIO_AUTH_TOKEN: string;
};

export type Variables = {
  user: User | null;
  session: Session | null;
};
