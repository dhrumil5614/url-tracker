const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const Click = require('../models/Click');
const { analyticsLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all analytics routes
router.use(analyticsLimiter);

/**
 * GET /api/analytics/:shortCode
 * Get detailed analytics for a specific link
 */
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { startDate, endDate } = req.query;

    // Find the link
    const link = await Link.findOne({ shortCode });
    if (!link) {
      return res.status(404).json({
        error: 'Link not found'
      });
    }

    // Build date filter
    const dateFilter = { shortCode };
    if (startDate || endDate) {
      dateFilter.clickedAt = {};
      if (startDate) dateFilter.clickedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.clickedAt.$lte = new Date(endDate);
    }

    // Get all clicks for this link
    const clicks = await Click.find(dateFilter).sort({ clickedAt: -1 });

    // Aggregate analytics data
    const analytics = {
      link: {
        shortCode: link.shortCode,
        targetUrl: link.targetUrl,
        campaign: link.campaign,
        createdAt: link.createdAt
      },
      totalClicks: clicks.length,

      // Clicks by source
      bySource: {},

      // Clicks by device type
      byDevice: {},

      // Clicks by browser
      byBrowser: {},

      // Clicks by OS
      byOS: {},

      // Clicks by country
      byCountry: {},

      // Clicks over time (grouped by date)
      byDate: {},

      // Recent clicks
      recentClicks: clicks.slice(0, 50).map(click => ({
        source: click.source,
        clickedAt: click.clickedAt,
        deviceType: click.deviceType,
        browser: click.browser,
        os: click.os,
        country: click.country,
        city: click.city
      }))
    };

    // Process clicks for aggregation
    clicks.forEach(click => {
      // By source
      analytics.bySource[click.source] = (analytics.bySource[click.source] || 0) + 1;

      // By device
      analytics.byDevice[click.deviceType] = (analytics.byDevice[click.deviceType] || 0) + 1;

      // By browser
      const browser = click.browser || 'unknown';
      analytics.byBrowser[browser] = (analytics.byBrowser[browser] || 0) + 1;

      // By OS
      const os = click.os || 'unknown';
      analytics.byOS[os] = (analytics.byOS[os] || 0) + 1;

      // By country
      if (click.country) {
        analytics.byCountry[click.country] = (analytics.byCountry[click.country] || 0) + 1;
      }

      // By date
      const dateKey = click.clickedAt.toISOString().split('T')[0];
      analytics.byDate[dateKey] = (analytics.byDate[dateKey] || 0) + 1;
    });

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch analytics'
    });
  }
});

/**
 * GET /api/analytics/campaign/:campaign
 * Get aggregated analytics for an entire campaign
 */
router.get('/campaign/:campaign', async (req, res) => {
  try {
    const { campaign } = req.params;
    const { startDate, endDate } = req.query;

    // Find all links in this campaign
    const links = await Link.find({ campaign });

    if (links.length === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    // Build date filter
    const dateFilter = { campaign };
    if (startDate || endDate) {
      dateFilter.clickedAt = {};
      if (startDate) dateFilter.clickedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.clickedAt.$lte = new Date(endDate);
    }

    // Get all clicks for this campaign
    const clicks = await Click.find(dateFilter).sort({ clickedAt: -1 });

    // Aggregate analytics data
    const analytics = {
      campaign,
      totalLinks: links.length,
      totalClicks: clicks.length,

      // Links in this campaign
      links: links.map(link => ({
        shortCode: link.shortCode,
        targetUrl: link.targetUrl,
        clicks: link.clicks,
        createdAt: link.createdAt
      })),

      // Aggregated stats
      bySource: {},
      byDevice: {},
      byBrowser: {},
      byOS: {},
      byCountry: {},
      byDate: {},
      byLink: {},

      // Recent clicks
      recentClicks: clicks.slice(0, 50).map(click => ({
        shortCode: click.shortCode,
        source: click.source,
        clickedAt: click.clickedAt,
        deviceType: click.deviceType,
        browser: click.browser,
        os: click.os,
        country: click.country
      }))
    };

    // Process clicks for aggregation
    clicks.forEach(click => {
      // By source
      analytics.bySource[click.source] = (analytics.bySource[click.source] || 0) + 1;

      // By device
      analytics.byDevice[click.deviceType] = (analytics.byDevice[click.deviceType] || 0) + 1;

      // By browser
      const browser = click.browser || 'unknown';
      analytics.byBrowser[browser] = (analytics.byBrowser[browser] || 0) + 1;

      // By OS
      const os = click.os || 'unknown';
      analytics.byOS[os] = (analytics.byOS[os] || 0) + 1;

      // By country
      if (click.country) {
        analytics.byCountry[click.country] = (analytics.byCountry[click.country] || 0) + 1;
      }

      // By date
      const dateKey = click.clickedAt.toISOString().split('T')[0];
      analytics.byDate[dateKey] = (analytics.byDate[dateKey] || 0) + 1;

      // By link
      analytics.byLink[click.shortCode] = (analytics.byLink[click.shortCode] || 0) + 1;
    });

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch campaign analytics'
    });
  }
});

