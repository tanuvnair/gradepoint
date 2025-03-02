-- DropIndex
DROP INDEX "ExamAttempt_userId_examId_idx";

-- DropIndex
DROP INDEX "ExamSection_examId_idx";

-- DropIndex
DROP INDEX "Question_sectionId_idx";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Exam_creatorId_idx" ON "Exam"("creatorId");

-- CreateIndex
CREATE INDEX "Exam_publishedAt_idx" ON "Exam"("publishedAt");

-- CreateIndex
CREATE INDEX "Exam_startDate_endDate_idx" ON "Exam"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "ExamAttempt_userId_idx" ON "ExamAttempt"("userId");

-- CreateIndex
CREATE INDEX "ExamAttempt_examId_idx" ON "ExamAttempt"("examId");

-- CreateIndex
CREATE INDEX "ExamAttempt_submittedAt_idx" ON "ExamAttempt"("submittedAt");

-- CreateIndex
CREATE INDEX "ExamResponse_isCorrect_idx" ON "ExamResponse"("isCorrect");

-- CreateIndex
CREATE INDEX "ExamSection_examId_order_idx" ON "ExamSection"("examId", "order");

-- CreateIndex
CREATE INDEX "Invite_organizationId_idx" ON "Invite"("organizationId");

-- CreateIndex
CREATE INDEX "Invite_expiresAt_idx" ON "Invite"("expiresAt");

-- CreateIndex
CREATE INDEX "Organization_ownerId_idx" ON "Organization"("ownerId");

-- CreateIndex
CREATE INDEX "Question_sectionId_order_idx" ON "Question"("sectionId", "order");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");

-- CreateIndex
CREATE INDEX "UserOrganization_role_idx" ON "UserOrganization"("role");
