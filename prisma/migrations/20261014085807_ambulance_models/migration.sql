/*
  Warnings:

  - You are about to drop the column `passwordChangeAt` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AmbulanceStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "AmbulanceType" AS ENUM ('BASIC', 'ADVANCED_LIFE_SUPPORT', 'NEONATAL', 'PATIENT_TRANSPORT', 'FREEZER', 'AIR_AMBULANCE');

-- CreateEnum
CREATE TYPE "EmergencyPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('REQUESTED', 'VERIFIED', 'ASSIGNED', 'EN_ROUTE', 'PICKED_UP', 'AT_HOSPITAL', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('ASSIGNED', 'EN_ROUTE', 'PICKED_UP', 'AT_HOSPITAL', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('SSLCOMMERZ', 'STRIPE', 'BKASH');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "passwordChangeAt",
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ambulances" (
    "id" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufacturer" TEXT,
    "year" INTEGER,
    "type" "AmbulanceType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "AmbulanceStatus" NOT NULL DEFAULT 'OFFLINE',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "baseFare" DECIMAL(12,2) NOT NULL,
    "perKmFare" DECIMAL(12,2) NOT NULL,
    "lastLocationAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambulances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ambulances_licensePlate_key" ON "ambulances"("licensePlate");

-- CreateIndex
CREATE INDEX "ambulances_status_deletedAt_idx" ON "ambulances"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "ambulances_type_status_idx" ON "ambulances"("type", "status");
