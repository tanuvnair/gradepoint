/*
  Warnings:

  - The values [MULTIPLE_ANSWER,TRUE_FALSE,ESSAY,MATCHING,FILL_IN_BLANK,NUMERIC] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `accessCode` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `Question` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('MULTIPLE_CHOICE', 'SHORT_ANSWER', 'OPEN_ENDED', 'CODE_BASED');
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "accessCode",
DROP COLUMN "instructions";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "explanation";