/**
 * GET /api/analytics/dashboard
 * Get overall dashboard statistics
 */
router.get('/dashboard/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.clickedAt = {};
      if (startDate) dateFilter.clickedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.clickedAt.$lte = new Date(endDate);
    }

    // Get aggregated statistics
    const [
      totalLinks,
      totalClicks,
      clicks,
      topLinks,
      campaigns
    ] = await Promise.all([
      Link.countDocuments(),
      Click.countDocuments(dateFilter),
      Click.find(dateFilter).sort({ clickedAt: -1 }).limit(100),
      Link.find().sort({ clicks: -1 }).limit(10),
      Link.aggregate([
        {
          $group: {
            _id: '$campaign',
            totalLinks: { $sum: 1 },
            totalClicks: { $sum: '$clicks' }
          }
        },
        { $sort: { totalClicks: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Aggregate click data
    const analytics = {
      overview: {
        totalLinks,
        totalClicks,
        totalCampaigns: campaigns.length,
        averageClicksPerLink: totalLinks > 0 ? (totalClicks / totalLinks).toFixed(2) : 0
      },

      bySource: {},
      byDevice: {},
      byBrowser: {},
      byOS: {},
      byCountry: {},
      byDate: {},

      topLinks: topLinks.map(link => ({
        shortCode: link.shortCode,
        targetUrl: link.targetUrl,
        campaign: link.campaign,
        clicks: link.clicks,
        createdAt: link.createdAt
      })),

      topCampaigns: campaigns.map(c => ({
        campaign: c._id,
        totalLinks: c.totalLinks,
        totalClicks: c.totalClicks
      })),

      recentClicks: clicks.slice(0, 50).map(click => ({
        shortCode: click.shortCode,
        source: click.source,
        campaign: click.campaign,
        clickedAt: click.clickedAt,
        deviceType: click.deviceType,
        country: click.country
      }))
    };

    // Process clicks for aggregation
    clicks.forEach(click => {
      // By source
      analytics.bySource[click.source] = (analytics.bySource[click.source] || 0) + 1;

      // By device
      analytics.byDevice[click.deviceType] = (analytics.byDevice[click.deviceType] || 0) + 1;

      // By browser
      const browser = click.browser || 'unknown';
      analytics.byBrowser[browser] = (analytics.byBrowser[browser] || 0) + 1;

      // By OS
      const os = click.os || 'unknown';
      analytics.byOS[os] = (analytics.byOS[os] || 0) + 1;

      // By country
      if (click.country) {
        analytics.byCountry[click.country] = (analytics.byCountry[click.country] || 0) + 1;
      }

      // By date
      const dateKey = click.clickedAt.toISOString().split('T')[0];
      analytics.byDate[dateKey] = (analytics.byDate[dateKey] || 0) + 1;
    });

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch dashboard analytics'
    });
  }
});

/**
 * GET /api/analytics/export/:shortCode
 * Export analytics data to CSV format
 */
router.get('/export/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { startDate, endDate } = req.query;

    // Find the link
    const link = await Link.findOne({ shortCode });
    if (!link) {
      return res.status(404).json({
        error: 'Link not found'
      });
    }

    // Build date filter
    const dateFilter = { shortCode };
    if (startDate || endDate) {
      dateFilter.clickedAt = {};
      if (startDate) dateFilter.clickedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.clickedAt.$lte = new Date(endDate);
    }

    // Get all clicks
    const clicks = await Click.find(dateFilter).sort({ clickedAt: -1 });

    // Build CSV content
    const csvHeaders = [
      'Date',
      'Source',
      'Device Type',
      'Browser',
      'OS',
      'Country',
      'City',
      'IP Address',
      'Referrer'
    ].join(',');

    const csvRows = clicks.map(click => [
      click.clickedAt.toISOString(),
      click.source,
      click.deviceType,
      click.browser,
      click.os,
      click.country,
      click.city,
      click.ipAddress,
      click.referrer
    ].map(field => `"${field}"`).join(','));

    const csv = [csvHeaders, ...csvRows].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${shortCode}-${Date.now()}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to export analytics'
    });
  }
});

module.exports = router;
