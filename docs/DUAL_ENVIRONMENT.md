# IGY6 Rooted - Dual Environment Setup

## Overview

This project supports dual environments:
- **Lovable Cloud** → Development/Testing (real-time preview)
- **Self-Hosted** → Production (you manage deployment)

## Folder Structure

```
├── database/           # PostgreSQL schema for production
│   ├── schema.sql      # Complete database schema
│   ├── functions.sql   # Database functions & triggers
│   ├── seed.sql        # Initial seed data
│   └── README.md
│
├── backend/            # Node.js Express server
│   ├── src/            # TypeScript source
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── src/                # React frontend (shared)
└── supabase/           # Lovable Cloud edge functions
```

## Workflow

1. **Develop in Lovable** → Changes sync to GitHub automatically
2. **Test in Preview** → Real-time testing with Lovable Cloud backend
3. **Deploy Production**:
   - Set up PostgreSQL with `database/schema.sql`
   - Deploy `backend/` to your Node.js host
   - Build React frontend and deploy to CDN/static host
   - Configure environment variables

## Frontend Environment

For production, update the frontend to point to your backend:

```env
# Production .env
VITE_API_URL=https://your-backend-domain.com/api
```

The frontend code in `src/` works with both Lovable Cloud (edge functions) and self-hosted (Node.js backend).
