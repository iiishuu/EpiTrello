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

// POST /api/cards/:id/labels/:labelId - Add a label to a card
export const addLabelToCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id: cardId, labelId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the card and verify ownership through board
    const card = await prisma.card.findUnique({
      where: { id: cardId },
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

    // Verify label exists and belongs to the same board
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      res.status(404).json({ error: 'Label not found' });
      return;
    }

    if (label.boardId !== card.list.boardId) {
      res.status(400).json({ error: 'Label does not belong to this board' });
      return;
    }

    // Check if label is already added to the card
    const existing = await prisma.cardLabel.findUnique({
      where: {
        cardId_labelId: {
          cardId,
          labelId,
        },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Label already added to this card' });
      return;
    }

    // Add label to card
    await prisma.cardLabel.create({
      data: {
        cardId,
        labelId,
      },
    });

    // Fetch updated card with labels
    const updatedCard = await prisma.card.findUnique({
      where: { id: cardId },
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
      message: 'Label added to card successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Add label to card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/cards/:id/labels/:labelId - Remove a label from a card
export const removeLabelFromCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id: cardId, labelId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the card and verify ownership through board
    const card = await prisma.card.findUnique({
      where: { id: cardId },
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

    // Remove label from card
    const deleted = await prisma.cardLabel.deleteMany({
      where: {
        cardId,
        labelId,
      },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: 'Label not found on this card' });
      return;
    }

    // Fetch updated card with labels
    const updatedCard = await prisma.card.findUnique({
      where: { id: cardId },
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
      message: 'Label removed from card successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Remove label from card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/cards/:id/members/:userId - Add a member to a card
export const addMemberToCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authUserId = req.userId;
    const { id: cardId, userId: memberUserId } = req.params;

    if (!authUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the card and verify ownership through board
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: { include: { board: true } } },
    });

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (card.list.board.userId !== authUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Verify member exists
    const member = await prisma.user.findUnique({
      where: { id: memberUserId },
    });

    if (!member) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if member is already added to the card
    const existing = await prisma.cardMember.findUnique({
      where: {
        cardId_userId: {
          cardId,
          userId: memberUserId,
        },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Member already added to this card' });
      return;
    }

    // Add member to card
    await prisma.cardMember.create({
      data: {
        cardId,
        userId: memberUserId,
      },
    });

    // Fetch updated card with members
    const updatedCard = await prisma.card.findUnique({
      where: { id: cardId },
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
      message: 'Member added to card successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Add member to card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/cards/:id/members/:userId - Remove a member from a card
export const removeMemberFromCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authUserId = req.userId;
    const { id: cardId, userId: memberUserId } = req.params;

    if (!authUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the card and verify ownership through board
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: { include: { board: true } } },
    });

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (card.list.board.userId !== authUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Remove member from card
    const deleted = await prisma.cardMember.deleteMany({
      where: {
        cardId,
        userId: memberUserId,
      },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: 'Member not found on this card' });
      return;
    }

    // Fetch updated card with members
    const updatedCard = await prisma.card.findUnique({
      where: { id: cardId },
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
      message: 'Member removed from card successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Remove member from card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
