import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
  addLabelToCard,
  removeLabelFromCard,
  addMemberToCard,
  removeMemberFromCard,
} from '../controllers/cardController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Card routes
router.post('/lists/:listId/cards', createCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);
router.patch('/cards/:id/move', moveCard);
router.patch('/cards/reorder', reorderCards);

// Label management on cards
router.post('/cards/:id/labels/:labelId', addLabelToCard);
router.delete('/cards/:id/labels/:labelId', removeLabelFromCard);

// Member management on cards
router.post('/cards/:id/members/:userId', addMemberToCard);
router.delete('/cards/:id/members/:userId', removeMemberFromCard);

export default router;
