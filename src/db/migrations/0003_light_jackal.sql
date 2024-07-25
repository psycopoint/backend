ALTER TABLE "clinics" ALTER COLUMN "id" SET DEFAULT 'm1i0bg0blkb4o7upwwr6cqoo';--> statement-breakpoint
ALTER TABLE "psychologists" ALTER COLUMN "id" SET DEFAULT 'qkd45pz0nfsag7mfixoazy7t';--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN IF EXISTS "email";--> statement-breakpoint
ALTER TABLE "clinics" DROP COLUMN IF EXISTS "password";