-- AlterTable
ALTER TABLE `product` ADD COLUMN `discount_end_date` DATETIME(3) NULL,
    ADD COLUMN `discount_percentage` DECIMAL(5, 2) NULL,
    ADD COLUMN `discount_start_date` DATETIME(3) NULL,
    ADD COLUMN `is_discount_active` BOOLEAN NOT NULL DEFAULT false;
