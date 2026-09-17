import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { MeetingHeader } from '../components/meeting/MeetingHeader';
import { VideoGrid } from '../components/meeting/VideoGrid';
import { ControlBar } from '../components/meeting/ControlBar';
import { ChatDrawer } from '../components/meeting/ChatDrawer';
import { WhiteboardModal } from '../components/meeting/WhiteboardModal';
import { FileShareDrawer } from '../components/meeting/FileShareDrawer';
import { ParticipantsDrawer } from '../components/meeting/ParticipantsDrawer';
import { DeviceSettingsModal } from '../components/meeting/DeviceSettingsModal';

export const MeetingPage: React.FC = () => {
  const { meetingId = 'room-default' } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  // Drawer / modal open states
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeReactions, setActiveReactions] = useState<{ [id: string]: string }>({});
  const [viewMode, setViewMode] = useState<'gallery' | 'speaker'>('gallery');

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Clean User Identity - Never default to 'Guest Contributor'
  const currentUserId = useRef(user?.id || 'usr-' + Math.random().toString(36).substring(2, 9)).current;
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return user?.name || localStorage.getItem('cs_display_name') || 'You';
  });

  const handleRename = () => {
    const entered = prompt('Enter your meeting display name:', currentUserName === 'You' ? '' : currentUserName);
    if (entered && entered.trim()) {
      const clean = entered.trim();
      setCurrentUserName(clean);
      localStorage.setItem('cs_display_name', clean);
      (window as any).csUpdateUserName?.(clean);
    }
  };

  // WebRTC multi-peer mesh hook
  const {
    localStream,
    screenStream,
    remotePeers,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    activeSpeakerSocketId,
    cameraError,
    isStudioCameraMode,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleCameraMode
  } = useWebRTC(meetingId, currentUserId, currentUserName, socket);

  // Setup Reaction listeners
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_reactions_${meetingId}`);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const { senderId, emoji } = event.data;
        if (senderId && emoji) {
          setActiveReactions((prev) => ({ ...prev, [senderId]: emoji }));
          setTimeout(() => {
            setActiveReactions((prev) => {
              const next = { ...prev };
              delete next[senderId];
              return next;
            });
          }, 2600);
        }
      };
    } catch (e) {}

    // Global PeerJS Mesh reaction listener
    const handleGlobalReaction = (e: any) => {
      const { senderId, emoji } = e.detail || {};
      if (senderId && emoji) {
        setActiveReactions((prev) => ({ ...prev, [senderId]: emoji }));
        setTimeout(() => {
          setActiveReactions((prev) => {
            const next = { ...prev };
            delete next[senderId];
            return next;
          });
        }, 2600);
      }
    };
    window.addEventListener('connectsphere:reaction', handleGlobalReaction);

    if (socket) {
      const handleReaction = (data: { senderId: string; emoji: string }) => {
        setActiveReactions((prev) => ({ ...prev, [data.senderId]: data.emoji }));
        setTimeout(() => {
          setActiveReactions((prev) => {
            const next = { ...prev };
            delete next[data.senderId];
            return next;
          });
        }, 2600);
      };

      socket.on('meeting:reaction', handleReaction);

      return () => {
        socket.off('meeting:reaction', handleReaction);
        window.removeEventListener('connectsphere:reaction', handleGlobalReaction);
        if (bc) bc.close();
      };
    }

    return () => {
      window.removeEventListener('connectsphere:reaction', handleGlobalReaction);
      if (bc) bc.close();
    };
  }, [socket, meetingId]);

  const handleSendReaction = (emoji: string) => {
    setActiveReactions((prev) => ({ ...prev, local: emoji }));
    setTimeout(() => {
      setActiveReactions((prev) => {
        const next = { ...prev };
        delete next.local;
        return next;
      });
    }, 2600);

    socket?.emit('meeting:reaction', {
      meetingId,
      senderId: currentUserId,
      emoji
    });

    broadcastChannelRef.current?.postMessage({
      senderId: currentUserId,
      emoji
    });

    (window as any).csBroadcastGlobalData?.('reaction', {
      senderId: currentUserId,
      emoji
    });
  };

  const handleLeaveMeeting = () => {
    if (confirm('Are you sure you want to leave this Zoom meeting?')) {
      navigate('/dashboard');
    }
  };

  const handleToggleChat = () => {
    setChatOpen(!chatOpen);
    if (!chatOpen) setUnreadChatCount(0);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'gallery' ? 'speaker' : 'gallery'));
  };

  return (
    <div className="relative h-screen w-screen bg-[#121316] text-zinc-200 overflow-hidden flex flex-col justify-between select-none">
      {/* Zoom Style Top Header */}
      <MeetingHeader
        meetingId={meetingId}
        meetingTitle="Zoom Meeting"
        participantCount={1 + remotePeers.length}
        isConnected={isConnected}
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
        onRename={handleRename}
      />

      {/* Main Video Stage */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#121316]">
        <VideoGrid
          localStream={localStream}
          screenStream={screenStream}
          remotePeers={remotePeers}
          currentUserName={currentUserName}
          isAudioMuted={isAudioMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          activeSpeakerSocketId={activeSpeakerSocketId}
          activeReactions={activeReactions}
          viewMode={viewMode}
          onRename={handleRename}
          onStopScreenShare={toggleScreenShare}
        />

        {/* Camera fallback notice if hardware blocked */}
        {cameraError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg bg-[#20232b] border border-[#373b49] text-xs font-medium text-amber-400 shadow-xl flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Virtual Camera Active (Webcam Unavailable)</span>
          </div>
        )}

        {/* Side Drawers */}
        <ChatDrawer
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          meetingId={meetingId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          socket={socket}
        />

        <ParticipantsDrawer
          isOpen={participantsOpen}
          onClose={() => setParticipantsOpen(false)}
          meetingId={meetingId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          isAudioMuted={isAudioMuted}
          isVideoOff={isVideoOff}
          remotePeers={remotePeers}
        />

        <FileShareDrawer
          isOpen={filesOpen}
          onClose={() => setFilesOpen(false)}
          meetingId={meetingId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          socket={socket}
        />
      </main>

      {/* Zoom Style Bottom Dock */}
      <ControlBar
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        chatOpen={chatOpen}
        participantsOpen={participantsOpen}
        whiteboardOpen={whiteboardOpen}
        filesOpen={filesOpen}
        participantCount={1 + remotePeers.length}
        unreadChatCount={unreadChatCount}
        isStudioCameraMode={isStudioCameraMode}
        localStream={localStream}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={handleToggleChat}
        onToggleParticipants={() => setParticipantsOpen(!participantsOpen)}
        onToggleWhiteboard={() => setWhiteboardOpen(!whiteboardOpen)}
        onToggleFiles={() => setFilesOpen(!filesOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
        onLeaveMeeting={handleLeaveMeeting}
        onToggleCameraMode={toggleCameraMode}
        onSendReaction={handleSendReaction}
      />

      {/* Full Whiteboard Modal */}
      <WhiteboardModal
        isOpen={whiteboardOpen}
        onClose={() => setWhiteboardOpen(false)}
        meetingId={meetingId}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        socket={socket}
      />

      {/* Device Settings Modal */}
      <DeviceSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
