const express = require('express');
const cors = require('cors');
const dhcpRoutes = require('./routes/dhcp');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/dhcp', dhcpRoutes);
app.use('/api/auth', authRoutes);

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
