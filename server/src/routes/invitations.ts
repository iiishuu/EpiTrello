import { Router } from 'express';
import {
  inviteToBoard,
  getInvitation,
  acceptInvitation,
  getBoardInvitations,
} from '../controllers/invitationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// POST /api/boards/:boardId/invitations - Send invitation (protected)
router.post('/boards/:boardId/invitations', authMiddleware, inviteToBoard);

// GET /api/invitations/:token - Get invitation details (public)
router.get('/invitations/:token', getInvitation);

// POST /api/invitations/:token/accept - Accept invitation (protected)
router.post('/invitations/:token/accept', authMiddleware, acceptInvitation);

// GET /api/boards/:boardId/invitations - Get board invitations (protected)
router.get('/boards/:boardId/invitations', authMiddleware, getBoardInvitations);

export default router;
