/*
  Warnings:

  - You are about to alter the column `refundAmount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "refundAmount" SET DATA TYPE DECIMAL(10,2);
