-- AlterTable
ALTER TABLE `order` ADD COLUMN `courier` VARCHAR(191) NULL,
    ADD COLUMN `etd` VARCHAR(191) NULL,
    ADD COLUMN `shippingCost` DECIMAL(10, 2) NULL,
    ADD COLUMN `shippingService` VARCHAR(191) NULL;
