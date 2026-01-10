require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const linksRouter = require('./routes/links');
const analyticsRouter = require('./routes/analytics');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Database Connection
 */
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/link-tracker')
.then(() => {
  console.log('✓ Connected to MongoDB');
})
.catch((error) => {
  console.error('✗ MongoDB connection error:', error);
  process.exit(1);
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

/**
 * Middleware Configuration
 */

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Request logging middleware (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes - mounted at /api/links for CRUD operations
app.use('/api/links', linksRouter);
app.use('/api/analytics', analyticsRouter);

// Root redirect route - must come last to catch short codes
// This handles GET /:shortCode for redirects
const Link = require('./models/Link');
const Click = require('./models/Click');
const { parseUserAgent, getLocationFromIP, getClientIP } = require('./utils/userAgentParser');
const { redirectLimiter } = require('./middleware/rateLimiter');

app.get('/:shortCode', redirectLimiter, async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const source = req.query.source || 'direct';

    // Skip if it looks like a system route
    if (shortCode === 'health' || shortCode === 'api' || shortCode === 'favicon.ico') {
      return next();
    }

    // Find the link
    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).send('Link not found');
    }

    // Check if link is active
    if (!link.isActive) {
      return res.status(410).send('This link has been disabled');
    }

    // Check if link is expired
    if (link.isExpired()) {
      return res.status(410).send('This link has expired');
    }

    // Parse user agent and get location
    const userAgentString = req.headers['user-agent'] || '';
    const deviceInfo = parseUserAgent(userAgentString);
    const ipAddress = getClientIP(req);
    const locationInfo = getLocationFromIP(ipAddress);

    // Create click record for analytics
    const clickData = {
      shortCode: link.shortCode,
      source,
      campaign: link.campaign,
      clickedAt: new Date(),
      ipAddress,
      userAgent: userAgentString,
      referrer: req.headers.referer || req.headers.referrer || '',
      ...deviceInfo,
      ...locationInfo,
      utmSource: link.utmSource,
      utmMedium: link.utmMedium,
      utmCampaign: link.utmCampaign,
      utmContent: link.utmContent
    };

    // Save click record and increment click count (non-blocking)
    Promise.all([
      Click.create(clickData),
      Link.updateOne({ shortCode }, { $inc: { clicks: 1 } })
    ]).catch(err => console.error('Error saving click data:', err));

    // Redirect immediately (don't wait for database operations)
    res.redirect(302, link.targetUrl);

  } catch (error) {
    console.error('Error processing redirect:', error);
    next();
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid data format',
      message: 'The provided data format is invalid'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message
  });
});

/**
 * Server Startup
 */
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
