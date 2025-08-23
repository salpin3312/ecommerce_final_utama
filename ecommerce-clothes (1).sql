-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 15, 2025 at 02:48 PM
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
('51ed0182-2849-43df-8c25-3100db507a08', '15172fbd-f5bb-4386-b36f-75568981d49b', 'Rio Agustian', '08122920019809', 'Jl. Lengkong, BANDUNG, 042908', '117000.00', 'Dikonfirmasi', '2025-08-14 12:19:24.944', '2025-08-15 13:49:31.089', 'REG', '17000.00', 'jne', '2 day'),
('966da78f-4e55-41ac-9f9a-ca1d864d457a', '15172fbd-f5bb-4386-b36f-75568981d49b', 'Alfin Naufal Azhali', '082128952805', 'Jl. Suci No. 4, BANDUNG, 40375', '224000.00', 'Sampai', '2025-08-13 13:52:09.981', '2025-08-13 14:00:32.702', 'REG', '34000.00', 'jne', '2 day'),
('aa8d9fe0-9a0f-4dd3-aaa1-c3b5cd780959', 'a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'coba', '082112098301', 'coba, BANDUNG, 213i19', '117000.00', 'Dikonfirmasi', '2025-08-15 13:48:27.722', '2025-08-15 13:49:32.622', 'REG', '17000.00', 'jne', '2 day'),
('ba5cb854-dca1-45a1-a8a4-14cbdc635bfa', 'a4c8ee16-a1c1-4f47-9fe5-f1ab69d87ec6', 'Alfin Naufal Azhali', '921803801809381', 'lajdlsjajl, BANDUNG, 21387189', '107000.00', 'Dikonfirmasi', '2025-08-12 12:09:59.750', '2025-08-15 13:49:28.736', 'REG', '17000.00', 'jne', '2 day');

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
('1acf6d94-2a39-4349-ab76-1545389cbfaf', 'aa8d9fe0-9a0f-4dd3-aaa1-c3b5cd780959', '22649900-9a17-4592-9728-86910bd8eaa4', 1, '100000.00'),
('448a9f05-2294-47ba-a769-f09d7c39529f', '51ed0182-2849-43df-8c25-3100db507a08', '22649900-9a17-4592-9728-86910bd8eaa4', 1, '100000.00'),
('8f84870c-d7c1-40f7-a5b9-e69b7aca79ac', 'ba5cb854-dca1-45a1-a8a4-14cbdc635bfa', 'ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 1, '90000.00'),
('e702572c-1bd3-41b8-97ab-63e791ad0358', '966da78f-4e55-41ac-9f9a-ca1d864d457a', '22649900-9a17-4592-9728-86910bd8eaa4', 1, '100000.00'),
('fa7b450c-26a7-4555-bb43-4b091d264dff', '966da78f-4e55-41ac-9f9a-ca1d864d457a', 'ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 1, '90000.00');

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
('22649900-9a17-4592-9728-86910bd8eaa4', 'Jonas', 'Baju oversize', '100000.00', 2, '/uploads/1753297020419.jpg', 'ACTIVE', NULL, '2025-07-23 18:57:00.432', '2025-08-15 13:49:32.589'),
('380301b0-a762-42ae-b96a-f15ba21a00f7', 'Jonas', 'lasjdkljajskd', '10000.00', 7, '/uploads/1753245030342.jpg', 'ARCHIVED', '2025-07-23 05:59:25.241', '2025-07-23 04:30:30.381', '2025-07-26 07:20:36.205'),
('ba9c8e42-7078-4bf0-aaea-cad15c7eb23b', 'Screamble', 'ALjsdjasldj', '90000.00', 3, '/uploads/1753297043758.jpg', 'ACTIVE', NULL, '2025-07-23 18:57:23.765', '2025-08-15 13:49:28.730');

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
('55da950d-b434-4c11-be83-896c6fb96c89', '22649900-9a17-4592-9728-86910bd8eaa4', 'M'),
('5c75e9b6-4cba-4739-9b1d-b6e29394fd3a', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'M'),
('8c21c5ee-4a82-4ea9-a2b5-19f2c3e417c0', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'XL'),
('93f77ce0-c849-4448-b85b-f12abbb8f8c8', '22649900-9a17-4592-9728-86910bd8eaa4', 'L'),
('a542b1e7-0f51-4d71-83e7-ab41d055176b', '380301b0-a762-42ae-b96a-f15ba21a00f7', 'L'),
('bed1fc37-cc9e-43d0-8b9b-8f2e1c188446', '22649900-9a17-4592-9728-86910bd8eaa4', 'S');

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
('06ac5ef8-a05c-4afa-93b1-5d79df99dda5', '966da78f-4e55-41ac-9f9a-ca1d864d457a', 224000, 'bank_transfer', 'settlement', 'd1e8a79c-c171-410b-bbbc-5d9ace9df1e5', 'accept', '{\"status_code\":\"200\",\"transaction_id\":\"d1e8a79c-c171-410b-bbbc-5d9ace9df1e5\",\"gross_amount\":\"224000.00\",\"currency\":\"IDR\",\"order_id\":\"966da78f-4e55-41ac-9f9a-ca1d864d457a\",\"payment_type\":\"bank_transfer\",\"signature_key\":\"557ce22c7a1a3ac89b640aa7ebfa661129e63c22b96a98a5a641915d55435b172cd7ee6e63b3da97e65426113db8d52f4e19b12bc2f3f397f370dd302359a296\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G050846848\",\"va_numbers\":[{\"bank\":\"bca\",\"va_number\":\"50846848988809769032061\"}],\"payment_amounts\":[],\"transaction_time\":\"2025-08-13 20:53:01\",\"settlement_time\":\"2025-08-13 20:53:56\",\"expiry_time\":\"2025-08-14 20:53:01\"}', '2025-08-13 13:59:11.917', '2025-08-13 13:59:27.471'),
('209ca4d6-c3f9-48c6-a70d-14229e5a2fb5', 'aa8d9fe0-9a0f-4dd3-aaa1-c3b5cd780959', 117000, 'bank_transfer', 'settlement', 'c653ed70-71f6-4cd5-ac7f-3c9187611070', 'accept', '{\"status_code\":\"200\",\"transaction_id\":\"c653ed70-71f6-4cd5-ac7f-3c9187611070\",\"gross_amount\":\"117000.00\",\"currency\":\"IDR\",\"order_id\":\"aa8d9fe0-9a0f-4dd3-aaa1-c3b5cd780959\",\"payment_type\":\"bank_transfer\",\"signature_key\":\"d5c7adac4fd952c32f8bdaf2183ce40a36a38060b7a0b3bd65a6c437f503876a2e026cf7354eb9b541623c301edd58ddaa0c5b5da272afed46898e6f65fbda2a\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G050846848\",\"va_numbers\":[{\"bank\":\"bca\",\"va_number\":\"50846848717603838543045\"}],\"payment_amounts\":[],\"transaction_time\":\"2025-08-15 20:48:29\",\"settlement_time\":\"2025-08-15 20:49:02\",\"expiry_time\":\"2025-08-16 20:48:29\"}', '2025-08-15 13:48:47.246', '2025-08-15 13:49:03.445'),
('8a1eedf9-afd0-4ccf-82ce-e9f814b35394', 'ba5cb854-dca1-45a1-a8a4-14cbdc635bfa', 107000, 'bank_transfer', 'settlement', '7e3e5447-3e44-49a3-9b40-69764af6066d', 'accept', '{\"status_code\":\"200\",\"transaction_id\":\"7e3e5447-3e44-49a3-9b40-69764af6066d\",\"gross_amount\":\"107000.00\",\"currency\":\"IDR\",\"order_id\":\"ba5cb854-dca1-45a1-a8a4-14cbdc635bfa\",\"payment_type\":\"bank_transfer\",\"signature_key\":\"429d0a5887f5fd77bb9d285ba025448cf142552726a75657081184cb7fe9984995a9d94d4eb0831edd8c3f2480202ae9daffde1f7c806313de462aa93d26cdf8\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G050846848\",\"va_numbers\":[{\"bank\":\"bca\",\"va_number\":\"50846848513627963549483\"}],\"payment_amounts\":[],\"transaction_time\":\"2025-08-12 19:10:01\",\"settlement_time\":\"2025-08-12 19:10:30\",\"expiry_time\":\"2025-08-13 19:10:01\"}', '2025-08-12 12:10:16.835', '2025-08-12 12:12:00.285'),
('98801947-2915-4bd1-b719-bebad8f18df9', '51ed0182-2849-43df-8c25-3100db507a08', 117000, 'bank_transfer', 'settlement', '852a3cc8-246f-424c-b784-03d4c6882fc8', 'accept', '{\"status_code\":\"200\",\"transaction_id\":\"852a3cc8-246f-424c-b784-03d4c6882fc8\",\"gross_amount\":\"117000.00\",\"currency\":\"IDR\",\"order_id\":\"51ed0182-2849-43df-8c25-3100db507a08\",\"payment_type\":\"bank_transfer\",\"signature_key\":\"98f6ccb9f018ce857142f75126069b1d5bdc0a190d609e3653418d29c66feeb9d935c8b1493a32deab3720d6896f08a07f37c7cda4d326a7860d47296420f1df\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G050846848\",\"va_numbers\":[{\"bank\":\"bca\",\"va_number\":\"50846848778442156380442\"}],\"payment_amounts\":[],\"transaction_time\":\"2025-08-14 19:20:20\",\"settlement_time\":\"2025-08-14 19:20:41\",\"expiry_time\":\"2025-08-15 19:20:20\"}', '2025-08-14 12:20:35.164', '2025-08-14 12:38:15.187');

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
