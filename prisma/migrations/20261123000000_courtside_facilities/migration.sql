-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "pricePerHour" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- Preserve existing bookings by migrating each item to a facility.
INSERT INTO "facilities" ("id", "name", "sport", "pricePerHour", "createdAt", "updatedAt")
SELECT 'migrated_' || "id", "name", 'Other', 0, "createdAt", "updatedAt" FROM "items";

-- AlterTable
ALTER TABLE "bookings"
ADD COLUMN "facilityId" TEXT,
ADD COLUMN "date" TIMESTAMP(3),
ADD COLUMN "startTime" INTEGER,
ADD COLUMN "duration" INTEGER;

UPDATE "bookings"
SET
    "facilityId" = 'migrated_' || "itemId",
    "date" = "startDate",
    "startTime" = EXTRACT(HOUR FROM "startDate")::INTEGER,
    "duration" = GREATEST(1, LEAST(5, CEIL(EXTRACT(EPOCH FROM ("endDate" - "startDate")) / 3600)::INTEGER));

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_itemId_fkey";

-- DropIndex
DROP INDEX "bookings_itemId_startDate_endDate_idx";

-- AlterTable
ALTER TABLE "bookings"
DROP COLUMN "itemId",
DROP COLUMN "startDate",
DROP COLUMN "endDate",
ALTER COLUMN "facilityId" SET NOT NULL,
ALTER COLUMN "date" SET NOT NULL,
ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "duration" SET NOT NULL;

-- DropTable
DROP TABLE "items";

-- CreateIndex
CREATE INDEX "facilities_sport_idx" ON "facilities"("sport");

-- CreateIndex
CREATE INDEX "bookings_userId_date_idx" ON "bookings"("userId", "date");

-- CreateIndex
CREATE INDEX "bookings_facilityId_date_status_idx" ON "bookings"("facilityId", "date", "status");

-- CreateIndex
CREATE INDEX "bookings_status_date_idx" ON "bookings"("status", "date");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
