import express from 'express';
import { processAIQuery } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', optionalAuth, processAIQuery);

export default router;
