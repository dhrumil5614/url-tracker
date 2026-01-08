const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for link creation API
 * Prevents abuse by limiting the number of links that can be created
 * from a single IP address in a time window
 */
const createLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many links created from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter for analytics API
 * More lenient as analytics are read-only operations
 */
const analyticsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many analytics requests from this IP, please try again after 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for redirect endpoint
 * Prevents click fraud and DDoS attacks
 */
const redirectLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 redirects per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip failed requests (when link doesn't exist)
  skipFailedRequests: true,
});

/**
 * General API rate limiter
 * Applied to all API routes as a fallback
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  createLinkLimiter,
  analyticsLimiter,
  redirectLimiter,
  generalLimiter
};
