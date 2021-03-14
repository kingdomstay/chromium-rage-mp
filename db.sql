-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               10.5.8-MariaDB - mariadb.org binary distribution
-- Операционная система:         Win64
-- HeidiSQL Версия:              11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Дамп структуры базы данных chromium_new
CREATE DATABASE IF NOT EXISTS `chromium_new` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `chromium_new`;

-- Дамп структуры для таблица chromium_new.characters
CREATE TABLE IF NOT EXISTS `characters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `invite_code` varchar(20) DEFAULT NULL,
  `online` bit(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_position` longtext NOT NULL DEFAULT '{"x": -1658.22509765625, "y": 236.318115234375, "z": 62.390960693359375, "xRot": 0, "yRot": 0, "zRot": 0, "dimension": 0}',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `FK_characters_users` (`profile_id`),
  CONSTRAINT `FK_characters_users` FOREIGN KEY (`profile_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='Игровые персонажи';

-- Дамп данных таблицы chromium_new.characters: ~2 rows (приблизительно)
DELETE FROM `characters`;
/*!40000 ALTER TABLE `characters` DISABLE KEYS */;
INSERT INTO `characters` (`id`, `profile_id`, `first_name`, `last_name`, `invite_code`, `online`, `created_at`, `last_position`) VALUES
	(1, 2, 'Test', 'User', NULL, NULL, '2021-03-11 23:14:46', '{"x": -1658.22509765625, "y": 236.318115234375, "z": 62.390960693359375, "xRot": 0, "yRot": 0, "zRot": 0, "dimension": 0}'),
	(2, 2, 'Test2', 'User2', NULL, NULL, '2021-03-11 23:15:01', '{"x": -1658.22509765625, "y": 236.318115234375, "z": 62.390960693359375, "xRot": 0, "yRot": 0, "zRot": 0, "dimension": 0}');
/*!40000 ALTER TABLE `characters` ENABLE KEYS */;

-- Дамп структуры для таблица chromium_new.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` char(60) NOT NULL,
  `email` varchar(50) NOT NULL,
  `social_club` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reg_ip` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `social_club_UNIQUE` (`social_club`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='Список пользователей';

-- Дамп данных таблицы chromium_new.users: ~2 rows (приблизительно)
DELETE FROM `users`;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `password_hash`, `email`, `social_club`, `created_at`, `updated_at`, `reg_ip`) VALUES
	(1, 'test', 'dsfds', 'test@mail.ru', '113360627', '2021-03-11 17:13:14', '2021-03-11 21:45:48', 0),
	(2, 'test1', '$2a$10$WwgbpbUVkCR5QjgLTdLATuuP781D/XBcmO3nvrDXrs5mSVoydHb4C', 'test@ya.ru', '113360626', '2021-03-11 22:04:56', '2021-03-11 22:04:56', 2130706433);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
