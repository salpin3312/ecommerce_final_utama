/*
  Warnings:

  - You are about to drop the column `size` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cart` ADD COLUMN `size` VARCHAR(50) NOT NULL DEFAULT 'M';

-- AlterTable
ALTER TABLE `product` DROP COLUMN `size`;

-- CreateTable
CREATE TABLE `ProductSize` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `size` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductSize` ADD CONSTRAINT `ProductSize_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
