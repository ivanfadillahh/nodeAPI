-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 12, 2021 at 07:54 AM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nodejs`
--

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `id` int(11) NOT NULL,
  `event_name` varchar(100) DEFAULT NULL,
  `device` varchar(50) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `password` text NOT NULL,
  `role` bigint(20) NOT NULL DEFAULT 2,
  `date_created` timestamp NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT current_timestamp(),
  `token` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `date_created`, `last_login`, `token`) VALUES
(1, 'Super Admin', 'admin@node.com', 'ff9830c42660c1dd1942844f8069b74a', 1, '2021-09-25 09:14:17', '2021-09-25 17:28:43', 'g3QB6KAoypFYIZYIO4XA0'),
(2, 'Technical', 'tech@node.com', 'ff9830c42660c1dd1942844f8069b74a', 2, '2021-09-25 09:14:43', '2021-09-25 17:28:13', NULL),
(4, 'Tester', 'tester@node.com', 'ff9830c42660c1dd1942844f8069b74a', 2, '2021-09-25 12:05:41', '2021-09-25 17:27:40', NULL),
(7, 'Tester', 'tester2@node.com', 'ff9830c42660c1dd1942844f8069b74a', 2, '2021-09-25 17:26:37', '2021-09-25 17:28:30', 'YwVoQxrQECkCKA8KiBIoq'),
(9, 'QA-Technical', 'qa_tech@node.com', 'ff9830c42660c1dd1942844f8069b74a', 2, '2021-09-25 17:29:46', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `log`
--
ALTER TABLE `log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
