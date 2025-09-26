DROP INDEX "public"."User_email_key";

ALTER TABLE "public"."User" DROP COLUMN "email",
ADD COLUMN     "sessionId" TEXT NOT NULL;

ALTER TABLE "public"."Vote" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "User_sessionId_key" ON "public"."User"("sessionId");
