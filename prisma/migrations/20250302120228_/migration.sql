/*
  Warnings:

  - The primary key for the `VerificationToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[identifier,token]` on the table `VerificationToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ExamAttempt_examId_idx";

-- DropIndex
DROP INDEX "ExamAttempt_userId_idx";

-- AlterTable
ALTER TABLE "VerificationToken" DROP CONSTRAINT "VerificationToken_pkey";

-- CreateIndex
CREATE INDEX "ExamAttempt_userId_examId_idx" ON "ExamAttempt"("userId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
