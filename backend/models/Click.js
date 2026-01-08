const mongoose = require('mongoose');

/**
 * Click Schema
 * Stores detailed analytics data for each click on a shortened link
 */
const clickSchema = new mongoose.Schema({
  // Reference to the short code that was clicked
  shortCode: {
    type: String,
    required: true,
    index: true
  },

  // Marketing source (e.g., 'instagram', 'facebook', 'twitter', 'linkedin')
  source: {
    type: String,
    default: 'direct'
  },

  // Campaign identifier
  campaign: {
    type: String,
    required: true,
    index: true
  },

  // Timestamp of the click
  clickedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // IP address of the visitor
  ipAddress: {
    type: String,
    default: ''
  },

  // Full user agent string
  userAgent: {
    type: String,
    default: ''
  },

  // HTTP referrer
  referrer: {
    type: String,
    default: ''
  },

  // Parsed device information
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown'
  },

  // Browser name (Chrome, Firefox, Safari, etc.)
  browser: {
    type: String,
    default: 'unknown'
  },

  // Browser version
  browserVersion: {
    type: String,
    default: ''
  },

  // Operating system (Windows, macOS, iOS, Android, etc.)
  os: {
    type: String,
    default: 'unknown'
  },

  // OS version
  osVersion: {
    type: String,
    default: ''
  },

  // Geographic location data
  country: {
    type: String,
    default: ''
  },

  region: {
    type: String,
    default: ''
  },

  city: {
    type: String,
    default: ''
  },

  // Timezone
  timezone: {
    type: String,
    default: ''
  },

  // UTM parameters captured at click time
  utmSource: {
    type: String,
    default: ''
  },

  utmMedium: {
    type: String,
    default: ''
  },

  utmCampaign: {
    type: String,
    default: ''
  },

  utmContent: {
    type: String,
    default: ''
  }
}, {
  timestamps: false // We use clickedAt instead
});

// Compound indexes for efficient analytics queries
clickSchema.index({ shortCode: 1, clickedAt: -1 });
clickSchema.index({ campaign: 1, clickedAt: -1 });
clickSchema.index({ source: 1, clickedAt: -1 });
clickSchema.index({ clickedAt: -1 });

// Index for date-range queries
clickSchema.index({ clickedAt: 1, campaign: 1 });

module.exports = mongoose.model('Click', clickSchema);
