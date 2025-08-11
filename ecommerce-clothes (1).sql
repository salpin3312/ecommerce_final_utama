-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 27, 2025 at 11:32 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce-clothes`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'M',
  `quantity` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('Menunggu_Konfirmasi','Dikonfirmasi','Dikirim','Sampai','Dibatalkan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Menunggu_Konfirmasi',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `shippingService` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shippingCost` decimal(10,2) DEFAULT NULL,
  `courier` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `etd` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`id`, `userId`, `name`, `phone`, `address`, `total_price`, `status`, `created_at`, `updated_at`, `shippingService`, `shippingCost`, `courier`, `etd`) VALUES
('0948934c-be7b-4304-b684-b5b855f0e53d', 'a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'Alfin Naufal Azhali', '082128952805', 'bandung, BANDUNG, 210318', '107000.00', 'Dibatalkan', '2025-07-27 10:49:54.241', '2025-07-27 10:53:33.845', 'REG', '17000.00', 'jne', '2 day'),
('11d7676e-501c-4e6b-8bdf-563460091000', 'a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'Alfin Naufal Azhali', '082128952805', 'bandung, BANDUNG, 082192', '107000.00', 'Dibatalkan', '2025-07-27 11:03:33.652', '2025-07-27 11:28:03.149', 'REG', '17000.00', 'jne', '2 day'),
('2a037475-08b6-48c8-8312-513c1c3eef32', 'a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'tes 1', '082128952805', 'bandung, BANDUNG, 1739179', '107000.00', 'Dibatalkan', '2025-07-27 10:57:21.624', '2025-07-27 10:57:45.107', 'REG', '17000.00', 'jne', '2 day'),
('2a7196aa-0ee1-4b34-a693-17e2f454ba38', 'a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'Alfin Naufal Azhali', '2019830180', 'bandung, BANDUNG, 2918391', '107000.00', 'Menunggu_Konfirmasi', '2025-07-27 11:28:26.343', '2025-07-27 11:28:26.343', 'REG', '17000.00', 'jne', '2 day');

-- --------------------------------------------------------

--
-- Table structure for table `orderitem`
--

CREATE TABLE `orderitem` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderitem`
--

INSERT INTO `orderitem` (`id`, `orderId`, `productId`, `quantity`, `price`) VALUES
('15a53857-8e4e-4881-a5e9-192076d5ebdd', '11d7676e-501c-4e6b-8bdf-563460091000', 'ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 1, '90000.00'),
('6d142d0a-a15a-4abb-9236-e3e54b461804', '0948934c-be7b-4304-b684-b5b855f0e53d', 'ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 1, '90000.00'),
('702d8f28-ff44-4db3-be91-6f4b96d82dbc', '2a7196aa-0ee1-4b34-a693-17e2f454ba38', 'ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 1, '90000.00'),
('d41145c2-1462-4234-9d09-4d231d6fac76', '2a037475-08b6-48c8-8312-513c1c3eef32', 'ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 1, '90000.00');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('DRAFT','ACTIVE','OUT_OF_STOCK','DISCONTINUED','ARCHIVED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `name`, `description`, `price`, `stock`, `image_url`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
('22649900-9a17-4592-9728-86910bd8eaa4', 'Jonas', 'Baju oversize', '100000.00', 0, '/uploads/1753297020419.jpg', 'ACTIVE', NULL, '2025-07-23 18:57:00.432', '2025-07-27 10:20:26.371'),
('380301b0-a762-42ae-b96a-f15ba21a00f7', 'Jonas', 'lasjdkljajskd', '10000.00', 7, '/uploads/1753245030342.jpg', 'ARCHIVED', '2025-07-23 05:59:25.241', '2025-07-23 04:30:30.381', '2025-07-26 07:20:36.205'),
('ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 'Screamble', 'ALjsdjasldj', '90000.00', 17, '/uploads/1753297043758.jpg', 'ACTIVE', NULL, '2025-07-23 18:57:23.765', '2025-07-27 11:28:26.353');

-- --------------------------------------------------------

--
-- Table structure for table `productsize`
--

CREATE TABLE `productsize` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productsize`
--

INSERT INTO `productsize` (`id`, `productId`, `size`) VALUES
('048e8a02-67da-44f0-95c9-b4a913722d08', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'X'),
('35e31aba-837d-499a-8648-61ba0c019b05', 'ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 'L'),
('496813ad-8aa2-4481-a8dd-e04a6865d288', '22649900-9a17-4592-9728-86910bd8eaa4', 'S'),
('5c75e9b6-4cba-4739-9b1d-b6e29394fd3a', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'M'),
('8c21c5ee-4a82-4ea9-a2b5-19f2c3e417c0', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'XL'),
('a542b1e7-0f51-4d71-83e7-ab41d055176b', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'L'),
('b795c541-8bfa-42dd-adcf-55bf52fadd26', '22649900-9a17-4592-9728-86910bd8eaa4', 'L'),
('ed4a88fd-58c9-4dc1-ae3f-16598fca1ca5', '22649900-9a17-4592-9728-86910bd8eaa4', 'M');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `paymentType` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionStatus` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fraudStatus` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentResponse` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('USER','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` datetime(3) DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`, `phone`, `address`, `date_of_birth`, `avatar`) VALUES
('832ab7be-3faa-4402-91a1-320f3144fb2d', 'Admin', 'admin@gmail.com', '$2b$10$6zuIdUZpsso41.0jiMrwN.FpnwB8mFSIAT74quHJRTzwSc4uwWbMm', 'ADMIN', '2025-06-26 08:41:23.556', '2025-06-26 11:33:41.703', '08123456789', 'Jl. Contoh No. 1, Jakarta', '1990-01-01 00:00:00.000', NULL),
('a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'user1', 'user1@gmail.com', '$2b$10$1W5ovYXfb1ZlF8qGKBmdu.B0SuTXJsj3XJhp.a96GGueQFt75ZDvm', 'USER', '2025-06-26 15:19:26.665', '2025-07-27 10:58:07.930', '082128952805', 'Bandung', '2002-10-10 00:00:00.000', '/uploads/1753542882757.png');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('bf9fbfa7-3e16-4a2e-9565-b889d2e7ded4', 'd3f14069c7d6b9fd70848450d7279b13a8ad06e15e6036f6b307f89e0915fd0f', '2025-06-26 08:35:35.275', '20250626083534_init', NULL, NULL, '2025-06-26 08:35:34.223', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Cart_userId_fkey` (`userId`),
  ADD KEY `Cart_productId_fkey` (`productId`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Order_userId_fkey` (`userId`);

--
-- Indexes for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderItem_orderId_fkey` (`orderId`),
  ADD KEY `OrderItem_productId_fkey` (`productId`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `productsize`
--
ALTER TABLE `productsize`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductSize_productId_fkey` (`productId`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_orderId_key` (`orderId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `Cart_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `productsize`
--
ALTER TABLE `productsize`
  ADD CONSTRAINT `ProductSize_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
