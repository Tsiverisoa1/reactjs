const express = require('express');
const router = express.Router();
const pool = require('../config');
const ip = require('ip');
const authMiddleware = require('../middleware/auth');

// Obtenir toutes les IP avec MAC et device_name
router.get('/ips', authMiddleware, async (req, res) => {
  try {
    const [ips] = await pool.query(`
      SELECT ip_addresses.*, subnets.cidr, subnets.description,
             reservations.device_name AS reserved_device, reservations.mac AS reserved_mac
      FROM ip_addresses
      LEFT JOIN subnets ON ip_addresses.subnet_id = subnets.id
      LEFT JOIN reservations ON ip_addresses.ip = reservations.ip
    `);

    // Récupérer la dernière MAC assignée pour les IP assignées sans réservation
    const [history] = await pool.query(`
      SELECT ip, mac, device_name FROM history WHERE action = 'assigned' ORDER BY timestamp DESC
    `);

    const ipsWithMac = ips.map(ip => {
      if (!ip.reserved_mac && ip.status === 'assigned') {
        // Si IP assignée mais pas de réservation, chercher dernière MAC assignée
        const lastAssigned = history.find(h => h.ip === ip.ip);
        ip.mac = lastAssigned ? lastAssigned.mac : 'N/A';
        ip.device_name = lastAssigned ? lastAssigned.device_name : ip.device_name || 'Inconnu';
      } else {
        ip.mac = ip.reserved_mac || 'N/A';
        ip.device_name = ip.reserved_device || ip.device_name || 'Inconnu';
      }
      return ip;
    });

    res.json(ipsWithMac);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Eto DHCP attribution
router.post('/assign-ip', authMiddleware, async (req, res) => {
  const { mac, deviceName } = req.body;
  try {
    if (!mac) return res.status(400).json({ message: 'Adresse MAC requise' });

    // Vérifier si la MAC a déjà une IP assignée dans reservations
    const [assigned] = await pool.query(`
      SELECT ip FROM ip_addresses 
      WHERE status = "assigned" AND ip IN (SELECT ip FROM reservations WHERE mac = ?)
    `, [mac]);
    if (assigned.length > 0) return res.json({ ip: assigned[0].ip });

    // Vérifier si la MAC a une IP réservée
    const [reserved] = await pool.query(`
      SELECT ip FROM reservations WHERE mac = ? LIMIT 1
    `, [mac]);

    if (reserved.length > 0) {
      const ipReserved = reserved[0].ip;
      const [ipStatus] = await pool.query('SELECT status FROM ip_addresses WHERE ip = ?', [ipReserved]);

      if (ipStatus.length > 0 && (ipStatus[0].status === 'free' || ipStatus[0].status === 'reserved')) {
        await pool.query(
          'UPDATE ip_addresses SET status = "assigned", device_name = ?, last_assigned = NOW() WHERE ip = ?',
          [deviceName || 'Inconnu', ipReserved]
        );
        await pool.query(
          'INSERT INTO history (ip, mac, device_name, action) VALUES (?, ?, ?, ?)',
          [ipReserved, mac, deviceName || 'Inconnu', 'assigned']
        );
      }
      return res.json({ ip: ipReserved });
    }

    // Chercher une IP libre non réservée
    const [freeIp] = await pool.query(`
      SELECT ip FROM ip_addresses 
      WHERE status = "free" 
      LIMIT 1
    `);
    if (!freeIp.length) return res.status(400).json({ message: 'Aucune IP libre disponible' });

    await pool.query(
      'UPDATE ip_addresses SET status = "assigned", device_name = ?, last_assigned = NOW() WHERE ip = ?',
      [deviceName || 'Inconnu', freeIp[0].ip]
    );
    await pool.query(
      'INSERT INTO history (ip, mac, device_name, action) VALUES (?, ?, ?, ?)',
      [freeIp[0].ip, mac, deviceName || 'Inconnu', 'assigned']
    );

    res.json({ ip: freeIp[0].ip });
  } catch (err) {
    console.error('Assign IP error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Créer une réservation
router.post('/reservations', authMiddleware, async (req, res) => {
  const { mac, ip, deviceName } = req.body;
  try {
    const [ipDoc] = await pool.query('SELECT status FROM ip_addresses WHERE ip = ?', [ip]);
    if (!ipDoc.length || ipDoc[0].status !== 'free') return res.status(400).json({ message: 'IP non disponible' });

    await pool.query('INSERT INTO reservations (mac, ip, device_name) VALUES (?, ?, ?)', [mac, ip, deviceName]);
    await pool.query('UPDATE ip_addresses SET status = "reserved", device_name = ? WHERE ip = ?', [deviceName, ip]);
    await pool.query('INSERT INTO history (ip, mac, device_name, action) VALUES (?, ?, ?, ?)', [ip, mac, deviceName, 'reserved']);
    res.status(201).json({ mac, ip, deviceName });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Libérer une IP
router.post('/free', authMiddleware, async (req, res) => {
  const { ip } = req.body;
  try {
    const [ipDoc] = await pool.query('SELECT status FROM ip_addresses WHERE ip = ?', [ip]);
    if (!ipDoc.length) return res.status(400).json({ message: 'IP non trouvée' });
    if (ipDoc[0].status === 'free') return res.status(400).json({ message: 'IP déjà libre' });

    const [reservation] = await pool.query('SELECT mac, device_name FROM reservations WHERE ip = ?', [ip]);
    const mac = reservation.length > 0 ? reservation[0].mac : null;
    const deviceName = reservation.length > 0 ? reservation[0].device_name : null;

    await pool.query('UPDATE ip_addresses SET status = "free", device_name = NULL, last_assigned = NULL WHERE ip = ?', [ip]);
    await pool.query('DELETE FROM reservations WHERE ip = ?', [ip]);
    await pool.query(
      'INSERT INTO history (ip, mac, device_name, action) VALUES (?, ?, ?, ?)',
      [ip, mac || 'N/A', deviceName || 'Inconnu', 'released']
    );

    res.json({ message: 'IP libérée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir l'historique
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const [history] = await pool.query('SELECT id, ip, mac, device_name, action, timestamp FROM history ORDER BY timestamp DESC');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir tous les sous-réseaux
router.get('/subnets', authMiddleware, async (req, res) => {
  try {
    const [subnets] = await pool.query('SELECT * FROM subnets');
    const result = [];
    for (let subnet of subnets) {
      const [ips] = await pool.query('SELECT MIN(ip) as startIp, MAX(ip) as endIp FROM ip_addresses WHERE subnet_id = ?', [subnet.id]);
      result.push({
        id: subnet.id,
        cidr: subnet.cidr,
        description: subnet.description,
        startIp: ips[0].startIp,
        endIp: ips[0].endIp
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ajouter un sous-réseau avec plage d'IP
router.post('/subnets', authMiddleware, async (req, res) => {
  const { cidr, description, startIp, endIp } = req.body;
  try {
    const ipRange = ip.cidrSubnet(cidr);

    if (!ip.isV4Format(ipRange.networkAddress)) return res.status(400).json({ message: 'CIDR invalide' });
    if (startIp && !ip.isV4Format(startIp)) return res.status(400).json({ message: 'Adresse IP de début invalide' });
    if (endIp && !ip.isV4Format(endIp)) return res.status(400).json({ message: 'Adresse IP de fin invalide' });
    if (startIp && endIp && ip.toLong(startIp) > ip.toLong(endIp)) return res.status(400).json({ message: 'L\'adresse de début doit être inférieure à l\'adresse de fin' });
    if ((startIp && !ipRange.contains(startIp)) || (endIp && !ipRange.contains(endIp))) return res.status(400).json({ message: 'Les adresses IP doivent être dans le CIDR' });

    const [result] = await pool.query('INSERT INTO subnets (cidr, description) VALUES (?, ?)', [cidr, description]);
    const subnetId = result.insertId;

    const ips = [];
    const networkIp = ip.toLong(ipRange.networkAddress);
    const broadcastIp = ip.toLong(ipRange.broadcastAddress);

    let currentIp = startIp ? ip.toLong(startIp) : networkIp + 1;
    const lastIp = endIp ? ip.toLong(endIp) : broadcastIp - 1;

    while (currentIp <= lastIp) {
      if (currentIp !== networkIp && currentIp !== broadcastIp) {
        ips.push(ip.fromLong(currentIp));
      }
      currentIp += 1;
    }

    for (let ipAddr of ips) {
      await pool.query('INSERT INTO ip_addresses (ip, subnet_id, status) VALUES (?, ?, ?)', [ipAddr, subnetId, 'free']);
    }

    res.status(201).json({ id: subnetId, cidr, description, startIp, endIp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
