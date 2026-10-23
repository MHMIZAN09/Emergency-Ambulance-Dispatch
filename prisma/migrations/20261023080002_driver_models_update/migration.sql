/*
  Warnings:

  - The primary key for the `drivers` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "drivers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "drivers_id_seq";

-- CreateIndex
CREATE INDEX "drivers_email_idx" ON "drivers"("email");
