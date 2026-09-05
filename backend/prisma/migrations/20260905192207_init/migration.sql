-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('Processing', 'Suceess', 'Failure');

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "output" TEXT,
    "status" "SubmissionStatus" NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);
