/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.
  - Added the required column `customerName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `altMobile` VARCHAR(30) NULL,
    ADD COLUMN `customerName` VARCHAR(120) NOT NULL,
    ADD COLUMN `deliveryAddress` VARCHAR(500) NOT NULL,
    ADD COLUMN `deliveryNotes` TEXT NULL,
    ADD COLUMN `email` VARCHAR(190) NULL,
    ADD COLUMN `mobile` VARCHAR(30) NOT NULL,
    ADD COLUMN `nearestLandmark` VARCHAR(190) NULL,
    ADD COLUMN `paymentMethod` ENUM('CASH', 'CARD', 'ONLINE') NOT NULL DEFAULT 'CASH',
    MODIFY `status` ENUM('RECEIVED', 'CONFIRMED', 'COOKING', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'RECEIVED';
