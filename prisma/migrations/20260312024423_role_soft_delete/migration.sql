-- AlterTable
ALTER TABLE `role` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `sitesetting` ADD COLUMN `isTemporarilyClosed` BOOLEAN NOT NULL DEFAULT false;
