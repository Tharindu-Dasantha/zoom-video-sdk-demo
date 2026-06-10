-- CreateTable
CREATE TABLE "TestimonialLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestimonialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "uploadUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "zoomSessionId" TEXT,
    "durationSec" INTEGER,
    "fileSizeMB" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestimonialLink_token_key" ON "TestimonialLink"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Recording_linkId_key" ON "Recording"("linkId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "TestimonialLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

