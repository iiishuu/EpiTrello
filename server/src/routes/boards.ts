import { Router } from 'express';
import {
  getBoards,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
} from '../controllers/boardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All board routes require authentication
router.use(authMiddleware);

// GET /api/boards - Get all boards for user
router.get('/', getBoards);

// POST /api/boards - Create new board
router.post('/', createBoard);

// GET /api/boards/:id - Get specific board
router.get('/:id', getBoard);

// PUT /api/boards/:id - Update board
router.put('/:id', updateBoard);

// DELETE /api/boards/:id - Delete board
router.delete('/:id', deleteBoard);

export default router;
