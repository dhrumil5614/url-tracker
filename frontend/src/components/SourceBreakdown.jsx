import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

/**
 * SourceBreakdown Component
 * Shows distribution of clicks by source (Instagram, Facebook, etc.)
 */
const SourceBreakdown = ({ data, darkMode, viewType = 'pie' }) => {
  // Colors for different sources
  const COLORS = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    direct: '#6B7280',
    unknown: '#9CA3AF',
  };

  // Transform data for recharts
  const chartData = Object.entries(data || {}).map(([source, clicks]) => ({
    name: source.charAt(0).toUpperCase() + source.slice(1),
    value: clicks,
    color: COLORS[source.toLowerCase()] || COLORS.unknown,
  }));

  if (chartData.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>

      {viewType === 'pie' ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: darkMode ? '#f3f4f6' : '#111827',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis
              dataKey="name"
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: darkMode ? '#f3f4f6' : '#111827',
              }}
            />
            <Bar dataKey="value" fill="#0ea5e9">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Summary list */}
      <div className="mt-4 space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {item.value} clicks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceBreakdown;
