const mongoose = require('mongoose');

/**
 * Link Schema
 * Stores shortened link information and metadata
 */
const linkSchema = new mongoose.Schema({
  // Unique short code for the link (e.g., "abc123")
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Target URL where the link redirects to
  targetUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid URL format'
    }
  },

  // Campaign name for grouping related links
  campaign: {
    type: String,
    required: true,
    index: true
  },

  // UTM parameters for marketing tracking
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
  },

  // Total number of clicks (denormalized for quick access)
  clicks: {
    type: Number,
    default: 0
  },

  // Optional link expiration date
  expiresAt: {
    type: Date,
    default: null
  },

  // Flag to enable/disable link
  isActive: {
    type: Boolean,
    default: true
  },

  // User or creator identification (optional)
  createdBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for efficient campaign queries
linkSchema.index({ campaign: 1, createdAt: -1 });

// Index for expiration queries
linkSchema.index({ expiresAt: 1 }, { sparse: true });

// Virtual property to get the full short URL
linkSchema.virtual('shortUrl').get(function() {
  return `${process.env.BASE_URL || 'http://localhost:5000'}/${this.shortCode}`;
});

// Method to check if link is expired
linkSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model('Link', linkSchema);
