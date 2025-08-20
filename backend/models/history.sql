CREATE TABLE history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(15) NOT NULL,
  mac VARCHAR(17),
  device_name VARCHAR(255), -- ajout pour nom de l'appareil
  action ENUM('assigned', 'released', 'reserved') NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
