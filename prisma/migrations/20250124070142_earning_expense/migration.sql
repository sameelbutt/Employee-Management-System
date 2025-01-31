-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('OPERATING_COST', 'EMPLOYEE_BENEFITS', 'OFFICE_RENT', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "EarningType" AS ENUM ('PRODUCT_SALES', 'SERVICE_INCOME', 'INVESTMENT', 'OTHER');

-- CreateTable
CREATE TABLE "Earnings" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "earningType" "EarningType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarningSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "EarningSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expenses" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseType" "ExpenseType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EarningSource_name_key" ON "EarningSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON "ExpenseCategory"("name");

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "EarningSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
