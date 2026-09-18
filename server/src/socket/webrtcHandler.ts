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

  // Meeting reactions
  socket.on('meeting:reaction', ({ meetingId, senderId, emoji }) => {
    socket.to(meetingId).emit('meeting:reaction', { senderId, emoji });
  });

  // Hand raises
  socket.on('meeting:hand-raise', ({ meetingId, userId }) => {
    socket.to(meetingId).emit('meeting:hand-raise', { userId });
  });

  // Live Captions
  socket.on('meeting:caption', ({ meetingId, caption }) => {
    socket.to(meetingId).emit('meeting:caption', caption);
  });

  // Interactive slide deck changes
  socket.on('meeting:slide-change', ({ meetingId, slideIndex, embedUrl }) => {
    socket.to(meetingId).emit('meeting:slide-change', { slideIndex, embedUrl });
  });

  // Live Polls
  socket.on('meeting:polls-update', ({ meetingId, polls }) => {
    socket.to(meetingId).emit('meeting:polls-update', polls);
  });

  // Q&A
  socket.on('meeting:qna-update', ({ meetingId, questions }) => {
    socket.to(meetingId).emit('meeting:qna-update', questions);
  });

  // Collaborative Notes
  socket.on('meeting:notes-update', ({ meetingId, content, senderId }) => {
    socket.to(meetingId).emit('meeting:notes-update', { content, senderId });
  });

  // Host Moderation: Force Mute All
  socket.on('meeting:force-mute-all', ({ meetingId }) => {
    socket.to(meetingId).emit('meeting:force-mute', { targetUserId: 'all' });
  });

  // Host Moderation: Force Mute Specific User
  socket.on('meeting:force-mute-user', ({ meetingId, targetSocketId }) => {
    io.to(targetSocketId).emit('meeting:force-mute', { targetUserId: targetSocketId });
  });

  // Host Moderation: Kick User
  socket.on('meeting:kick-user', ({ meetingId, targetSocketId }) => {
    io.to(targetSocketId).emit('meeting:kicked');
  });
};
