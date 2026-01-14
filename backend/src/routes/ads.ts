import { Router, Request, Response } from 'express';
import axios from 'axios';
import { query, queryOne, execute } from '../db';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Refresh Google token
async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  try {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  } catch (error) {
    logger.error('Failed to refresh Google token:', error);
    return null;
  }
}

// Refresh Meta token
async function refreshMetaToken(accessToken: string): Promise<{ access_token: string; expires_in?: number } | null> {
  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: accessToken,
      },
    });
    return response.data;
  } catch (error) {
    logger.error('Failed to refresh Meta token:', error);
    return null;
  }
}

// Google Ads Metrics
router.post('/google/metrics', async (req: Request, res: Response, next) => {
  try {
    const { org_id, start_date, end_date } = req.body;

    if (!org_id) {
      throw createError('Missing org_id', 400);
    }

    const account = await queryOne<any>(
      `SELECT * FROM integration_ad_accounts WHERE org_id = $1 AND provider = 'google_ads'`,
      [org_id]
    );

    if (!account || account.status !== 'connected') {
      return res.json({
        connected: false,
        metrics: null,
        campaigns: [],
      });
    }

    // Check token expiry and refresh if needed
    let accessToken = account.access_token;
    const expiresAt = new Date(account.token_expires_at).getTime();
    
    if (expiresAt - Date.now() < 5 * 60 * 1000 && account.refresh_token) {
      const newTokens = await refreshGoogleToken(account.refresh_token);
      if (newTokens) {
        accessToken = newTokens.access_token;
        const newExpiry = new Date(Date.now() + newTokens.expires_in * 1000);
        await execute(
          `UPDATE integration_ad_accounts SET access_token = $1, token_expires_at = $2, updated_at = NOW() WHERE id = $3`,
          [accessToken, newExpiry, account.id]
        );
      }
    }

    // TODO: Implement actual Google Ads API calls
    // For now, return mock data
    const mockMetrics = {
      impressions: 45230,
      clicks: 1847,
      cost: 892.45,
      conversions: 23,
      ctr: 4.08,
      cpc: 0.48,
    };

    res.json({
      connected: true,
      metrics: mockMetrics,
      campaigns: [
        { id: '1', name: 'Brand Awareness', status: 'ENABLED', impressions: 25000, clicks: 1200, cost: 450, conversions: 12 },
        { id: '2', name: 'Lead Generation', status: 'ENABLED', impressions: 20230, clicks: 647, cost: 442.45, conversions: 11 },
      ],
    });
  } catch (error) {
    next(error);
  }
});

// Meta Ads Metrics
router.post('/meta/metrics', async (req: Request, res: Response, next) => {
  try {
    const { org_id, start_date, end_date } = req.body;

    if (!org_id) {
      throw createError('Missing org_id', 400);
    }

    const account = await queryOne<any>(
      `SELECT * FROM integration_ad_accounts WHERE org_id = $1 AND provider = 'meta_ads'`,
      [org_id]
    );

    if (!account || account.status !== 'connected') {
      return res.json({
        connected: false,
        metrics: null,
        campaigns: [],
      });
    }

    let accessToken = account.access_token;
    const expiresAt = new Date(account.token_expires_at).getTime();

    // Refresh if expiring soon
    if (expiresAt - Date.now() < 7 * 24 * 60 * 60 * 1000) {
      const newTokens = await refreshMetaToken(accessToken);
      if (newTokens) {
        accessToken = newTokens.access_token;
        const newExpiry = new Date(Date.now() + (newTokens.expires_in || 5184000) * 1000);
        await execute(
          `UPDATE integration_ad_accounts SET access_token = $1, token_expires_at = $2, updated_at = NOW() WHERE id = $3`,
          [accessToken, newExpiry, account.id]
        );
      }
    }

    // TODO: Implement actual Meta Ads API calls
    // For now, return mock data
    const mockMetrics = {
      impressions: 67890,
      clicks: 2341,
      spend: 1245.67,
      conversions: 45,
      ctr: 3.45,
      cpc: 0.53,
    };

    res.json({
      connected: true,
      metrics: mockMetrics,
      campaigns: [
        { id: '1', name: 'Facebook Leads', status: 'ACTIVE', impressions: 40000, clicks: 1500, spend: 700, conversions: 28 },
        { id: '2', name: 'Instagram Awareness', status: 'ACTIVE', impressions: 27890, clicks: 841, spend: 545.67, conversions: 17 },
      ],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
