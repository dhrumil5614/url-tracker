import { useState } from 'react';
import { linkAPI } from '../services/api';
import { Copy, CheckCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';

/**
 * LinkCreator Component
 * Form to create new tracked links with platform-specific URLs
 */
const LinkCreator = ({ onLinkCreated }) => {
  const [formData, setFormData] = useState({
    targetUrl: '',
    campaign: '',
    customShortCode: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdLink, setCreatedLink] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await linkAPI.createLink(formData);
      setCreatedLink(result.link);

      // Reset form
      setFormData({
        targetUrl: '',
        campaign: '',
        customShortCode: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        utmContent: '',
      });

      // Notify parent component
      if (onLinkCreated) {
        onLinkCreated(result.link);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url, platform) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(platform);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <LinkIcon className="w-6 h-6 text-primary-600" />
          Create Tracked Link
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target URL */}
          <div>
            <label htmlFor="targetUrl" className="label">
              Target URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="targetUrl"
              name="targetUrl"
              value={formData.targetUrl}
              onChange={handleChange}
              placeholder="https://example.com/property-listing"
              required
              className="input"
            />
          </div>

          {/* Campaign Name */}
          <div>
            <label htmlFor="campaign" className="label">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="campaign"
              name="campaign"
              value={formData.campaign}
              onChange={handleChange}
              placeholder="summer-2024-properties"
              required
              className="input"
            />
          </div>

          {/* Custom Short Code */}
          <div>
            <label htmlFor="customShortCode" className="label">
              Custom Short Code (optional)
            </label>
            <input
              type="text"
              id="customShortCode"
              name="customShortCode"
              value={formData.customShortCode}
              onChange={handleChange}
              placeholder="custom123"
              className="input"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty to auto-generate. Alphanumeric only, 4-10 characters.
            </p>
          </div>

          {/* UTM Parameters */}
          <div className="border-t dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
              UTM Parameters (optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="utmSource" className="label">
                  UTM Source
                </label>
                <input
                  type="text"
                  id="utmSource"
                  name="utmSource"
                  value={formData.utmSource}
                  onChange={handleChange}
                  placeholder="instagram"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="utmMedium" className="label">
                  UTM Medium
                </label>
                <input
                  type="text"
                  id="utmMedium"
                  name="utmMedium"
                  value={formData.utmMedium}
                  onChange={handleChange}
                  placeholder="social"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="utmCampaign" className="label">
                  UTM Campaign
                </label>
                <input
                  type="text"
                  id="utmCampaign"
                  name="utmCampaign"
                  value={formData.utmCampaign}
                  onChange={handleChange}
                  placeholder="summer-sale"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="utmContent" className="label">
                  UTM Content
                </label>
                <input
                  type="text"
                  id="utmContent"
                  name="utmContent"
                  value={formData.utmContent}
                  onChange={handleChange}
                  placeholder="banner-ad"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Link...' : 'Create Tracked Link'}
          </button>
        </form>
      </div>

      {/* Created Link Display */}
      {createdLink && (
        <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                Link Created Successfully!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                {createdLink.message || 'Your tracked link is ready to use'}
              </p>
            </div>
          </div>

          {/* Single Universal Link */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Your Tracked Link
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(createdLink.shortUrl, 'link')}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {copiedUrl === 'link' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <a
                  href={createdLink.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Test
                </a>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 mb-3">
              <code className="text-sm text-gray-800 dark:text-gray-200 break-all font-mono">
                {createdLink.shortUrl}
              </code>
            </div>

            {/* Platform Auto-Detection Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">🎯 Automatic Platform Detection</p>
                  <p>Share this ONE link everywhere! We automatically detect whether it's clicked from:</p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <span>📱 Instagram</span>
                    <span>📘 Facebook</span>
                    <span>🐦 Twitter</span>
                    <span>💼 LinkedIn</span>
                    <span>📌 Pinterest</span>
                    <span>🎵 TikTok</span>
                    <span>💬 WhatsApp</span>
                    <span>📧 Email</span>
                  </div>
                  <p className="mt-2 text-blue-700 dark:text-blue-300">
                    View detailed analytics in the Analytics tab to see which platforms perform best!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Link Details */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Short Code:</span>
              <span className="ml-2 font-mono font-semibold text-gray-900 dark:text-gray-100">
                {createdLink.shortCode}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Campaign:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                {createdLink.campaign}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">Target URL:</span>
              <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 break-all">
                {createdLink.targetUrl}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkCreator;
