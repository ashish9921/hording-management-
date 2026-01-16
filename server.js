const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS
app.use(cors());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/hoardings', require('./src/routes/hoardingRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/public/complaints', require('./src/routes/complaintRoutes'));
app.use('/api/pmc', require('./src/routes/pmcRoutes'));
app.use('/api/recycler', require('./src/routes/recyclerRoutes'));
app.use('/api/qr', require('./src/routes/qrRoutes'));

// Error handler
app.use(errorHandler);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Hoarding Management API Running' });
});

const PORT = process.env.PORT || 8004;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});