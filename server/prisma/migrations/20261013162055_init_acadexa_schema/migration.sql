-- CreateEnum
CREATE TYPE "CognitiveLevel" AS ENUM ('CL1_REMEMBER', 'CL2_UNDERSTAND', 'CL3_APPLY', 'CL4_ANALYZE', 'CL5_EVALUATE', 'CL6_CREATE');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED');

-- CreateEnum
CREATE TYPE "DeptInfoType" AS ENUM ('HOLIDAY', 'EVENT', 'ACHIEVEMENT');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "cognitiveLevel" "CognitiveLevel" NOT NULL DEFAULT 'CL1_REMEMBER',
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "status" "QuestionStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateTable
CREATE TABLE "SyllabusDocument" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "subjectId" TEXT,
    "topicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyllabusDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeptInformation" (
    "id" TEXT NOT NULL,
    "type" "DeptInfoType" NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "targetDept" TEXT NOT NULL DEFAULT 'ALL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeptInformation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SyllabusDocument" ADD CONSTRAINT "SyllabusDocument_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusDocument" ADD CONSTRAINT "SyllabusDocument_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
