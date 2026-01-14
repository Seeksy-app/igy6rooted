# IGY6 Rooted Backend

Node.js/Express backend for production deployment.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Run in development
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Express app entry point
│   ├── db/
│   │   └── index.ts      # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.ts       # JWT authentication
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── health.ts     # Health check endpoint
│   │   ├── auth.ts       # Authentication routes
│   │   ├── jobber.ts     # Jobber API integration
│   │   ├── oauth.ts      # OAuth flows (Jobber, Google, Meta)
│   │   ├── ads.ts        # Ad metrics endpoints
│   │   └── elevenlabs.ts # ElevenLabs integration
│   └── utils/
│       ├── logger.ts     # Winston logger
│       └── hmac.ts       # HMAC signing utilities
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Health
- `GET /api/health` - Server health check

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Jobber
- `GET /api/jobber/health?org_id=` - Jobber connection status
- `POST /api/jobber/availability` - Get available slots
- `POST /api/jobber/book` - Book appointment

### OAuth
- `GET /api/oauth/jobber/start` - Start Jobber OAuth
- `GET /api/oauth/jobber/callback` - Jobber OAuth callback
- `GET /api/oauth/google/start` - Start Google Ads OAuth
- `GET /api/oauth/google/callback` - Google OAuth callback
- `GET /api/oauth/meta/start` - Start Meta Ads OAuth
- `GET /api/oauth/meta/callback` - Meta OAuth callback

### Ads Metrics
- `POST /api/ads/google/metrics` - Fetch Google Ads metrics
- `POST /api/ads/meta/metrics` - Fetch Meta Ads metrics

### ElevenLabs
- `POST /api/elevenlabs/token` - Get conversation token

## Environment Variables

See `.env.example` for all required environment variables.

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### PM2

```bash
npm run build
pm2 start dist/index.js --name igy6-backend
```

## Security

- Helmet.js for security headers
- Rate limiting on all API routes
- JWT authentication
- HMAC signature verification for ElevenLabs
- Input validation on all endpoints
