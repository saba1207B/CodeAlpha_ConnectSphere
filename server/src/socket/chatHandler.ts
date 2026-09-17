import { Server, Socket } from 'socket.io';
import { prisma } from '../prisma.js';

// In-memory message store per meeting for fast delivery
const meetingChatHistory: Map<string, any[]> = new Map();

export const registerChatHandler = (io: Server, socket: Socket) => {
  socket.on('chat:message', async (message) => {
    const { meetingId } = message;
    if (!meetingId) return;

    // Cache in memory
    const history = meetingChatHistory.get(meetingId) || [];
    history.push(message);
    if (history.length > 200) history.shift();
    meetingChatHistory.set(meetingId, history);

    // Broadcast to everyone else in the meeting room
    socket.to(meetingId).emit('chat:message', message);

    // Optionally persist in database
    try {
      if (message.senderId && !message.senderId.startsWith('anon-')) {
        await prisma.message.create({
          data: {
            meetingId,
            senderId: message.senderId,
            text: message.text
          }
        });
      }
    } catch (e) {
      // ignore persistence error for ad-hoc guest messages
    }
  });

  socket.on('chat:get-history', ({ meetingId }) => {
    const history = meetingChatHistory.get(meetingId) || [];
    socket.emit('chat:history', history);
  });
};
