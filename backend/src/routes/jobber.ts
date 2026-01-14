import { Router, Request, Response } from 'express';
import axios from 'axios';
import { query, queryOne, execute } from '../db';
import { AuthRequest, authenticate } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { verifyHmac } from '../utils/hmac';
import { logger } from '../utils/logger';

const router = Router();

const JOBBER_GRAPHQL_URL = 'https://api.getjobber.com/api/graphql';
const JOBBER_GRAPHQL_VERSION = '2024-09-16';

// Get valid access token (with auto-refresh)
async function getValidAccessToken(orgId: string): Promise<string | null> {
  const account = await queryOne<any>(
    `SELECT * FROM integration_jobber_accounts 
     WHERE org_id = $1 AND status = 'connected'`,
    [orgId]
  );

  if (!account) {
    logger.error('No connected Jobber account for org:', orgId);
    return null;
  }

  const expiresAt = new Date(account.token_expires_at).getTime();
  const now = Date.now();
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt - now > bufferMs) {
    return account.access_token;
  }

  // Refresh token
  logger.info('Refreshing expired token for org:', orgId);

  try {
    const response = await axios.post(
      'https://api.getjobber.com/api/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: account.refresh_token,
        client_id: process.env.JOBBER_CLIENT_ID!,
        client_secret: process.env.JOBBER_CLIENT_SECRET!,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const tokenData = response.data;
    const newExpiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

    await execute(
      `UPDATE integration_jobber_accounts 
       SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = NOW()
       WHERE id = $4`,
      [tokenData.access_token, tokenData.refresh_token || account.refresh_token, newExpiresAt, account.id]
    );

    return tokenData.access_token;
  } catch (error) {
    logger.error('Token refresh failed:', error);
    
    await execute(
      `UPDATE integration_jobber_accounts SET status = 'error', updated_at = NOW() WHERE id = $1`,
      [account.id]
    );
    
    return null;
  }
}

// Execute Jobber GraphQL query
async function jobberGraphQL(accessToken: string, queryStr: string, variables?: Record<string, any>): Promise<any> {
  const response = await axios.post(
    JOBBER_GRAPHQL_URL,
    { query: queryStr, variables },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-JOBBER-GRAPHQL-VERSION': JOBBER_GRAPHQL_VERSION,
      },
    }
  );

  if (response.data.errors) {
    throw new Error(response.data.errors[0]?.message || 'GraphQL error');
  }

  return response.data.data;
}

