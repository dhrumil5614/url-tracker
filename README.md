# Link Tracker - Marketing Analytics Platform

A comprehensive link tracking and analytics system designed for marketing campaigns across social media platforms. Track clicks, analyze traffic sources, and measure campaign performance with detailed insights.

![Link Tracker](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### Backend (Node.js + Express + MongoDB)
- **Link Shortening**: Create short, trackable links with custom or auto-generated codes
- **Real-time Analytics**: Track every click with detailed metrics
- **UTM Parameters**: Full support for marketing attribution
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Geographic Tracking**: IP-based location detection
- **Device Detection**: Parse user agents for device, browser, and OS information
- **Campaign Management**: Group and analyze links by campaign
- **Data Export**: Export analytics to CSV format

### Frontend (React + Tailwind CSS)
- **Link Creator**: Intuitive form to create tracked links for multiple platforms
- **Analytics Dashboard**: Comprehensive visualization of metrics
- **Interactive Charts**: Line charts for trends, pie charts for distributions
- **Dark Mode**: Full dark mode support with persistent settings
- **Responsive Design**: Mobile-first design that works on all devices
- **Copy-to-Clipboard**: Quick copy functionality for generated links
- **Platform-Specific URLs**: Pre-configured links for Instagram, Facebook, Twitter, LinkedIn

### Analytics Tracked
- Total clicks and click-through rates
- Traffic sources (Instagram, Facebook, Twitter, LinkedIn, Direct)
- Device breakdown (Mobile, Tablet, Desktop)
- Browser and OS statistics
- Geographic data (Country, Region, City)
- Clicks over time (daily trends)
- Campaign performance metrics
- Recent click activity

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **nanoid** - Short code generation
- **ua-parser-js** - User agent parsing
- **geoip-lite** - IP geolocation
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for visualizations
- **Axios** - HTTP client
- **lucide-react** - Icon library
- **date-fns** - Date utilities

## Project Structure

```
link-tracker/
├── backend/
│   ├── models/
│   │   ├── Link.js              # Link schema and model
│   │   └── Click.js             # Click/analytics schema
│   ├── routes/
│   │   ├── links.js             # Link creation and redirect routes
│   │   └── analytics.js         # Analytics API routes
│   ├── middleware/
│   │   └── rateLimiter.js       # Rate limiting configurations
│   ├── utils/
│   │   ├── shortCodeGenerator.js # Short code generation
│   │   └── userAgentParser.js   # User agent and IP parsing
│   ├── server.js                # Express app configuration
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LinkCreator.jsx         # Link creation form
│   │   │   ├── AnalyticsDashboard.jsx  # Main dashboard
│   │   │   ├── ClicksChart.jsx         # Line chart component
│   │   │   └── SourceBreakdown.jsx     # Pie/bar chart component
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/link-tracker
   BASE_URL=http://localhost:5000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Start the backend server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

   The build output will be in the `dist` directory.

## API Endpoints

### Links

#### Create a new tracked link
```http
POST /api/links
Content-Type: application/json

{
  "targetUrl": "https://example.com/property",
  "campaign": "summer-2024",
  "customShortCode": "abc123",  // optional
  "utmSource": "instagram",     // optional
  "utmMedium": "social",        // optional
  "utmCampaign": "summer-sale", // optional
  "utmContent": "banner-ad"     // optional
}
```

**Response:**
```json
{
  "success": true,
  "link": {
    "shortCode": "abc123",
    "shortUrl": "http://localhost:5000/abc123",
    "targetUrl": "https://example.com/property",
    "campaign": "summer-2024",
    "platformUrls": {
      "instagram": "http://localhost:5000/abc123?source=instagram",
      "facebook": "http://localhost:5000/abc123?source=facebook",
      "twitter": "http://localhost:5000/abc123?source=twitter",
      "linkedin": "http://localhost:5000/abc123?source=linkedin",
      "direct": "http://localhost:5000/abc123"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Redirect to target URL (with tracking)
```http
GET /:shortCode?source=instagram
```

This endpoint:
- Records the click with analytics data
- Increments the click counter
- Redirects to the target URL

#### Get all links
```http
GET /api/links?page=1&limit=20
```

#### Delete a link
```http
DELETE /api/links/:shortCode
```

### Analytics

#### Get analytics for a specific link
```http
GET /api/analytics/:shortCode?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "link": {
      "shortCode": "abc123",
      "targetUrl": "https://example.com",
      "campaign": "summer-2024"
    },
    "totalClicks": 1250,
    "bySource": {
      "instagram": 450,
      "facebook": 380,
      "twitter": 220,
      "linkedin": 150,
      "direct": 50
    },
    "byDevice": {
      "mobile": 800,
      "desktop": 350,
      "tablet": 100
    },
    "byDate": {
      "2024-01-15": 45,
      "2024-01-16": 67,
      "2024-01-17": 52
    },
    "recentClicks": [...]
  }
}
```

#### Get campaign analytics
```http
GET /api/analytics/campaign/:campaign?startDate=2024-01-01&endDate=2024-12-31
```

#### Get dashboard overview
```http
GET /api/analytics/dashboard/overview?startDate=2024-01-01&endDate=2024-12-31
```

#### Export analytics to CSV
```http
GET /api/analytics/export/:shortCode?startDate=2024-01-01&endDate=2024-12-31
```

## Usage Guide

### Creating a Tracked Link

1. Open the application in your browser
2. Click on the "Create Link" tab
3. Fill in the required fields:
   - **Target URL**: The destination URL (e.g., property listing page)
   - **Campaign Name**: Identifier for your campaign
   - **Custom Short Code** (optional): Specify a custom code or leave empty for auto-generation
   - **UTM Parameters** (optional): Add marketing attribution parameters
4. Click "Create Tracked Link"
5. Copy the platform-specific URLs for sharing on social media

### Viewing Analytics

1. Click on the "Analytics" tab
2. View the dashboard with:
   - Total links, clicks, and campaigns
   - Clicks over time chart
   - Traffic source distribution
   - Device and browser breakdowns
   - Top performing links
   - Recent click activity
3. Use the date range filter to analyze specific time periods
4. Export data to CSV for further analysis

### Sharing Links

Use the platform-specific URLs to properly track traffic sources:
- **Instagram**: `http://yourdomain.com/abc123?source=instagram`
- **Facebook**: `http://yourdomain.com/abc123?source=facebook`
- **Twitter**: `http://yourdomain.com/abc123?source=twitter`
- **LinkedIn**: `http://yourdomain.com/abc123?source=linkedin`

## Deployment

### Backend Deployment (Node.js)

#### Option 1: Traditional VPS (Ubuntu/Debian)

1. **Install Node.js and MongoDB**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs mongodb
   ```

2. **Clone and setup**
   ```bash
   git clone <your-repo>
   cd link-tracker/backend
   npm install --production
   ```

3. **Configure environment**
   ```bash
   nano .env
   # Set production values
   ```

4. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name link-tracker-api
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
docker build -t link-tracker-backend .
docker run -d -p 5000:5000 --env-file .env link-tracker-backend
```

#### Option 3: Cloud Platforms

- **Heroku**: Add `Procfile` with `web: node server.js`
- **Railway**: Connect GitHub repo and deploy
- **DigitalOcean App Platform**: Use Node.js buildpack
- **AWS Elastic Beanstalk**: Deploy Node.js application

### Frontend Deployment

#### Option 1: Static Hosting

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to static hosts**:
   - **Vercel**: `vercel --prod`
   - **Netlify**: `netlify deploy --prod --dir=dist`
   - **GitHub Pages**: Deploy `dist` folder
   - **AWS S3 + CloudFront**: Upload `dist` to S3 bucket

#### Option 2: Nginx

```bash
# Build
cd frontend
npm run build

# Copy to nginx
sudo cp -r dist/* /var/www/html/

# Nginx config
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Database (MongoDB)

#### Option 1: MongoDB Atlas (Managed)
1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

#### Option 2: Self-hosted
```bash
# Install MongoDB
sudo apt-get install mongodb

# Start service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Environment Variables for Production

**Backend `.env`:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/link-tracker
BASE_URL=https://links.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Frontend `.env`:**
```env
VITE_API_URL=https://api.yourdomain.com
```

## Security Considerations

- Rate limiting is enabled by default to prevent abuse
- Helmet.js provides security headers
- Input validation using express-validator
- MongoDB injection protection via Mongoose
- CORS configured for specific origins
- Environment variables for sensitive data
- IP address anonymization options available

## Performance Optimization

- MongoDB indexes on frequently queried fields
- Click recording is non-blocking (doesn't delay redirects)
- Efficient aggregation pipelines for analytics
- Frontend code splitting and lazy loading
- Tailwind CSS purging for minimal bundle size
- Recharts for performant data visualization

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify `.env` file exists with correct values
- Check port 5000 is not in use: `lsof -i :5000`

### Frontend can't connect to backend
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running and accessible

### Analytics not recording
- Check MongoDB connection
- Verify rate limiter isn't blocking requests
- Check browser console for errors

### Links not redirecting
- Verify link exists in database
- Check if link is expired or inactive
- Review server logs for errors

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@yourdomain.com

## Roadmap

Future enhancements planned:
- [ ] QR code generation for links
- [ ] A/B testing capabilities
- [ ] Email notifications for campaign milestones
- [ ] API authentication with JWT
- [ ] Bulk link creation
- [ ] Advanced filtering and search
- [ ] Custom domain support
- [ ] Link preview cards
- [ ] Team collaboration features
- [ ] Webhook integrations

## Acknowledgments

- Built with modern web technologies
- Designed for marketing professionals
- Optimized for real estate and e-commerce campaigns

---

**Made with ❤️ for marketers and growth teams**
