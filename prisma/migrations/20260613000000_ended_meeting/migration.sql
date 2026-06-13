-- CreateTable
CREATE TABLE "EndedMeeting" (
    "code" TEXT NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EndedMeeting_pkey" PRIMARY KEY ("code")
);
