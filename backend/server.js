const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./database');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const attendanceRoutes = require('./routes/attendance');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize database
initDatabase().then(() => {
  console.log('Database initialized');
}).catch(err => {
  console.error('Database initialization failed:', err);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'GeoAttend API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 GeoAttend Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: SQLite (geoattend.db)`);
});

module.exports = app;
