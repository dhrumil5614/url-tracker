const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Link = require('../models/Link');
const Click = require('../models/Click');
const { generateShortCode, isValidShortCode } = require('../utils/shortCodeGenerator');
const { parseUserAgent, getLocationFromIP, getClientIP } = require('../utils/userAgentParser');
const { createLinkLimiter, redirectLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/links
 * Create a new shortened link with tracking capabilities
 */
router.post('/',
  createLinkLimiter,
  [
    body('targetUrl')
      .notEmpty().withMessage('Target URL is required')
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Invalid URL format'),
    body('campaign')
      .notEmpty().withMessage('Campaign name is required')
      .isLength({ min: 1, max: 100 }).withMessage('Campaign name must be between 1 and 100 characters'),
    body('customShortCode')
      .optional()
      .custom((value) => {
        if (value && !isValidShortCode(value)) {
          throw new Error('Invalid short code format');
        }
        return true;
      }),
    body('utmSource').optional().isLength({ max: 100 }),
    body('utmMedium').optional().isLength({ max: 100 }),
    body('utmCampaign').optional().isLength({ max: 100 }),
    body('utmContent').optional().isLength({ max: 100 }),
    body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date format'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        targetUrl,
        campaign,
        customShortCode,
        utmSource = '',
        utmMedium = '',
        utmCampaign = '',
        utmContent = '',
        expiresAt = null
      } = req.body;

      // Generate or use custom short code
      let shortCode;
      if (customShortCode) {
        // Check if custom short code already exists
        const existing = await Link.findOne({ shortCode: customShortCode });
        if (existing) {
          return res.status(409).json({
            error: 'Short code already exists',
            message: 'This custom short code is already in use. Please choose another one.'
          });
        }
        shortCode = customShortCode;
      } else {
        // Generate unique short code
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
          shortCode = generateShortCode();
          const existing = await Link.findOne({ shortCode });
          if (!existing) break;
          attempts++;
        }

        if (attempts === maxAttempts) {
          return res.status(500).json({
            error: 'Failed to generate unique short code',
            message: 'Please try again'
          });
        }
      }

      // Create new link
      const link = new Link({
        shortCode,
        targetUrl,
        campaign,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      });

      await link.save();

      // Build full short URLs for different platforms
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const shortUrl = `${baseUrl}/${shortCode}`;

      // Build platform-specific URLs with UTM parameters
      const buildPlatformUrl = (source) => {
        const url = new URL(targetUrl);
        if (utmSource || source) url.searchParams.set('utm_source', utmSource || source);
        if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
        if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
        if (utmContent) url.searchParams.set('utm_content', utmContent);

        return `${baseUrl}/${shortCode}?source=${source}`;
      };

      res.status(201).json({
        success: true,
        link: {
          shortCode: link.shortCode,
          shortUrl,
          targetUrl: link.targetUrl,
          campaign: link.campaign,
          platformUrls: {
            instagram: buildPlatformUrl('instagram'),
            facebook: buildPlatformUrl('facebook'),
            twitter: buildPlatformUrl('twitter'),
            linkedin: buildPlatformUrl('linkedin'),
            direct: shortUrl
          },
          expiresAt: link.expiresAt,
          createdAt: link.createdAt
        }
      });

    } catch (error) {
      console.error('Error creating link:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create shortened link'
      });
    }
  }
);

/**
 * GET /:shortCode
 * Redirect to target URL and track analytics
 */
router.get('/:shortCode',
  redirectLimiter,
  async (req, res) => {
    try {
      const { shortCode } = req.params;
      const source = req.query.source || 'direct';

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
      res.status(500).send('Internal server error');
    }
  }
);

/**
 * GET /api/links
 * Get all links (with pagination)
 */
router.get('/api/links', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const links = await Link.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Link.countDocuments();

    res.json({
      success: true,
      data: links,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch links'
    });
  }
});

/**
 * DELETE /api/links/:shortCode
 * Delete a link
 */
router.delete('/api/links/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await Link.findOneAndDelete({ shortCode });

    if (!link) {
      return res.status(404).json({
        error: 'Link not found'
      });
    }

    // Optionally delete associated click data
    // await Click.deleteMany({ shortCode });

    res.json({
      success: true,
      message: 'Link deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete link'
    });
  }
});

module.exports = router;
