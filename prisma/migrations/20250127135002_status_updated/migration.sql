/*
  Warnings:

  - You are about to drop the column `hrStatus` on the `Leave` table. All the data in the column will be lost.
  - You are about to drop the column `leadStatus` on the `Leave` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Leave" DROP COLUMN "hrStatus",
DROP COLUMN "leadStatus";
