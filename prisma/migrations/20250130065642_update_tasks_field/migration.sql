/*
  Warnings:

  - The `tasks` column on the `Onboarding` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Onboarding" DROP COLUMN "tasks",
ADD COLUMN     "tasks" TEXT[];
