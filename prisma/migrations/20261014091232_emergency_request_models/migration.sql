-- CreateTable
CREATE TABLE "emergency_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientAge" INTEGER,
    "bloodGroup" TEXT,
    "description" TEXT NOT NULL,
    "priority" "EmergencyPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "EmergencyStatus" NOT NULL DEFAULT 'REQUESTED',
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION NOT NULL,
    "puickupLng" DOUBLE PRECISION NOT NULL,
    "hospitalId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emergency_requests_userId_status_deletedAt_idx" ON "emergency_requests"("userId", "status", "deletedAt");

-- AddForeignKey
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
