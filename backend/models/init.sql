DROP DATABASE IF EXISTS dhcp_manager;
CREATE DATABASE dhcp_manager;
USE dhcp_manager;

-- Table des sous-réseaux
CREATE TABLE subnets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cidr VARCHAR(18) NOT NULL,
  description VARCHAR(255)
);

-- Table des adresses IP
CREATE TABLE ip_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(15) NOT NULL UNIQUE,
  status ENUM('free', 'assigned', 'reserved') DEFAULT 'free',
  subnet_id INT,
  last_assigned DATETIME,
  FOREIGN KEY (subnet_id) REFERENCES subnets(id)
);

-- Table des réservations
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mac VARCHAR(17) NOT NULL,
  ip VARCHAR(15) NOT NULL,
  device_name VARCHAR(255),
  FOREIGN KEY (ip) REFERENCES ip_addresses(ip)
);

-- Table de l'historique
CREATE TABLE history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(15) NOT NULL,
  mac VARCHAR(17),
  device_name VARCHAR(255), -- ajout pour nom de l'appareil
  action ENUM('assigned', 'released', 'reserved') NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
