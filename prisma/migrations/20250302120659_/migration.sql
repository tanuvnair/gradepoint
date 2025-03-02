/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Account` table. All the data in the column will be lost.
  - The primary key for the `Authenticator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Authenticator` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Session` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Account_provider_providerAccountId_key";

-- DropIndex
DROP INDEX "Authenticator_userId_credentialID_key";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("provider", "providerAccountId");

-- AlterTable
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ADD CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId", "credentialID");

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token");

-- DropIndex
DROP INDEX "VerificationToken_identifier_token_key";
