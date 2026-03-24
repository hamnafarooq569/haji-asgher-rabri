/*
  Warnings:

  - You are about to drop the column `priceAtPurchase` on the `orderitem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropIndex
DROP INDEX `OrderItem_orderId_variantId_key` ON `orderitem`;

-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `priceAtPurchase`,
    ADD COLUMN `addonsTotalSnapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `lineTotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `productPriceSnapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `unitPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `variantPriceSnapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `basePrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `compareAt` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `OrderItemAddon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemId` INTEGER NOT NULL,
    `addonId` INTEGER NOT NULL,
    `addonNameSnapshot` VARCHAR(191) NOT NULL,
    `addonPriceSnapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderItemAddon_orderItemId_idx`(`orderItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItemAddon` ADD CONSTRAINT `OrderItemAddon_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;