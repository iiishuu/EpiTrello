import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

// GET /api/boards - Get all boards for authenticated user
export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get boards where user is owner
    const boards = await prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            lists: true,
          },
        },
      },
    });

    res.status(200).json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/boards - Create a new board
export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { name, color, description, useTemplate } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Board name is required' });
      return;
    }

    // Validate color format (hex color)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      res.status(400).json({ error: 'Invalid color format. Use hex format (e.g., #0079BF)' });
      return;
    }

    const board = await prisma.board.create({
      data: {
        name,
        color: color || '#0079BF', // Default blue color
        description: description || '',
        userId,
      },
    });

    // If useTemplate is true, create default lists and cards
    if (useTemplate) {
      // Create "To Do" list
      const todoList = await prisma.list.create({
        data: {
          title: 'To Do',
          position: 0,
          boardId: board.id,
        },
      });

      // Create "In Progress" list
      const inProgressList = await prisma.list.create({
        data: {
          title: 'In Progress',
          position: 1,
          boardId: board.id,
        },
      });

      // Create "Done" list
      const doneList = await prisma.list.create({
        data: {
          title: 'Done',
          position: 2,
          boardId: board.id,
        },
      });

      // Create sample cards for To Do list
      await prisma.card.create({
        data: {
          title: 'Welcome to your board!',
          description: 'This is a sample card. Click to edit or delete it.',
          position: 0,
          listId: todoList.id,
        },
      });

      await prisma.card.create({
        data: {
          title: 'Try dragging cards between lists',
          description: 'You can move cards by dragging them to different lists.',
          position: 1,
          listId: todoList.id,
        },
      });

      // Create sample card for In Progress list
      await prisma.card.create({
        data: {
          title: 'Add labels and members to cards',
          description: 'Click on a card to add labels, members, and due dates.',
          position: 0,
          listId: inProgressList.id,
        },
      });

      // Create sample card for Done list
      await prisma.card.create({
        data: {
          title: 'Board setup complete',
          description: 'You can now start organizing your tasks!',
          position: 0,
          listId: doneList.id,
        },
      });
    }

    res.status(201).json({
      message: 'Board created successfully',
      board,
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/boards/:id - Get a specific board
export const getBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
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
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    // Check if user is the owner
    if (board.userId !== userId) {
      res.status(403).json({ error: 'You do not have access to this board' });
      return;
    }

    res.status(200).json({ board });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/boards/:id - Update a board
export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, color, description } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if board exists and user is owner
    const board = await prisma.board.findUnique({
      where: { id },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.userId !== userId) {
      res.status(403).json({ error: 'You do not have permission to update this board' });
      return;
    }

    // Validate color format if provided
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      res.status(400).json({ error: 'Invalid color format. Use hex format (e.g., #0079BF)' });
      return;
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;

    const updatedBoard = await prisma.board.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: 'Board updated successfully',
      board: updatedBoard,
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/boards/:id - Delete a board
export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if board exists and user is owner
    const board = await prisma.board.findUnique({
      where: { id },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.userId !== userId) {
      res.status(403).json({ error: 'You do not have permission to delete this board' });
      return;
    }

    // Delete the board (cascade will delete related lists, cards, etc.)
    await prisma.board.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Board deleted successfully',
    });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
