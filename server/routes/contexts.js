import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createContext, getMyContexts, addMember, leaveContext } from '../controllers/contextController.js';

const router = Router();

router.post('/', authenticateToken, createContext);
router.get('/', authenticateToken, getMyContexts);
router.post('/:id/members', authenticateToken, addMember);
router.delete('/:id/members/:userId', authenticateToken, leaveContext);

export default router;
