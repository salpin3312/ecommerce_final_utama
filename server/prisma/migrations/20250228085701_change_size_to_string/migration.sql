/*
  Warnings:

  - You are about to alter the column `size` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `size` VARCHAR(255) NOT NULL;
