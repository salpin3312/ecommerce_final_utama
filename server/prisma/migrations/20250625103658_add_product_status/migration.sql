/*
  Warnings:

  - Added the required column `updated_at` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
