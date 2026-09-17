import { Server, Socket } from 'socket.io';
import { registerWebRTCHandler } from './webrtcHandler.js';
import { registerChatHandler } from './chatHandler.js';
import { registerWhiteboardHandler } from './whiteboardHandler.js';

interface RoomParticipant {
  socketId: string;
  userId: string;
  userName: string;
}

// Map room ID to active participants list
const activeRooms: Map<string, RoomParticipant[]> = new Map();

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    let currentMeetingId: string | null = null;
    let currentUserId: string | null = null;
    let currentUserName: string | null = null;

    // Join meeting room
    socket.on('meeting:join', ({ meetingId, userId, userName }) => {
      currentMeetingId = meetingId;
      currentUserId = userId;
      currentUserName = userName;

      socket.join(meetingId);

      const existingParticipants = activeRooms.get(meetingId) || [];

      // Send list of current room participants to newly joined user
      socket.emit('meeting:participants', existingParticipants);

      // Add new participant
      const newParticipant: RoomParticipant = {
        socketId: socket.id,
        userId,
        userName
      };

      const updatedParticipants = [...existingParticipants.filter((p) => p.socketId !== socket.id), newParticipant];
      activeRooms.set(meetingId, updatedParticipants);

      // Notify existing participants in the room
      socket.to(meetingId).emit('participant:joined', newParticipant);
    });

    // File sharing events
    socket.on('file:uploaded', ({ meetingId, file }) => {
      socket.to(meetingId).emit('file:uploaded', file);
    });

    socket.on('file:deleted', ({ meetingId, fileId }) => {
      socket.to(meetingId).emit('file:deleted', { fileId });
    });

    // Register sub-handlers
    registerWebRTCHandler(io, socket);
    registerChatHandler(io, socket);
    registerWhiteboardHandler(io, socket);

    // Leave meeting
    const handleLeave = () => {
      if (currentMeetingId) {
        const participants = activeRooms.get(currentMeetingId) || [];
        const filtered = participants.filter((p) => p.socketId !== socket.id);

        if (filtered.length === 0) {
          activeRooms.delete(currentMeetingId);
        } else {
          activeRooms.set(currentMeetingId, filtered);
        }

        socket.to(currentMeetingId).emit('participant:left', {
          socketId: socket.id,
          userId: currentUserId
        });

        socket.leave(currentMeetingId);
      }
    };

    socket.on('meeting:leave', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};
