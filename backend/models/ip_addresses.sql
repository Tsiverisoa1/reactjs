CREATE TABLE ip_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(15) NOT NULL UNIQUE,
  status ENUM('free', 'assigned', 'reserved') DEFAULT 'free',
  subnet_id INT,
  last_assigned DATETIME,
  FOREIGN KEY (subnet_id) REFERENCES subnets(id)
);