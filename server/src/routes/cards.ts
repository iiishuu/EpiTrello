import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
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

export default router;
