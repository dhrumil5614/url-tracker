const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

/**
 * Parse user agent string and extract device, browser, and OS information
 * @param {string} userAgentString - The user agent string from the request
 * @returns {object} Parsed device information
 */
const parseUserAgent = (userAgentString) => {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  // Determine device type
  let deviceType = 'unknown';
  if (result.device.type) {
    deviceType = result.device.type; // mobile, tablet, etc.
  } else if (result.os.name) {
    // If no device type is specified, infer from OS
    const mobileOS = ['iOS', 'Android', 'Windows Phone', 'BlackBerry'];
    const tabletOS = ['iPad'];

    if (tabletOS.includes(result.device.model) || result.device.model?.includes('Tablet')) {
      deviceType = 'tablet';
    } else if (mobileOS.includes(result.os.name)) {
      deviceType = 'mobile';
    } else {
      deviceType = 'desktop';
    }
  }

  return {
    deviceType,
    browser: result.browser.name || 'unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'unknown',
    osVersion: result.os.version || '',
    deviceModel: result.device.model || '',
    deviceVendor: result.device.vendor || ''
  };
};

/**
 * Get geographic location from IP address
 * @param {string} ipAddress - The IP address to look up
 * @returns {object} Geographic location data
 */
const getLocationFromIP = (ipAddress) => {
  // Skip local/private IPs
  if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
    return {
      country: '',
      region: '',
      city: '',
      timezone: ''
    };
  }

  const geo = geoip.lookup(ipAddress);

  if (!geo) {
    return {
      country: '',
      region: '',
      city: '',
      timezone: ''
    };
  }

  return {
    country: geo.country || '',
    region: geo.region || '',
    city: geo.city || '',
    timezone: geo.timezone || ''
  };
};

/**
 * Extract real IP address from request (handles proxies and load balancers)
 * @param {object} req - Express request object
 * @returns {string} The real IP address
 */
const getClientIP = (req) => {
  // Check various headers that might contain the real IP
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim();
  }

  return req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         '';
};

module.exports = {
  parseUserAgent,
  getLocationFromIP,
  getClientIP
};
