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

type ActiveDrawerType = 'none' | 'chat' | 'participants' | 'files';

export const MeetingPage: React.FC = () => {
  const { meetingId = 'room-default' } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  // Mutually Exclusive Drawer State (Prevents ANY window overlapping!)
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawerType>('none');
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
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

  const toggleDrawer = (drawer: ActiveDrawerType) => {
    setActiveDrawer((prev) => (prev === drawer ? 'none' : drawer));
    if (drawer === 'chat') {
      setUnreadChatCount(0);
    }
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

      {/* Main Content Area: Video Grid + Optional Docked Sidebar (Zero Overlap!) */}
      <div className="flex-1 relative overflow-hidden flex flex-row min-h-0">
        {/* Center Video Stage (Flexibly takes available width) */}
        <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#121316] min-w-0">
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
        </main>

        {/* Mutually Exclusive Docked Sidebars (Only ONE rendered at a time!) */}
        {activeDrawer === 'chat' && (
          <div className="w-full sm:w-80 h-full flex-shrink-0 z-30">
            <ChatDrawer
              isOpen={true}
              onClose={() => setActiveDrawer('none')}
              meetingId={meetingId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              socket={socket}
            />
          </div>
        )}

        {activeDrawer === 'participants' && (
          <div className="w-full sm:w-80 h-full flex-shrink-0 z-30">
            <ParticipantsDrawer
              isOpen={true}
              onClose={() => setActiveDrawer('none')}
              meetingId={meetingId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              remotePeers={remotePeers}
            />
          </div>
        )}

        {activeDrawer === 'files' && (
          <div className="w-full sm:w-80 h-full flex-shrink-0 z-30">
            <FileShareDrawer
              isOpen={true}
              onClose={() => setActiveDrawer('none')}
              meetingId={meetingId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              socket={socket}
            />
          </div>
        )}
      </div>

      {/* Zoom Style Bottom Dock */}
      <ControlBar
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        chatOpen={activeDrawer === 'chat'}
        participantsOpen={activeDrawer === 'participants'}
        whiteboardOpen={whiteboardOpen}
        filesOpen={activeDrawer === 'files'}
        participantCount={1 + remotePeers.length}
        unreadChatCount={unreadChatCount}
        isStudioCameraMode={isStudioCameraMode}
        localStream={localStream}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={() => toggleDrawer('chat')}
        onToggleParticipants={() => toggleDrawer('participants')}
        onToggleWhiteboard={() => setWhiteboardOpen(!whiteboardOpen)}
        onToggleFiles={() => toggleDrawer('files')}
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
