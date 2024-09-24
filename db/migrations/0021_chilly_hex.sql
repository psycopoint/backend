CREATE TABLE IF NOT EXISTS "auth"."verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" bigint NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
