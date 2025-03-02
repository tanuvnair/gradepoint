/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Authenticator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,credentialID]` on the table `Authenticator` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Account` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Authenticator` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Session` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Organization_ownerId_key";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_userId_credentialID_key" ON "Authenticator"("userId", "credentialID");