// Health check
router.get('/health', async (req: Request, res: Response, next) => {
  try {
    const orgId = req.query.org_id as string;
    
    if (!orgId) {
      throw createError('Missing org_id', 400);
    }

    const accessToken = await getValidAccessToken(orgId);

    res.json({
      status: accessToken ? 'connected' : 'not_connected',
      jobber_connected: !!accessToken,
      token_valid: !!accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// Get availability
router.post('/availability', async (req: Request, res: Response, next) => {
  try {
    const { org_id, service_type, zip, date_from, date_to, duration_minutes } = req.body;

    if (!org_id || !date_from || !date_to) {
      throw createError('Missing required fields', 400);
    }

    const accessToken = await getValidAccessToken(org_id);
    
    if (!accessToken) {
      throw createError('Jobber not connected', 503);
    }

    // Get appointment rules
    const rules = await queryOne<any>(
      `SELECT * FROM ai_appointment_rules WHERE org_id = $1`,
      [org_id]
    ) || {
      timezone: 'America/Chicago',
      default_duration_minutes: 120,
      business_hours: {
        mon: [['09:00', '17:00']],
        tue: [['09:00', '17:00']],
        wed: [['09:00', '17:00']],
        thu: [['09:00', '17:00']],
        fri: [['09:00', '17:00']],
        sat: [],
        sun: [],
      },
    };

    // Query Jobber schedule
    const scheduleQuery = `
      query GetSchedule($startDate: ISO8601Date!, $endDate: ISO8601Date!) {
        calendarEvents(filter: { startAt: { gte: $startDate, lte: $endDate } }, first: 100) {
          nodes {
            ... on Visit {
              id
              title
              startAt
              endAt
            }
          }
        }
      }
    `;

    const scheduleData = await jobberGraphQL(accessToken, scheduleQuery, {
      startDate: date_from.split('T')[0],
      endDate: date_to.split('T')[0],
    });

    // Generate available slots based on business hours
    const slots: Array<{ start: string; end: string; confidence: number }> = [];
    const existingEvents = scheduleData?.calendarEvents?.nodes || [];
    const businessHours = rules.business_hours as Record<string, string[][]>;
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const serviceDuration = duration_minutes || rules.default_duration_minutes;

    const startDate = new Date(date_from);
    const endDate = new Date(date_to);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayName = dayNames[d.getDay()];
      const dayHours = businessHours[dayName] || [];

      for (const [openTime, closeTime] of dayHours) {
        const [openH] = openTime.split(':').map(Number);
        const [closeH] = closeTime.split(':').map(Number);

        for (let h = openH; h < closeH; h++) {
          const slotStart = new Date(d);
          slotStart.setHours(h, 0, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);

          // Check for conflicts
          const hasConflict = existingEvents.some((event: any) => {
            const eventStart = new Date(event.startAt).getTime();
            const eventEnd = new Date(event.endAt).getTime();
            return slotStart.getTime() < eventEnd && slotEnd.getTime() > eventStart;
          });

          if (!hasConflict && slotStart.getTime() > Date.now()) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              confidence: 0.9,
            });
          }
        }
      }
    }

    res.json({
      org_id,
      service_type,
      slots: slots.slice(0, 20),
    });
  } catch (error) {
    next(error);
  }
});

// Book appointment
router.post('/book', async (req: Request, res: Response, next) => {
  try {
    const { org_id, customer, service_key, address, zip, slot, notes } = req.body;

    if (!org_id || !customer?.name || !customer?.phone || !service_key || !address || !slot?.start) {
      throw createError('Missing required fields', 400);
    }

    const accessToken = await getValidAccessToken(org_id);
    
    if (!accessToken) {
      throw createError('Jobber not connected', 503);
    }

    // Create or find client
    const searchQuery = `
      query SearchClients($searchTerm: String!) {
        clients(searchTerm: $searchTerm, first: 5) {
          nodes { id name phones { number } }
        }
      }
    `;

    const searchResult = await jobberGraphQL(accessToken, searchQuery, {
      searchTerm: customer.phone,
    });

    let clientId = searchResult?.clients?.nodes?.[0]?.id;

    if (!clientId) {
      // Create new client
      const createClientMutation = `
        mutation CreateClient($input: ClientCreateInput!) {
          clientCreate(input: $input) {
            client { id name }
            userErrors { message }
          }
        }
      `;

      const createResult = await jobberGraphQL(accessToken, createClientMutation, {
        input: {
          name: customer.name,
          phone: { number: customer.phone },
          email: customer.email ? { address: customer.email } : undefined,
        },
      });

      clientId = createResult?.clientCreate?.client?.id;
    }

    if (!clientId) {
      throw createError('Failed to create/find client', 500);
    }

    // Create job
    const createJobMutation = `
      mutation CreateJob($input: JobCreateInput!) {
        jobCreate(input: $input) {
          job { id title jobNumber }
          userErrors { message }
        }
      }
    `;

    const jobResult = await jobberGraphQL(accessToken, createJobMutation, {
      input: {
        clientId,
        title: service_key,
        description: `Address: ${address}, ${zip}\n${notes || ''}`,
      },
    });

    const jobId = jobResult?.jobCreate?.job?.id;

    // Create visit
    const createVisitMutation = `
      mutation CreateVisit($input: VisitCreateInput!) {
        visitCreate(input: $input) {
          visit { id title startAt endAt }
          userErrors { message }
        }
      }
    `;

    const visitResult = await jobberGraphQL(accessToken, createVisitMutation, {
      input: {
        jobId,
        startAt: slot.start,
        endAt: slot.end,
        title: service_key,
      },
    });

    const visit = visitResult?.visitCreate?.visit;

    // Log booking
    await execute(
      `INSERT INTO ai_bookings (org_id, customer_name, phone, email, service_type, address, slot_start, slot_end, notes, jobber_client_id, jobber_job_id, jobber_visit_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'scheduled')`,
      [org_id, customer.name, customer.phone, customer.email, service_key, address, slot.start, slot.end, notes, clientId, jobId, visit?.id]
    );

    res.json({
      status: 'booked',
      jobber_client_id: clientId,
      jobber_job_id: jobId,
      jobber_visit_id: visit?.id,
      scheduled_start: slot.start,
      scheduled_end: slot.end,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
