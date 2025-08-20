const mysql = require('mysql2/promise');

// Configuration de la connexion MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Remplacez par votre utilisateur MySQL
  password: '', // Remplacez par votre mot de passe MySQL
  database: 'dhcp_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;