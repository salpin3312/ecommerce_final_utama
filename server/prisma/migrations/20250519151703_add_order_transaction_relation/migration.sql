-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
