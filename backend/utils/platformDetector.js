/**
 * Platform Detector Utility
 * Automatically detects the source platform from HTTP headers
 *
 * Detection Priority:
 * 1. Manual override (utm_source or source query parameter)
 * 2. HTTP Referer header (most reliable)
 * 3. User-Agent string (fallback)
 * 4. Default to "direct" if no platform detected
 */

/**
 * Detect the platform/source from request headers
 * @param {string} referer - HTTP Referer header
 * @param {string} userAgent - User-Agent header
 * @param {string} manualSource - Manual source from query params (utm_source or source)
 * @returns {string} Platform name (instagram, facebook, twitter, etc.)
 */
const detectPlatform = (referer = '', userAgent = '', manualSource = '') => {
  // Priority 1: Manual override (for testing, paid ads, influencer tracking)
  if (manualSource) {
    return manualSource.toLowerCase().trim();
  }

  // Normalize for case-insensitive matching
  const refererLower = referer.toLowerCase();
  const userAgentLower = userAgent.toLowerCase();

  // Priority 2: Referer Header Detection
  // This is the most reliable method as it shows the actual referring page

  // Instagram
  if (refererLower.includes('instagram.com') || refererLower.includes('l.instagram.com')) {
    return 'instagram';
  }

  // Facebook (multiple domains for mobile/desktop/messenger)
  if (refererLower.includes('facebook.com') ||
      refererLower.includes('l.facebook.com') ||
      refererLower.includes('lm.facebook.com') ||
      refererLower.includes('m.facebook.com')) {
    return 'facebook';
  }

  // Twitter / X
  if (refererLower.includes('t.co') ||
      refererLower.includes('twitter.com') ||
      refererLower.includes('x.com')) {
    return 'twitter';
  }

  // LinkedIn
  if (refererLower.includes('linkedin.com') || refererLower.includes('lnkd.in')) {
    return 'linkedin';
  }

  // Pinterest
  if (refererLower.includes('pinterest.com') || refererLower.includes('pin.it')) {
    return 'pinterest';
  }

  // TikTok
  if (refererLower.includes('tiktok.com') || refererLower.includes('vm.tiktok.com')) {
    return 'tiktok';
  }

  // Reddit
  if (refererLower.includes('reddit.com') || refererLower.includes('redd.it')) {
    return 'reddit';
  }

  // WhatsApp
  if (refererLower.includes('whatsapp.com') || refererLower.includes('wa.me')) {
    return 'whatsapp';
  }

  // Telegram
  if (refererLower.includes('t.me') || refererLower.includes('telegram.me')) {
    return 'telegram';
  }

  // YouTube
  if (refererLower.includes('youtube.com') || refererLower.includes('youtu.be')) {
    return 'youtube';
  }

  // Snapchat
  if (refererLower.includes('snapchat.com')) {
    return 'snapchat';
  }

  // Discord
  if (refererLower.includes('discord.com') || refererLower.includes('discord.gg')) {
    return 'discord';
  }

  // Slack
  if (refererLower.includes('slack.com')) {
    return 'slack';
  }

  // Google (search, Gmail, etc.)
  if (refererLower.includes('google.com') || refererLower.includes('google.')) {
    return 'google';
  }

  // Bing
  if (refererLower.includes('bing.com')) {
    return 'bing';
  }

  // Priority 3: User-Agent Detection (fallback when referer is not available)
  // Some platforms use in-app browsers with identifiable user agents

  // Instagram in-app browser
  if (userAgentLower.includes('instagram')) {
    return 'instagram';
  }

  // Facebook in-app browser
  if (userAgentLower.includes('fban') || userAgentLower.includes('fbav')) {
    return 'facebook';
  }

  // Twitter in-app browser
  if (userAgentLower.includes('twitter')) {
    return 'twitter';
  }

  // LinkedIn app
  if (userAgentLower.includes('linkedinapp')) {
    return 'linkedin';
  }

  // Pinterest app
  if (userAgentLower.includes('pinterest')) {
    return 'pinterest';
  }

  // WhatsApp
  if (userAgentLower.includes('whatsapp')) {
    return 'whatsapp';
  }

  // TikTok
  if (userAgentLower.includes('tiktok')) {
    return 'tiktok';
  }

  // Snapchat
  if (userAgentLower.includes('snapchat')) {
    return 'snapchat';
  }

  // Default: Direct traffic (no referer or unrecognized source)
  return 'direct';
};

/**
 * Get platform display name (for analytics)
 * @param {string} platform - Platform code
 * @returns {string} Display name
 */
const getPlatformDisplayName = (platform) => {
  const displayNames = {
    'instagram': 'Instagram',
    'facebook': 'Facebook',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'pinterest': 'Pinterest',
    'tiktok': 'TikTok',
    'reddit': 'Reddit',
    'whatsapp': 'WhatsApp',
    'telegram': 'Telegram',
    'youtube': 'YouTube',
    'snapchat': 'Snapchat',
    'discord': 'Discord',
    'slack': 'Slack',
    'google': 'Google',
    'bing': 'Bing',
    'direct': 'Direct'
  };

  return displayNames[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
};

/**
 * Get platform color for UI (hex color codes)
 * @param {string} platform - Platform code
 * @returns {string} Hex color code
 */
const getPlatformColor = (platform) => {
  const colors = {
    'instagram': '#E4405F',
    'facebook': '#1877F2',
    'twitter': '#1DA1F2',
    'linkedin': '#0A66C2',
    'pinterest': '#E60023',
    'tiktok': '#000000',
    'reddit': '#FF4500',
    'whatsapp': '#25D366',
    'telegram': '#0088cc',
    'youtube': '#FF0000',
    'snapchat': '#FFFC00',
    'discord': '#5865F2',
    'slack': '#4A154B',
    'google': '#4285F4',
    'bing': '#008373',
    'direct': '#6B7280'
  };

  return colors[platform] || '#9CA3AF';
};

/**
 * Check if platform was detected automatically or manually set
 * @param {string} manualSource - Manual source parameter
 * @returns {object} Detection metadata
 */
const getDetectionMetadata = (referer, userAgent, manualSource) => {
  if (manualSource) {
    return {
      method: 'manual',
      confidence: 'high',
      source: manualSource
    };
  }

  const refererLower = referer.toLowerCase();
  const hasReferer = refererLower && refererLower !== '';
  const hasUserAgent = userAgent && userAgent !== '';

  if (hasReferer) {
    // Check if referer matches known platform
    const knownPlatforms = ['instagram', 'facebook', 'twitter', 'linkedin', 'pinterest',
                            'tiktok', 'reddit', 'whatsapp', 'telegram', 'youtube'];
    const matchedPlatform = knownPlatforms.find(p => refererLower.includes(p));

    if (matchedPlatform) {
      return {
        method: 'referer',
        confidence: 'high',
        source: detectPlatform(referer, userAgent, manualSource)
      };
    }
  }

  if (hasUserAgent) {
    const userAgentLower = userAgent.toLowerCase();
    const knownUserAgents = ['instagram', 'fban', 'fbav', 'twitter', 'linkedinapp',
                             'pinterest', 'whatsapp', 'tiktok', 'snapchat'];
    const matchedUA = knownUserAgents.find(ua => userAgentLower.includes(ua));

    if (matchedUA) {
      return {
        method: 'user-agent',
        confidence: 'medium',
        source: detectPlatform(referer, userAgent, manualSource)
      };
    }
  }

  return {
    method: 'default',
    confidence: 'low',
    source: 'direct'
  };
};

module.exports = {
  detectPlatform,
  getPlatformDisplayName,
  getPlatformColor,
  getDetectionMetadata
};
