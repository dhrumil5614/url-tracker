/**
 * Detects the marketing source from the referrer URL
 * @param {string} referrer - The HTTP Referer header
 * @returns {string|null} The detected source name or null if not found
 */
const detectSource = (referrer) => {
    if (!referrer) return null;

    try {
        const url = new URL(referrer);
        const hostname = url.hostname.toLowerCase();

        // Instagram
        if (hostname.includes('instagram.com')) {
            return 'instagram';
        }

        // Facebook
        if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
            return 'facebook';
        }

        // Twitter / X
        if (hostname.includes('twitter.com') || hostname.includes('t.co') || hostname.includes('x.com')) {
            return 'twitter';
        }

        // LinkedIn
        if (hostname.includes('linkedin.com')) {
            return 'linkedin';
        }

        // YouTube
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            return 'youtube';
        }

        // WhatsApp
        if (hostname.includes('whatsapp.com') || hostname.includes('wa.me')) {
            return 'whatsapp';
        }

        // Pinterest
        if (hostname.includes('pinterest.com')) {
            return 'pinterest';
        }

        // TikTok
        if (hostname.includes('tiktok.com')) {
            return 'tiktok';
        }

        // Reddit
        if (hostname.includes('reddit.com')) {
            return 'reddit';
        }

        // Default: return valid domain name if simple enough, otherwise null
        // Ideally we only return known social sources to avoid cluttering analytics with random domains
        return null;

    } catch (error) {
        // Invalid URL format
        return null;
    }
};

module.exports = {
    detectSource
};
