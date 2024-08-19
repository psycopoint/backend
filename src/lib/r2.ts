import { S3Client } from "@aws-sdk/client-s3";
import { Context } from "hono";

export const createR2Client = (c: Context) => {
  return new S3Client({
    region: "auto",
    endpoint: `https://${c.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: c.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: c.env.R2_SECRET_ACCESS_KEY!,
    },
  });
};
