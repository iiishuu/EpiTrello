import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

// POST /api/boards/:id/labels - Create a new label for a board
export const createLabel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id: boardId } = req.params;
    const { name, color } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!name || !color) {
      res.status(400).json({ error: 'Label name and color are required' });
      return;
    }

    // Validate color format (hex color)
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      res.status(400).json({ error: 'Invalid color format. Use hex format (e.g., #FF5733)' });
      return;
    }

    // Check if board exists and user is owner
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.userId !== userId) {
      res.status(403).json({ error: 'You do not have permission to add labels to this board' });
      return;
    }

    const label = await prisma.label.create({
      data: {
        name,
        color,
        boardId,
      },
    });

    res.status(201).json({
      message: 'Label created successfully',
      label,
    });
  } catch (error) {
    console.error('Create label error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/boards/:id/labels - Get all labels for a board
export const getLabels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id: boardId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if board exists and user has access
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.userId !== userId) {
      res.status(403).json({ error: 'You do not have access to this board' });
      return;
    }

    const labels = await prisma.label.findMany({
      where: { boardId },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ labels });
  } catch (error) {
    console.error('Get labels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/boards/:boardId/labels/:labelId - Update a label
export const updateLabel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { boardId, labelId } = req.params;
    const { name, color } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if board exists and user is owner
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.userId !== userId) {
      res.status(403).json({ error: 'You do not have permission to update labels on this board' });
      return;
    }

    // Check if label exists and belongs to this board
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      res.status(404).json({ error: 'Label not found' });
      return;
    }

    if (label.boardId !== boardId) {
      res.status(403).json({ error: 'Label does not belong to this board' });
      return;
    }

    // Validate color format if provided
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      res.status(400).json({ error: 'Invalid color format. Use hex format (e.g., #FF5733)' });
      return;
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    const updatedLabel = await prisma.label.update({
      where: { id: labelId },
      data: updateData,
    });

    res.status(200).json({
      message: 'Label updated successfully',
      label: updatedLabel,
    });
  } catch (error) {
    console.error('Update label error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/boards/:boardId/labels/:labelId - Delete a label
export const deleteLabel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { boardId, labelId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if board exists and user is owner
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.userId !== userId) {
      res.status(403).json({ error: 'You do not have permission to delete labels on this board' });
      return;
    }

    // Check if label exists and belongs to this board
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      res.status(404).json({ error: 'Label not found' });
      return;
    }

    if (label.boardId !== boardId) {
      res.status(403).json({ error: 'Label does not belong to this board' });
      return;
    }

    // Delete the label (cascade will remove from all cards)
    await prisma.label.delete({
      where: { id: labelId },
    });

    res.status(200).json({
      message: 'Label deleted successfully',
    });
  } catch (error) {
    console.error('Delete label error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
