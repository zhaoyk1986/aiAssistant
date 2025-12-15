import express from 'express';
import { handleChatRequest } from '../services/zhipuService';

const router = express.Router();

// Chat endpoint with streaming support
router.post('/stream', async (req, res) => {
  try {
    console.log('Received request to /api/chat/stream');
    await handleChatRequest(req, res);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
