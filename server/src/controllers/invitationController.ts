import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

// POST /api/boards/:boardId/invitations
export const inviteToBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const { email } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Check if board exists and user is the owner
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.userId !== userId) {
      res.status(403).json({ error: 'Only board owner can send invitations' });
      return;
    }

    // Check if invitation already exists for this email and board
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        boardId,
        status: 'pending',
      },
    });

    if (existingInvitation) {
      res.status(409).json({ error: 'Invitation already sent to this email' });
      return;
    }

    // Generate unique token and set expiration (7 days)
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        boardId,
        senderId: userId,
        status: 'pending',
        expiresAt,
      },
      include: {
        board: {
          select: {
            id: true,
            name: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation,
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/invitations/:token
export const getInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      res.status(410).json({ error: 'Invitation has expired' });
      return;
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      res.status(400).json({ error: 'Invitation has already been used' });
      return;
    }

    res.status(200).json({ invitation });
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/invitations/:token/accept
export const acceptInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'You must be logged in to accept invitations' });
      return;
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        board: true,
      },
    });

    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      res.status(410).json({ error: 'Invitation has expired' });
      return;
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      res.status(400).json({ error: 'Invitation has already been used' });
      return;
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if invitation email matches user email
    if (user.email !== invitation.email) {
      res.status(403).json({ 
        error: 'This invitation was sent to a different email address' 
      });
      return;
    }

    // Update invitation status to accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    });

    res.status(200).json({
      message: 'Invitation accepted successfully',
      board: invitation.board,
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/boards/:boardId/invitations
export const getBoardInvitations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if board exists and user is the owner
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.userId !== userId) {
      res.status(403).json({ error: 'Only board owner can view invitations' });
      return;
    }

    // Get all pending invitations for this board
    const invitations = await prisma.invitation.findMany({
      where: {
        boardId,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ invitations });
  } catch (error) {
    console.error('Get board invitations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
