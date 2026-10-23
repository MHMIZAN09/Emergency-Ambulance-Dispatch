-- CreateEnum
CREATE TYPE "HospitalStatus" AS ENUM ('OPEN', 'CLOSED', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "HospitalStatus" NOT NULL DEFAULT 'OPEN',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_phone_key" ON "hospitals"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_email_key" ON "hospitals"("email");

-- CreateIndex
CREATE INDEX "hospitals_name_idx" ON "hospitals"("name");

-- CreateIndex
CREATE INDEX "hospitals_status_deletedAt_idx" ON "hospitals"("status", "deletedAt");
