import { Router, Request, Response } from 'express';
import axios from 'axios';
import { createError } from '../middleware/errorHandler';

const router = Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

// Get conversation token
router.post('/token', async (req: Request, res: Response, next) => {
  try {
    if (!ELEVENLABS_API_KEY) {
      throw createError('ELEVENLABS_API_KEY not configured', 500);
    }

    const { org_id } = req.body;

    const tokenUrl = new URL('https://api.elevenlabs.io/v1/convai/conversation/token');
    tokenUrl.searchParams.set('agent_id', ELEVENLABS_AGENT_ID || '');

    const response = await axios.get(tokenUrl.toString(), {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    });

    const toolsBaseUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/jobber`;

    res.json({
      token: response.data.token,
      agent_id: ELEVENLABS_AGENT_ID,
      org_id,
      tools_config: {
        base_url: toolsBaseUrl,
        endpoints: {
          availability: `${toolsBaseUrl}/availability`,
          book: `${toolsBaseUrl}/book`,
          health: `${toolsBaseUrl}/health`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
