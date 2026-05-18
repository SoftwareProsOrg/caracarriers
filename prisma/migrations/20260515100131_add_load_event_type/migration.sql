-- CreateEnum
CREATE TYPE "LoadEventType" AS ENUM ('STATUS_CHANGE', 'CHECK_CALL', 'NOTE', 'CARRIER_ASSIGNED', 'DOCUMENT_UPLOADED');

-- AlterTable
ALTER TABLE "load_events" ADD COLUMN     "event_type" "LoadEventType" NOT NULL DEFAULT 'STATUS_CHANGE',
ADD COLUMN     "user_id" TEXT;
