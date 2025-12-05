import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createLabel,
  getLabels,
  updateLabel,
  deleteLabel,
} from '../controllers/labelController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Label routes for boards
router.post('/boards/:id/labels', createLabel);
router.get('/boards/:id/labels', getLabels);
router.put('/boards/:boardId/labels/:labelId', updateLabel);
router.delete('/boards/:boardId/labels/:labelId', deleteLabel);

export default router;
