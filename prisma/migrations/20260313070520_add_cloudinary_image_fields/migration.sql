-- AlterTable
ALTER TABLE `addon` ADD COLUMN `imagePublicId` VARCHAR(255) NULL,
    ADD COLUMN `imageUrl` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `imagePublicId` VARCHAR(255) NULL;
