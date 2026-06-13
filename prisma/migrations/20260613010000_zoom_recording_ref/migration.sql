-- Recordings now reference Zoom's cloud storage directly instead of being
-- re-uploaded to UploadThing.

-- AlterTable
ALTER TABLE "Recording" ADD COLUMN "downloadToken" TEXT;

-- fileKey is legacy (old UploadThing key); make it optional.
ALTER TABLE "Recording" ALTER COLUMN "fileKey" DROP NOT NULL;
