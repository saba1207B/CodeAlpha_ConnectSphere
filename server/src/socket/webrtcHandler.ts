import { Server, Socket } from 'socket.io';

export const registerWebRTCHandler = (io: Server, socket: Socket) => {
  // WebRTC Offer forwarding
  socket.on('webrtc:offer', (payload) => {
    io.to(payload.targetSocketId).emit('webrtc:offer', payload);
  });

  // WebRTC Answer forwarding
  socket.on('webrtc:answer', (payload) => {
    io.to(payload.targetSocketId).emit('webrtc:answer', payload);
  });

  // ICE Candidate forwarding
  socket.on('webrtc:ice-candidate', (payload) => {
    io.to(payload.targetSocketId).emit('webrtc:ice-candidate', payload);
  });

  // Media state changes (mute, video off)
  socket.on('media:state-change', ({ meetingId, type, isMuted, isVideoOff }) => {
    socket.to(meetingId).emit('media:peer-state-change', {
      socketId: socket.id,
      type,
      isMuted,
      isVideoOff
    });
  });

  // Screen share events
  socket.on('screen:start', ({ meetingId }) => {
    socket.to(meetingId).emit('screen:started', { socketId: socket.id });
  });

  socket.on('screen:stop', ({ meetingId }) => {
    socket.to(meetingId).emit('screen:stopped', { socketId: socket.id });
  });
};
