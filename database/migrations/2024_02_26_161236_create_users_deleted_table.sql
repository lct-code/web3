--
-- Table structure for table `users_deleted`
--

DROP TABLE IF EXISTS `users_deleted`;
CREATE TABLE `users_deleted` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  `deleted_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
);
