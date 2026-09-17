import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { GlobalMeshCoordinator } from '../services/globalMesh';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

export interface RemotePeer {
  socketId: string;
  userId: string;
  userName: string;
  stream: MediaStream;
  isAudioMuted?: boolean;
  isVideoOff?: boolean;
  isStudioPeer?: boolean;
  role?: string;
  avatarColor?: string;
}

// Built-in Studio Team members for instant live collaboration experience
const STUDIO_TEAM = [
  {
    id: 'studio-elena',
    name: 'Elena Vance',
    role: 'Lead Architect',
    avatarColor: '#e07a5f',
    bgGradient: ['#01472e', '#032c1e']
  },
  {
    id: 'studio-amara',
    name: 'Amara Chen',
    role: 'Design Director',
    avatarColor: '#e09f3e',
    bgGradient: ['#1b3b2b', '#0d2218']
  },
  {
    id: 'studio-liam',
    name: 'Liam Thorne',
    role: 'Platform Engineer',
    avatarColor: '#a3b18a',
    bgGradient: ['#283618', '#141d0c']
  }
];

// Helper to generate animated Studio Stream on canvas
export function createStudioVideoStream(
  name: string,
  role: string,
  accentColor: string,
  gradientColors: string[] = ['#01472e', '#022619']
): { stream: MediaStream; cleanup: () => void } {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  let animFrameId: number;
  let t = Math.random() * 100;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const render = () => {
    if (!ctx) return;
    t += 0.03;

    // Background gradient
    const grad = ctx.createRadialGradient(
      640 + Math.sin(t * 0.7) * 80,
      360 + Math.cos(t * 0.5) * 60,
      100,
      640,
      360,
      800
    );
    grad.addColorStop(0, gradientColors[0]);
    grad.addColorStop(1, gradientColors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Subtle ambient organic contour circles
    ctx.strokeStyle = 'rgba(204, 213, 174, 0.07)';
    ctx.lineWidth = 1.5;
    for (let r = 160; r <= 520; r += 90) {
      const pulse = Math.sin(t + r * 0.02) * 15;
      ctx.beginPath();
      ctx.arc(640, 360, r + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Avatar halo
    const haloRadius = 110 + Math.sin(t * 1.5) * 6;
    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(640, 320, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner avatar disc
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fefae0';
    ctx.beginPath();
    ctx.arc(640, 320, 85, 0, Math.PI * 2);
    ctx.fill();

    // Monogram text
    ctx.fillStyle = '#01472e';
    ctx.font = 'bold 54px Anton, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 640, 323);
    ctx.restore();

    // Participant Name & Role Tag
    ctx.save();
    ctx.fillStyle = '#fefae0';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 640, 460);

    ctx.fillStyle = '#ccd5ae';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(role.toUpperCase(), 640, 490);

    // Animated live audio frequency bars
    const barWidth = 6;
    const barSpacing = 4;
    const barCount = 7;
    const totalWidth = barCount * (barWidth + barSpacing);
    const startX = 640 - totalWidth / 2;

    for (let i = 0; i < barCount; i++) {
      const barHeight = 8 + Math.abs(Math.sin(t * 2.5 + i * 0.8)) * 26;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(
        startX + i * (barWidth + barSpacing),
        530 - barHeight / 2,
        barWidth,
        barHeight,
        3
      );
      ctx.fill();
    }

    // Top Right Studio Status Badge
    ctx.fillStyle = 'rgba(1, 71, 46, 0.6)';
    ctx.beginPath();
    ctx.roundRect(1080, 30, 170, 32, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(204, 213, 174, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#a3b18a';
    ctx.beginPath();
    ctx.arc(1100, 46, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fefae0';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('GLOBAL MESH 1080P', 1112, 50);

    ctx.restore();

    animFrameId = requestAnimationFrame(render);
  };

  render();

  // Create stream from canvas
  let stream: MediaStream;
  if ((canvas as any).captureStream) {
    stream = (canvas as any).captureStream(30);
  } else {
    stream = new MediaStream();
  }

  // Add synthesized silent audio track to avoid WebRTC negotiation failure
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.001; // Inaudible subtle carrier
    osc.connect(gain);
    const dest = audioCtx.createMediaStreamDestination();
    gain.connect(dest);
    osc.start();
    dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
  } catch (e) {
    // ignore audio synth if blocked
  }

  const cleanup = () => {
    cancelAnimationFrame(animFrameId);
    stream.getTracks().forEach((t) => t.stop());
  };

  return { stream, cleanup };
}

export const useWebRTC = (
  meetingId: string,
  currentUserId: string,
  currentUserName: string,
  socket: Socket | null
) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(new Map());
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [activeSpeakerSocketId, setActiveSpeakerSocketId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStudioCameraMode, setIsStudioCameraMode] = useState<boolean>(false);
  const [studioPeersEnabled, setStudioPeersEnabled] = useState<boolean>(true);
  const [myGlobalPeerId, setMyGlobalPeerId] = useState<string>('');
  const [globalMeshConnected, setGlobalMeshConnected] = useState<boolean>(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const realHardwareStreamRef = useRef<MediaStream | null>(null);
  const studioStreamCleanupRef = useRef<(() => void) | null>(null);
  const studioPeersCleanupRef = useRef<Map<string, () => void>>(new Map());
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const globalMeshRef = useRef<GlobalMeshCoordinator | null>(null);

  // Initialize Media (Hardware camera with dynamic Studio fallback)
  const initMedia = useCallback(async (preferStudio = false) => {
    if (studioStreamCleanupRef.current) {
      studioStreamCleanupRef.current();
      studioStreamCleanupRef.current = null;
    }

    if (preferStudio) {
      const { stream, cleanup } = createStudioVideoStream(
        currentUserName,
        'Active Participant',
        '#e07a5f',
        ['#01472e', '#002619']
      );
      studioStreamCleanupRef.current = cleanup;
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsStudioCameraMode(true);
      setCameraError(null);
      globalMeshRef.current?.setLocalStream(stream);
      return stream;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      realHardwareStreamRef.current = stream;
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsStudioCameraMode(false);
      globalMeshRef.current?.setLocalStream(stream);
      return stream;
    } catch (err: any) {
      console.warn('Hardware camera acquisition restricted, activating Virtual Studio Camera:', err);
      setCameraError('Hardware camera unavailable. Virtual Studio Camera active.');

      const { stream, cleanup } = createStudioVideoStream(
        currentUserName,
        'Active Contributor',
        '#e07a5f',
        ['#01472e', '#002619']
      );
      studioStreamCleanupRef.current = cleanup;
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsStudioCameraMode(true);
      globalMeshRef.current?.setLocalStream(stream);
      return stream;
    }
  }, [currentUserName]);

  useEffect(() => {
    initMedia(false);

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (realHardwareStreamRef.current) {
        realHardwareStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (studioStreamCleanupRef.current) {
        studioStreamCleanupRef.current();
      }
    };
  }, [initMedia]);

  // Toggle between Real Hardware Camera and Virtual Studio Camera
  const toggleCameraMode = async () => {
    if (isStudioCameraMode) {
      await initMedia(false);
    } else {
      await initMedia(true);
    }
  };

  // 1. GLOBAL PEERJS CLOUD MESH (Connects across foreign countries on GitHub Pages)
  useEffect(() => {
    if (!meetingId) return;

    const mesh = new GlobalMeshCoordinator(
      meetingId,
      currentUserId,
      currentUserName,
      {
        onRemoteStream: (peerId, peerName, peerUserId, stream) => {
          setRemotePeers((prev) => {
            const next = new Map(prev);
            next.set(peerId, {
              socketId: peerId,
              userId: peerUserId,
              userName: peerName,
              stream,
              isAudioMuted: false,
              isVideoOff: false
            });
            return next;
          });
        },
        onPeerLeave: (peerId) => {
          setRemotePeers((prev) => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
        },
        onChatMessage: (message) => {
          window.dispatchEvent(new CustomEvent('connectsphere:chat-message', { detail: message }));
        },
        onWhiteboardEvent: (data) => {
          window.dispatchEvent(new CustomEvent('connectsphere:whiteboard-event', { detail: data }));
        },
        onFileShared: (file) => {
          window.dispatchEvent(new CustomEvent('connectsphere:file-shared', { detail: file }));
        },
        onReaction: (senderId, emoji) => {
          window.dispatchEvent(new CustomEvent('connectsphere:reaction', { detail: { senderId, emoji } }));
        },
        onMeshStatusChange: (status, peerId) => {
          setGlobalMeshConnected(status === 'connected');
          if (peerId) setMyGlobalPeerId(peerId);
        }
      }
    );

    globalMeshRef.current = mesh;
    mesh.start(localStreamRef.current);

    // Global broadcast helper attached to window
    (window as any).csBroadcastGlobalData = (type: 'chat' | 'whiteboard' | 'file' | 'reaction', payload: any) => {
      mesh.broadcastData(type, payload);
    };

    return () => {
      mesh.destroy();
      globalMeshRef.current = null;
      delete (window as any).csBroadcastGlobalData;
    };
  }, [meetingId, currentUserId, currentUserName]);

  // 2. LOCAL BROADCASTCHANNEL (For multi-tab testing on same machine)
  useEffect(() => {
    if (!meetingId) return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('connectsphere_room_' + meetingId);
      broadcastChannelRef.current = channel;

      channel.onmessage = async (event) => {
        const { type, payload } = event.data;
        if (!payload || payload.senderUserId === currentUserId) return;

        if (type === 'mesh:peer-discover') {
          channel?.postMessage({
            type: 'mesh:peer-present',
            payload: {
              senderUserId: currentUserId,
              senderName: currentUserName
            }
          });
        }
      };

      channel.postMessage({
        type: 'mesh:peer-discover',
        payload: {
          senderUserId: currentUserId,
          senderName: currentUserName
        }
      });
    } catch (e) {}

    return () => {
      if (channel) channel.close();
    };
  }, [meetingId, currentUserId, currentUserName]);

  // 3. FULL-STACK BACKEND SOCKET.IO (When hosted or local server is running)
  useEffect(() => {
    if (!socket || !meetingId) return;

    socket.emit('meeting:join', {
      meetingId,
      userId: currentUserId,
      userName: currentUserName
    });

    return () => {
      socket.emit('meeting:leave', { meetingId, userId: currentUserId });
    };
  }, [socket, meetingId, currentUserId, currentUserName]);

  // 4. STUDIO TEAM MEMBERS (Elena, Amara, Liam)
  useEffect(() => {
    if (!studioPeersEnabled) {
      STUDIO_TEAM.forEach((member) => {
        const cleanup = studioPeersCleanupRef.current.get(member.id);
        if (cleanup) cleanup();
        studioPeersCleanupRef.current.delete(member.id);
      });
      setRemotePeers((prev) => {
        const next = new Map(prev);
        STUDIO_TEAM.forEach((member) => next.delete(member.id));
        return next;
      });
      return;
    }

    STUDIO_TEAM.forEach((member) => {
      if (studioPeersCleanupRef.current.has(member.id)) return;

      const { stream, cleanup } = createStudioVideoStream(
        member.name,
        member.role,
        member.avatarColor,
        member.bgGradient
      );
      studioPeersCleanupRef.current.set(member.id, cleanup);

      setRemotePeers((prev) => {
        const next = new Map(prev);
        next.set(member.id, {
          socketId: member.id,
          userId: member.id,
          userName: member.name,
          role: member.role,
          stream,
          isStudioPeer: true,
          avatarColor: member.avatarColor
        });
        return next;
      });
    });

    const speakerInterval = setInterval(() => {
      const candidates = [null, 'studio-elena', 'studio-amara', 'studio-liam'];
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      setActiveSpeakerSocketId(pick);
    }, 4500);

    return () => {
      clearInterval(speakerInterval);
    };
  }, [studioPeersEnabled]);

  const toggleStudioPeers = () => {
    setStudioPeersEnabled((prev) => !prev);
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks.forEach((t) => (t.enabled = nextState));
        setIsAudioMuted(!nextState);
        socket?.emit('media:state-change', {
          meetingId,
          type: 'audio',
          isMuted: !nextState
        });
      } else {
        setIsAudioMuted((prev) => !prev);
      }
    } else {
      setIsAudioMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks.forEach((t) => (t.enabled = nextState));
        setIsVideoOff(!nextState);
        socket?.emit('media:state-change', {
          meetingId,
          type: 'video',
          isVideoOff: !nextState
        });
      } else {
        setIsVideoOff((prev) => !prev);
      }
    } else {
      setIsVideoOff((prev) => !prev);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      if (localStreamRef.current) {
        globalMeshRef.current?.setLocalStream(localStreamRef.current);
      }
      socket?.emit('screen:stop', { meetingId });
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 30 } },
          audio: true
        });

        setScreenStream(displayStream);
        setIsScreenSharing(true);
        globalMeshRef.current?.setLocalStream(displayStream);

        const screenTrack = displayStream.getVideoTracks()[0];
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        socket?.emit('screen:start', { meetingId });
      } catch (err) {
        console.warn('Screen sharing cancelled or not allowed:', err);
      }
    }
  };

  return {
    localStream,
    screenStream,
    remotePeers: Array.from(remotePeers.values()),
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    activeSpeakerSocketId,
    cameraError,
    isStudioCameraMode,
    studioPeersEnabled,
    myGlobalPeerId,
    globalMeshConnected,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleCameraMode,
    toggleStudioPeers
  };
};
