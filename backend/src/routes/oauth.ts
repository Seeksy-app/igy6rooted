import { Router, Request, Response } from 'express';
import axios from 'axios';
import { query, queryOne, execute } from '../db';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// ============================================
// JOBBER OAUTH
// ============================================

router.get('/jobber/start', async (req: Request, res: Response, next) => {
  try {
    const { org_id, redirect_uri } = req.query;

    if (!org_id || !redirect_uri) {
      throw createError('Missing org_id or redirect_uri', 400);
    }

    const state = Buffer.from(JSON.stringify({ org_id, redirect_uri })).toString('base64');

    const authUrl = new URL('https://api.getjobber.com/api/oauth/authorize');
    authUrl.searchParams.set('client_id', process.env.JOBBER_CLIENT_ID!);
    authUrl.searchParams.set('redirect_uri', `${process.env.JOBBER_REDIRECT_URI}`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'read_clients write_clients read_jobs write_jobs read_visits write_visits read_schedules');

    res.redirect(authUrl.toString());
  } catch (error) {
    next(error);
  }
});

router.get('/jobber/callback', async (req: Request, res: Response, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      throw createError(`OAuth error: ${error}`, 400);
    }

    if (!code || !state) {
      throw createError('Missing code or state', 400);
    }

    const { org_id, redirect_uri } = JSON.parse(Buffer.from(state as string, 'base64').toString());

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://api.getjobber.com/api/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: process.env.JOBBER_CLIENT_ID!,
        client_secret: process.env.JOBBER_CLIENT_SECRET!,
        redirect_uri: process.env.JOBBER_REDIRECT_URI!,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const tokenData = tokenResponse.data;
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

    // Get Jobber account info
    const accountResponse = await axios.post(
      'https://api.getjobber.com/api/graphql',
      { query: '{ account { id name } }' },
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'X-JOBBER-GRAPHQL-VERSION': '2024-09-16',
        },
      }
    );

    const accountId = accountResponse.data.data?.account?.id;

    // Upsert tokens
    await execute(
      `INSERT INTO integration_jobber_accounts (org_id, jobber_account_id, access_token, refresh_token, token_expires_at, status)
       VALUES ($1, $2, $3, $4, $5, 'connected')
       ON CONFLICT (org_id) DO UPDATE SET 
         jobber_account_id = $2, access_token = $3, refresh_token = $4, token_expires_at = $5, status = 'connected', updated_at = NOW()`,
      [org_id, accountId, tokenData.access_token, tokenData.refresh_token, expiresAt]
    );

    await execute(
      `INSERT INTO jobber_connections (org_id, jobber_account_id, status, connected_at)
       VALUES ($1, $2, 'connected', NOW())
       ON CONFLICT (org_id) DO UPDATE SET 
         jobber_account_id = $2, status = 'connected', connected_at = NOW(), updated_at = NOW()`,
      [org_id, accountId]
    );

    res.redirect(`${redirect_uri}?jobber_connected=true`);
  } catch (error) {
    logger.error('Jobber OAuth callback error:', error);
    next(error);
  }
});

// ============================================
// GOOGLE ADS OAUTH
// ============================================

router.get('/google/start', async (req: Request, res: Response, next) => {
  try {
    const { org_id, redirect_uri } = req.query;

    if (!org_id || !redirect_uri) {
      throw createError('Missing org_id or redirect_uri', 400);
    }

    const state = Buffer.from(JSON.stringify({ org_id })).toString('base64');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
    authUrl.searchParams.set('redirect_uri', `${req.protocol}://${req.get('host')}/api/oauth/google/callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.email');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    res.redirect(authUrl.toString());
  } catch (error) {
    next(error);
  }
});

router.get('/google/callback', async (req: Request, res: Response, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      throw createError(`OAuth error: ${error}`, 400);
    }

    const { org_id } = JSON.parse(Buffer.from(state as string, 'base64').toString());

    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${req.protocol}://${req.get('host')}/api/oauth/google/callback`,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const tokenData = tokenResponse.data;
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

    // Get user email
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    await execute(
      `INSERT INTO integration_ad_accounts (org_id, provider, account_name, access_token, refresh_token, token_expires_at, status, connected_at)
       VALUES ($1, 'google_ads', $2, $3, $4, $5, 'connected', NOW())
       ON CONFLICT (org_id, provider) DO UPDATE SET 
         account_name = $2, access_token = $3, refresh_token = $4, token_expires_at = $5, status = 'connected', connected_at = NOW(), updated_at = NOW()`,
      [org_id, userResponse.data.email, tokenData.access_token, tokenData.refresh_token, expiresAt]
    );

    res.redirect('/integrations?google_connected=true');
  } catch (error) {
    logger.error('Google OAuth callback error:', error);
    next(error);
  }
});

// ============================================
// META ADS OAUTH
// ============================================

router.get('/meta/start', async (req: Request, res: Response, next) => {
  try {
    const { org_id, redirect_uri } = req.query;

    if (!org_id || !redirect_uri) {
      throw createError('Missing org_id or redirect_uri', 400);
    }

    const state = Buffer.from(JSON.stringify({ org_id })).toString('base64');

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', process.env.META_APP_ID!);
    authUrl.searchParams.set('redirect_uri', `${req.protocol}://${req.get('host')}/api/oauth/meta/callback`);
    authUrl.searchParams.set('scope', 'ads_read,ads_management,business_management');
    authUrl.searchParams.set('state', state);

    res.redirect(authUrl.toString());
  } catch (error) {
    next(error);
  }
});

router.get('/meta/callback', async (req: Request, res: Response, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      throw createError(`OAuth error: ${error}`, 400);
    }

    const { org_id } = JSON.parse(Buffer.from(state as string, 'base64').toString());

    // Exchange for short-lived token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${req.protocol}://${req.get('host')}/api/oauth/meta/callback`,
        code,
      },
    });

    // Exchange for long-lived token
    const longLivedResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: tokenResponse.data.access_token,
      },
    });

    const tokenData = longLivedResponse.data;
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 5184000) * 1000);

    // Get user info
    const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: { access_token: tokenData.access_token, fields: 'id,name' },
    });

    await execute(
      `INSERT INTO integration_ad_accounts (org_id, provider, account_id, account_name, access_token, token_expires_at, status, connected_at)
       VALUES ($1, 'meta_ads', $2, $3, $4, $5, 'connected', NOW())
       ON CONFLICT (org_id, provider) DO UPDATE SET 
         account_id = $2, account_name = $3, access_token = $4, token_expires_at = $5, status = 'connected', connected_at = NOW(), updated_at = NOW()`,
      [org_id, userResponse.data.id, userResponse.data.name, tokenData.access_token, expiresAt]
    );

    res.redirect('/integrations?meta_connected=true');
  } catch (error) {
    logger.error('Meta OAuth callback error:', error);
    next(error);
  }
});

export default router;
