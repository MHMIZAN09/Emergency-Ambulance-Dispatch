/*
  Warnings:

  - You are about to drop the column `puickupLng` on the `emergency_requests` table. All the data in the column will be lost.
  - Added the required column `pickupLng` to the `emergency_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emergency_requests" DROP COLUMN "puickupLng",
ADD COLUMN     "pickupLng" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "dispatches" (
    "id" TEXT NOT NULL,
    "emergencyId" TEXT NOT NULL,
    "ambulanceId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "status" "DispatchStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enRouteAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispatches_emergencyId_key" ON "dispatches"("emergencyId");

-- CreateIndex
CREATE INDEX "dispatches_emergencyId_ambulanceId_status_idx" ON "dispatches"("emergencyId", "ambulanceId", "status");

-- CreateIndex
CREATE INDEX "dispatches_assignedById_idx" ON "dispatches"("assignedById");

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "emergency_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "ambulances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
