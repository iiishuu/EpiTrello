import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

// Create a new card in a list
export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listId } = req.params;
    const { title, description, dueDate } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Card title is required' });
      return;
    }

    // Verify list exists and user has access through board
    const list = await prisma.list.findUnique({
      where: { id: listId },
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

    // Get the highest position for this list
    const lastCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
    });

    const position = lastCard ? lastCard.position + 1 : 0;

    // Create the card
    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        position,
        listId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        labels: {
          include: {
            label: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: 'Card created successfully',
      card,
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a card
export const updateCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the card and verify ownership through board
    const card = await prisma.card.findUnique({
      where: { id },
      include: { list: { include: { board: true } } },
    });

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (card.list.board.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Update the card
    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        labels: {
          include: {
            label: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: 'Card updated successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a card
export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the card and verify ownership through board
    const card = await prisma.card.findUnique({
      where: { id },
      include: { list: { include: { board: true } } },
    });

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (card.list.board.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Delete the card
    await prisma.card.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Card deleted successfully',
    });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Move card to different list or reorder
export const moveCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { listId, position } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the card and verify ownership
    const card = await prisma.card.findUnique({
      where: { id },
      include: { list: { include: { board: true } } },
    });

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (card.list.board.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // If moving to different list, verify new list exists and belongs to same board
    if (listId && listId !== card.listId) {
      const newList = await prisma.list.findUnique({
        where: { id: listId },
      });

      if (!newList) {
        res.status(404).json({ error: 'Target list not found' });
        return;
      }

      if (newList.boardId !== card.list.boardId) {
        res.status(400).json({ error: 'Cannot move card to a different board' });
        return;
      }
    }

    // Update card
    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        ...(listId && { listId }),
        ...(position !== undefined && { position }),
      },
      include: {
        labels: {
          include: {
            label: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: 'Card moved successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reorder multiple cards
export const reorderCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cards } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      res.status(400).json({ error: 'Cards array is required' });
      return;
    }

    // Verify all cards belong to user
    const cardIds = cards.map((c: any) => c.id);
    const dbCards = await prisma.card.findMany({
      where: { id: { in: cardIds } },
      include: { list: { include: { board: true } } },
    });

    if (dbCards.length !== cards.length) {
      res.status(404).json({ error: 'Some cards not found' });
      return;
    }

    // Check ownership
    const unauthorized = dbCards.some((card) => card.list.board.userId !== userId);
    if (unauthorized) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Update cards in a transaction
    await prisma.$transaction(
      cards.map((cardUpdate: { id: string; position: number; listId?: string }) =>
        prisma.card.update({
          where: { id: cardUpdate.id },
          data: {
            position: cardUpdate.position,
            ...(cardUpdate.listId && { listId: cardUpdate.listId }),
          },
        })
      )
    );

    // Fetch updated cards
    const updatedCards = await prisma.card.findMany({
      where: { id: { in: cardIds } },
      include: {
        labels: {
          include: {
            label: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: 'Cards reordered successfully',
      cards: updatedCards,
    });
  } catch (error) {
    console.error('Reorder cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
