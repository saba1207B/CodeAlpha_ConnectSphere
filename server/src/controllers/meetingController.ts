import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { title, passCode } = req.body;
    const hostId = req.user?.id;

    if (!hostId) {
      return res.status(401).json({ message: 'Authentication required to create persistent room' });
    }

    const meetingSlug = 'cs-' + Math.random().toString(36).substring(2, 8);

    const meeting = await prisma.meeting.create({
      data: {
        id: meetingSlug,
        title: title || 'Editorial Collaborative Session',
        hostId,
        passCode: passCode || null,
        whiteboard: {
          create: {
            stateJson: '[]'
          }
        }
      },
      include: {
        host: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return res.status(201).json({ meeting });
  } catch (err: any) {
    console.error('Create meeting error:', err);
    return res.status(500).json({ message: 'Error creating meeting room' });
  }
};

export const getMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        host: {
          select: { id: true, name: true, avatarUrl: true }
        },
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true }
            }
          }
        }
      }
    });

    if (!meeting) {
      // Return synthetic ad-hoc room so anyone with a custom link can enter immediately
      return res.json({
        meeting: {
          id: meetingId,
          title: 'Ad-hoc Studio Room',
          isLocked: false,
          isEnded: false,
          createdAt: new Date().toISOString()
        }
      });
    }

    return res.json({ meeting });
  } catch (err: any) {
    console.error('Get meeting error:', err);
    return res.status(500).json({ message: 'Error retrieving meeting room' });
  }
};

export const getUserMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { hostId: userId },
          { participants: { some: { userId } } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        host: {
          select: { id: true, name: true }
        },
        participants: {
          select: { id: true }
        }
      }
    });

    return res.json({ meetings });
  } catch (err: any) {
    console.error('Get user meetings error:', err);
    return res.status(500).json({ message: 'Error retrieving your meetings' });
  }
};
