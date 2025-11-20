import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createList,
  updateList,
  deleteList,
  reorderLists,
} from '../controllers/listController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create list in a board
router.post('/boards/:boardId/lists', createList);

// Update list
router.put('/lists/:id', updateList);

// Delete list
router.delete('/lists/:id', deleteList);

// Reorder lists
router.patch('/lists/reorder', reorderLists);

export default router;
