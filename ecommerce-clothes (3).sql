-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 30, 2025 at 07:10 AM
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

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `userId`, `productId`, `size`, `quantity`, `created_at`) VALUES
('c9157e1d-c340-45ac-8f61-7643f7337ecf', '15172fbd-f5bb-4386-b36f-75568981d49b', '22649900-9a17-4592-9728-86910bd8eaa4', 'S', 1, '2025-08-29 11:37:45.896');

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
  `status` enum('Menunggu_Konfirmasi','Dikonfirmasi','Dikirim','Sampai','Dibatalkan') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Menunggu_Konfirmasi',
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
('23f3d082-87ab-4fa7-b143-47f92241b628', '15172fbd-f5bb-4386-b36f-75568981d49b', 'Raihan', '08218298298090', 'Tega lega, BANDUNG, 40375', '117000.00', 'Sampai', '2025-08-29 11:23:51.119', '2025-08-29 11:24:47.309', 'REG', '17000.00', 'jne', '2 day'),
('e4040772-2f12-4051-9489-22ffbd805ff5', 'a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'Alfin Naufal Azhali', '082128952805', 'bandung, BANDUNG, 40122', '117000.00', 'Sampai', '2025-08-29 10:09:38.606', '2025-08-29 10:30:18.716', 'REG', '17000.00', 'jne', '2 day');

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
('54a10177-3e41-47f3-9dbe-10d4384291ec', '23f3d082-87ab-4fa7-b143-47f92241b628', '22649900-9a17-4592-9728-86910bd8eaa4', 1, '100000.00'),
('e53a40b2-2e36-4d5c-98a4-062f748cbc3d', 'e4040772-2f12-4051-9489-22ffbd805ff5', '22649900-9a17-4592-9728-86910bd8eaa4', 1, '100000.00');

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
('22649900-9a17-4592-9728-86910bd8eaa4', 'Jonas', 'Baju oversize', '100000.00', 9, '/uploads/1753297020419.jpg', 'ACTIVE', NULL, '2025-07-23 18:57:00.432', '2025-08-29 11:24:32.157'),
('380301b0-a762-42ae-b96a-f15ba21a00f7', 'Jonas', 'lasjdkljajskd', '10000.00', 7, '/uploads/1753245030342.jpg', 'ARCHIVED', '2025-07-23 05:59:25.241', '2025-07-23 04:30:30.381', '2025-07-26 07:20:36.205'),
('ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 'Screamble', 'ALjsdjasldj', '90000.00', 10, '/uploads/1753297043758.jpg', 'ACTIVE', NULL, '2025-07-23 18:57:23.765', '2025-08-29 11:22:19.213');

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
('2d2a6898-229e-4c8f-a06a-61d661fb7a4c', '22649900-9a17-4592-9728-86910bd8eaa4', 'S'),
('46b6c060-8ceb-4ad2-b899-f185794679cd', '22649900-9a17-4592-9728-86910bd8eaa4', 'L'),
('5c75e9b6-4cba-4739-9b1d-b6e29394fd3a', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'M'),
('8c21c5ee-4a82-4ea9-a2b5-19f2c3e417c0', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'XL'),
('9262e0e4-4078-44cd-a336-95e7922fb490', 'ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 'L'),
('a542b1e7-0f51-4d71-83e7-ab41d055176b', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'L'),
('f8c584c1-ed41-41c6-814a-9d46063d9784', '22649900-9a17-4592-9728-86910bd8eaa4', 'M');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`id`, `userId`, `orderId`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
('2a1db208-8d4e-4596-96bd-26493af0478c', 'a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'e4040772-2f12-4051-9489-22ffbd805ff5', 5, 'bagus banget\n', '2025-08-29 10:45:15.085', '2025-08-29 10:45:15.085'),
('ab5fb8ad-df99-4a19-a4b9-d040369fbaf1', '15172fbd-f5bb-4386-b36f-75568981d49b', '23f3d082-87ab-4fa7-b143-47f92241b628', 5, 'Kualitas bajunya bagus, kurirnya juga ramah', '2025-08-29 11:25:07.068', '2025-08-29 11:25:07.068');

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

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `orderId`, `amount`, `paymentType`, `transactionStatus`, `transactionId`, `fraudStatus`, `paymentResponse`, `createdAt`, `updatedAt`) VALUES
('4ff3d159-02fd-4891-af37-76935461e8ad', 'e4040772-2f12-4051-9489-22ffbd805ff5', 117000, 'bank_transfer', 'settlement', '4a10e999-7d58-4de5-ac8a-4530cea754e1', 'accept', '{\"status_code\":\"200\",\"transaction_id\":\"4a10e999-7d58-4de5-ac8a-4530cea754e1\",\"gross_amount\":\"117000.00\",\"currency\":\"IDR\",\"order_id\":\"e4040772-2f12-4051-9489-22ffbd805ff5\",\"payment_type\":\"bank_transfer\",\"signature_key\":\"8a81ec3bc69a37d36049db9ed5611fa018f2167b8474343cd2933043527c1763c2269f1fa000fcb4c9f82db64161b8d71f77a82af7de9371e6796e7bc5fcc0d4\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G050846848\",\"va_numbers\":[{\"bank\":\"bca\",\"va_number\":\"50846848972289713384188\"}],\"payment_amounts\":[],\"transaction_time\":\"2025-08-29 17:09:39\",\"settlement_time\":\"2025-08-29 17:09:50\",\"expiry_time\":\"2025-08-30 17:09:39\"}', '2025-08-29 10:10:04.321', '2025-08-29 10:30:30.876'),
('b4d5b8a3-48a3-4628-89e8-35a2dcee8c1a', '23f3d082-87ab-4fa7-b143-47f92241b628', 117000, 'bank_transfer', 'settlement', '0a9c2a7e-6b67-4ec1-8cc3-eb039ef67c32', 'accept', '{\"status_code\":\"200\",\"transaction_id\":\"0a9c2a7e-6b67-4ec1-8cc3-eb039ef67c32\",\"gross_amount\":\"117000.00\",\"currency\":\"IDR\",\"order_id\":\"23f3d082-87ab-4fa7-b143-47f92241b628\",\"payment_type\":\"bank_transfer\",\"signature_key\":\"d7cd2a2189acc042b89df5991d50e9a208d5baa03356c45a60f2eb5e0ca8f0f93e17951b952422f56aa16fdbd28725735a5d3d538a89d40a1a69b7146d61bd21\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G050846848\",\"va_numbers\":[{\"bank\":\"bca\",\"va_number\":\"50846848807161129779801\"}],\"payment_amounts\":[],\"transaction_time\":\"2025-08-29 18:23:52\",\"settlement_time\":\"2025-08-29 18:24:02\",\"expiry_time\":\"2025-08-30 18:23:52\"}', '2025-08-29 11:24:13.757', '2025-08-29 11:24:13.757');

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
('15172fbd-f5bb-4386-b36f-75568981d49b', 'user2', 'user2@gmail.com', '$2b$10$AGggcPHXpQ33A/oIXtRinOM7qQzWAtHReHFg2s/jW/wG/FFvGBo9K', 'USER', '2025-08-13 13:35:45.663', '2025-08-13 13:35:45.663', NULL, NULL, NULL, NULL),
('832ab7be-3faa-4402-91a1-320f3144fb2d', 'Admin', 'admin@gmail.com', '$2b$10$6zuIdUZpsso41.0jiMrwN.FpnwB8mFSIAT74quHJRTzwSc4uwWbMm', 'ADMIN', '2025-06-26 08:41:23.556', '2025-06-26 11:33:41.703', '08123456789', 'Jl. Contoh No. 1, Jakarta', '1990-01-01 00:00:00.000', NULL),
('a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'contohuser', 'user1@gmail.com', '$2b$10$lA.6r83T.Q/UEFaDrh/oYuzE34oiC7X88WE.6NjWnnx7F8x39M2/q', 'USER', '2025-06-26 15:19:26.665', '2025-08-12 07:59:35.754', '082128952805', 'Bandung', '2002-10-10 00:00:00.000', '/uploads/1753542882757.png');

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
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `review_userId_orderId_key` (`userId`,`orderId`),
  ADD KEY `Review_userId_fkey` (`userId`),
  ADD KEY `Review_orderId_fkey` (`orderId`);

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
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `review_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
