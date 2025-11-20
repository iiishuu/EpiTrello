import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

// Create a new list in a board
export const createList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { name } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'List name is required' });
      return;
    }

    // Verify board exists and user has access
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get the highest position for this board
    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });

    const position = lastList ? lastList.position + 1 : 0;

    // Create the list
    const list = await prisma.list.create({
      data: {
        name: name.trim(),
        position,
        boardId,
      },
      include: {
        cards: true,
      },
    });

    res.status(201).json({
      message: 'List created successfully',
      list,
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a list
export const updateList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the list and verify ownership through board
    const list = await prisma.list.findUnique({
      where: { id },
      include: { board: true },
    });

    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    if (list.board.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'List name is required' });
      return;
    }

    // Update the list
    const updatedList = await prisma.list.update({
      where: { id },
      data: {
        name: name.trim(),
      },
      include: {
        cards: true,
      },
    });

    res.status(200).json({
      message: 'List updated successfully',
      list: updatedList,
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a list
export const deleteList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the list and verify ownership through board
    const list = await prisma.list.findUnique({
      where: { id },
      include: { board: true },
    });

    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    if (list.board.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Delete the list (cards will be cascade deleted)
    await prisma.list.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'List deleted successfully',
    });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reorder lists
export const reorderLists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lists } = req.body; // Array of { id, position }
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!Array.isArray(lists) || lists.length === 0) {
      res.status(400).json({ error: 'Invalid lists data' });
      return;
    }

    // Verify all lists belong to user's boards
    const listIds = lists.map((l: any) => l.id);
    const dbLists = await prisma.list.findMany({
      where: {
        id: { in: listIds },
      },
      include: { board: true },
    });

    if (dbLists.length !== lists.length) {
      res.status(404).json({ error: 'Some lists not found' });
      return;
    }

    // Verify ownership
    const unauthorized = dbLists.some((list) => list.board.userId !== userId);
    if (unauthorized) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Update positions
    await prisma.$transaction(
      lists.map((list: any) =>
        prisma.list.update({
          where: { id: list.id },
          data: { position: list.position },
        })
      )
    );

    res.status(200).json({
      message: 'Lists reordered successfully',
    });
  } catch (error) {
    console.error('Reorder lists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
