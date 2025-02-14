/*
  Warnings:

  - Added the required column `appraisal` to the `Performance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kpiWeightage` to the `Performance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Performance" ADD COLUMN     "appraisal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "kpiWeightage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "reviewedBy" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Pending';

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
