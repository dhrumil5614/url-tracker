import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import ClicksChart from './ClicksChart';
import SourceBreakdown from './SourceBreakdown';
import {
  BarChart3,
  Smartphone,
  Globe,
  Clock,
  Download,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

/**
 * AnalyticsDashboard Component
 * Main analytics dashboard with comprehensive statistics and visualizations
 */
const AnalyticsDashboard = ({ darkMode }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Fetch dashboard analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyticsAPI.getDashboardAnalytics(
        dateRange.startDate || null,
        dateRange.endDate || null
      );
      setAnalytics(result.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Handle date range change
  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  // Apply date filter
  const applyDateFilter = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={fetchAnalytics} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your link performance and campaign metrics
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-3">Date Range Filter</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="startDate" className="label">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="input"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endDate" className="label">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button onClick={applyDateFilter} className="btn-primary">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Links</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.overview.totalLinks}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.overview.totalClicks}
              </p>
            </div>
            <BarChart3 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Campaigns</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.overview.totalCampaigns}
              </p>
            </div>
            <Globe className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Clicks/Link</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.overview.averageClicksPerLink}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClicksChart data={analytics.byDate} darkMode={darkMode} />
        <SourceBreakdown data={analytics.bySource} darkMode={darkMode} />
      </div>

      {/* Device & Browser Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Type */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary-600" />
            Device Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.byDevice || {}).map(([device, count]) => {
              const total = Object.values(analytics.byDevice).reduce((a, b) => a + b, 0);
              const percentage = ((count / total) * 100).toFixed(1);

              return (
                <div key={device}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {device}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary-600" />
            Browser Breakdown
          </h3>
          <div className="space-y-2">
            {Object.entries(analytics.byBrowser || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([browser, count]) => (
                <div
                  key={browser}
                  className="flex items-center justify-between text-sm py-2 border-b dark:border-gray-700 last:border-0"
                >
                  <span className="text-gray-700 dark:text-gray-300">{browser}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top Links */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Top Performing Links</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Short Code
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Campaign
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Target URL
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Clicks
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.topLinks?.slice(0, 10).map((link) => (
                <tr
                  key={link.shortCode}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4 text-sm font-mono text-primary-600 dark:text-primary-400">
                    {link.shortCode}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {link.campaign}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                    {link.targetUrl}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                    {link.clicks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Clicks */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          Recent Clicks
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Time
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Link
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Source
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Device
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentClicks?.slice(0, 20).map((click, index) => (
                <tr
                  key={index}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(click.clickedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-primary-600 dark:text-primary-400">
                    {click.shortCode}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {click.source}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {click.deviceType}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {click.country || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
