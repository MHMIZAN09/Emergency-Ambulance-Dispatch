/*
  Warnings:

  - The `bloodGroup` column on the `emergency_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- AlterTable
ALTER TABLE "emergency_requests" DROP COLUMN "bloodGroup",
ADD COLUMN     "bloodGroup" "BloodGroup";
