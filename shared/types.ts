export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Meeting {
  id: string;
  title: string;
  hostId: string;
  hostName?: string;
  passCode?: string;
  isLocked: boolean;
  isEnded: boolean;
  createdAt: string;
  participantsCount?: number;
}

export type ParticipantRole = 'host' | 'presenter' | 'attendee';

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: ParticipantRole;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
}

export interface SharedFileItem {
  id: string;
  meetingId: string;
  uploaderId: string;
  uploaderName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  createdAt: string;
}

export interface WhiteboardPoint {
  x: number;
  y: number;
}

export type WhiteboardTool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text' | 'sticky';

export interface WhiteboardStroke {
  id: string;
  tool: WhiteboardTool;
  color: string;
  size: number;
  points: WhiteboardPoint[];
  text?: string;
  width?: number;
  height?: number;
  createdBy: string;
  creatorName: string;
}

export interface WhiteboardCursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
}

export interface WhiteboardState {
  strokes: WhiteboardStroke[];
  updatedAt: string;
}

export interface WebRTCOfferPayload {
  targetSocketId: string;
  callerSocketId: string;
  callerName: string;
  sdp: RTCSessionDescriptionInit;
}

export interface WebRTCAnswerPayload {
  targetSocketId: string;
  responderSocketId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface WebRTCIceCandidatePayload {
  targetSocketId: string;
  senderSocketId: string;
  candidate: RTCIceCandidateInit;
}
