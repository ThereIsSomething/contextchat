import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getHistory, sendMessage } from '../controllers/messageController.js';

const router = Router();

router.get('/:contextId', authenticateToken, getHistory);
router.post('/', authenticateToken, sendMessage);

export default router;
