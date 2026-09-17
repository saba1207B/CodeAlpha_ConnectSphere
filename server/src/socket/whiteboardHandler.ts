import { Server, Socket } from 'socket.io';
import { prisma } from '../prisma.js';

// In-memory whiteboard state cache
const whiteboardStates: Map<string, any[]> = new Map();

export const registerWhiteboardHandler = (io: Server, socket: Socket) => {
  // Live stroke broadcast
  socket.on('whiteboard:draw', async ({ meetingId, stroke }) => {
    if (!meetingId || !stroke) return;

    const strokes = whiteboardStates.get(meetingId) || [];
    strokes.push(stroke);
    whiteboardStates.set(meetingId, strokes);

    socket.to(meetingId).emit('whiteboard:draw', stroke);
  });

  // Bulk sync (after undo / redo)
  socket.on('whiteboard:sync', ({ meetingId, strokes }) => {
    if (!meetingId) return;
    whiteboardStates.set(meetingId, strokes || []);
    socket.to(meetingId).emit('whiteboard:sync', { strokes });
  });

  // Clear canvas
  socket.on('whiteboard:clear', async ({ meetingId }) => {
    if (!meetingId) return;
    whiteboardStates.set(meetingId, []);
    socket.to(meetingId).emit('whiteboard:clear');

    try {
      await prisma.whiteboard.upsert({
        where: { meetingId },
        update: { stateJson: '[]' },
        create: { meetingId, stateJson: '[]' }
      });
    } catch (e) {
      // ignore
    }
  });

  // Real-time cursor coordinates
  socket.on('whiteboard:cursor', (cursorData) => {
    const { meetingId } = cursorData;
    if (meetingId) {
      socket.to(meetingId).emit('whiteboard:cursor', cursorData);
    }
  });

  // Initial whiteboard state request
  socket.on('whiteboard:get-state', ({ meetingId }) => {
    const strokes = whiteboardStates.get(meetingId) || [];
    socket.emit('whiteboard:sync', { strokes });
  });
};
