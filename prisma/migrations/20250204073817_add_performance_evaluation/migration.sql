/*
  Warnings:

  - You are about to drop the column `appraisal` on the `Performance` table. All the data in the column will be lost.
  - You are about to drop the column `kpiWeightage` on the `Performance` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedBy` on the `Performance` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Performance` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'SUPERVISOR_REVIEW', 'HR_REVIEW', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Performance" DROP CONSTRAINT "Performance_reviewedBy_fkey";

-- AlterTable
ALTER TABLE "Performance" DROP COLUMN "appraisal",
DROP COLUMN "kpiWeightage",
DROP COLUMN "reviewedBy",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "KPITemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPITemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPICriteria" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL,
    "templateId" INTEGER NOT NULL,

    CONSTRAINT "KPICriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceEvaluation" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "supervisorId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "hrComments" TEXT,
    "supervisorComments" TEXT,
    "finalScore" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIEvaluation" (
    "id" SERIAL NOT NULL,
    "criteriaId" INTEGER NOT NULL,
    "evaluationId" INTEGER NOT NULL,
    "supervisorRating" DOUBLE PRECISION,
    "hrRating" DOUBLE PRECISION,
    "comments" TEXT,

    CONSTRAINT "KPIEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationNotification" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KPICriteria" ADD CONSTRAINT "KPICriteria_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "KPITemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "KPITemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIEvaluation" ADD CONSTRAINT "KPIEvaluation_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "KPICriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIEvaluation" ADD CONSTRAINT "KPIEvaluation_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "PerformanceEvaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationNotification" ADD CONSTRAINT "EvaluationNotification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
