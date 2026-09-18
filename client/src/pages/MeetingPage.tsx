import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { useLiveCaptions } from '../hooks/useLiveCaptions';
import { MeetingHeader, MeetingLayoutMode } from '../components/meeting/MeetingHeader';
import { VideoGrid } from '../components/meeting/VideoGrid';
import { ControlBar } from '../components/meeting/ControlBar';
import { ChatDrawer } from '../components/meeting/ChatDrawer';
import { WhiteboardModal } from '../components/meeting/WhiteboardModal';
import { FileShareDrawer } from '../components/meeting/FileShareDrawer';
import { ParticipantsDrawer } from '../components/meeting/ParticipantsDrawer';
import { DeviceSettingsModal, VideoQualityLevel } from '../components/meeting/DeviceSettingsModal';
import { CaptionsOverlay } from '../components/meeting/CaptionsOverlay';
import { KeyboardShortcutsModal } from '../components/meeting/KeyboardShortcutsModal';
import { PresentationSlidesModal } from '../components/meeting/PresentationSlidesModal';
import { PollsDrawer } from '../components/meeting/PollsDrawer';
import { QnADrawer } from '../components/meeting/QnADrawer';
import { NotesDrawer } from '../components/meeting/NotesDrawer';
import { AIAssistantDrawer } from '../components/meeting/AIAssistantDrawer';
import { WaitingRoomModal, WaitingParticipant } from '../components/meeting/WaitingRoomModal';
import { HostControlsModal, MeetingSecuritySettings } from '../components/meeting/HostControlsModal';
import { audioProcessor } from '../services/audioProcessor';
import { VisualFilter, VirtualBackground } from '../services/videoEffects';

type ActiveDrawerType = 'none' | 'chat' | 'participants' | 'files' | 'polls' | 'qna' | 'notes' | 'ai';

export const MeetingPage: React.FC = () => {
  const { meetingId = 'room-default' } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  // Drawers & Modals
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawerType>('none');
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [slidesOpen, setSlidesOpen] = useState(false);
  const [hostControlsOpen, setHostControlsOpen] = useState(false);

  // Meeting State
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeReactions, setActiveReactions] = useState<{ [id: string]: string }>({});
  const [layoutMode, setLayoutMode] = useState<MeetingLayoutMode>('gallery');

  // Security & Host Controls
  const [isHost, setIsHost] = useState(true);
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(false);
  const [pendingParticipants, setPendingParticipants] = useState<WaitingParticipant[]>([]);
  const [securitySettings, setSecuritySettings] = useState<MeetingSecuritySettings>({
    isLocked: false,
    waitingRoomEnabled: false,
    allowScreenShare: true,
    allowChat: true,
    allowUnmute: true,
    allowVideo: true,
    allowRename: true
  });

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Clean User Identity
  const currentUserId = useRef(user?.id || 'usr-' + Math.random().toString(36).substring(2, 9)).current;
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return user?.name || localStorage.getItem('cs_display_name') || 'You';
  });

  const handleRename = () => {
    if (!securitySettings.allowRename && !isHost) {
      alert('The host has disabled participant renaming for this meeting.');
      return;
    }
    const entered = prompt('Enter your meeting display name:', currentUserName === 'You' ? '' : currentUserName);
    if (entered && entered.trim()) {
      const clean = entered.trim();
      setCurrentUserName(clean);
      localStorage.setItem('cs_display_name', clean);
      (window as any).csUpdateUserName?.(clean);
    }
  };

  // WebRTC multi-peer mesh hook with quality & audio chimes
  const {
    localStream,
    screenStream,
    remotePeers,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    activeSpeakerSocketId,
    isStudioCameraMode,
    videoQuality,
    raisedHands,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleCameraMode,
    toggleHandRaise,
    setVideoQuality,
    switchDevice,
    applyEffects
  } = useWebRTC(meetingId, currentUserId, currentUserName, socket);

  // Speech Recognition & Live Captions Hook
  const {
    captionsEnabled,
    selectedLanguage,
    activeCaption,
    transcriptHistory,
    toggleCaptions,
    setSelectedLanguage
  } = useLiveCaptions(meetingId, currentUserId, currentUserName, socket);

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

  // Push-To-Talk & Global Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Push to Talk (Spacebar)
      if (e.code === 'Space' && !e.repeat && isAudioMuted) {
        e.preventDefault();
        toggleAudio();
        const handleKeyUp = (upEvent: KeyboardEvent) => {
          if (upEvent.code === 'Space') {
            toggleAudio();
            window.removeEventListener('keyup', handleKeyUp);
          }
        };
        window.addEventListener('keyup', handleKeyUp);
        return;
      }

      // Alt shortcuts
      if (e.altKey) {
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          toggleAudio();
        } else if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          toggleVideo();
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          toggleScreenShare();
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          toggleCaptions();
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          toggleHandRaise();
        } else if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          toggleDrawer('chat');
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          toggleDrawer('participants');
        } else if (e.key.toLowerCase() === 'w') {
          e.preventDefault();
          setWhiteboardOpen((prev) => !prev);
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setActiveDrawer('none');
        setWhiteboardOpen(false);
        setSettingsOpen(false);
        setShortcutsOpen(false);
        setSlidesOpen(false);
        setHostControlsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAudioMuted, toggleAudio, toggleVideo, toggleScreenShare, toggleCaptions, toggleHandRaise]);

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
    if (confirm('Are you sure you want to leave this ConnectSphere meeting?')) {
      navigate('/dashboard');
    }
  };

  const toggleDrawer = (drawer: ActiveDrawerType) => {
    setActiveDrawer((prev) => (prev === drawer ? 'none' : drawer));
    if (drawer === 'chat') {
      setUnreadChatCount(0);
    }
  };

  // Host Moderation Handlers
  const handleMuteAll = () => {
    socket?.emit('meeting:force-mute-all', { meetingId });
    try {
      const bc = new BroadcastChannel(`connectsphere_signals_${meetingId}`);
      bc.postMessage({ type: 'force-mute', payload: { targetUserId: 'all' } });
      bc.close();
    } catch (e) {}
    alert('Muted all meeting participants.');
  };

  const handleMuteParticipant = (socketId: string) => {
    socket?.emit('meeting:force-mute-user', { meetingId, targetSocketId: socketId });
  };

  const handleRemoveParticipant = (socketId: string) => {
    if (confirm('Remove this participant from the meeting?')) {
      socket?.emit('meeting:kick-user', { meetingId, targetSocketId: socketId });
    }
  };

  const handlePromoteCoHost = (socketId: string) => {
    alert('Participant promoted to Co-Host.');
  };

  // Waiting room admission
  const handleAdmit = (userId: string) => {
    audioProcessor.playAdmitChime();
    setPendingParticipants((prev) => prev.filter((p) => p.userId !== userId));
    socket?.emit('meeting:admit-user', { meetingId, userId });
  };

  const handleAdmitAll = () => {
    audioProcessor.playAdmitChime();
    setPendingParticipants([]);
    socket?.emit('meeting:admit-all', { meetingId });
  };

  const handleDeny = (userId: string) => {
    setPendingParticipants((prev) => prev.filter((p) => p.userId !== userId));
    socket?.emit('meeting:deny-user', { meetingId, userId });
  };

  const handleInsertNotesFromAI = (text: string) => {
    toggleDrawer('notes');
    try {
      const existing = localStorage.getItem(`connectsphere_notes_${meetingId}`) || '';
      const updated = existing + '\n\n' + text;
      localStorage.setItem(`connectsphere_notes_${meetingId}`, updated);
    } catch (e) {}
  };

  return (
    <div className="relative h-screen w-screen bg-[#121316] text-zinc-200 overflow-hidden flex flex-col justify-between select-none">
      {/* Waiting Room Barrier */}
      <WaitingRoomModal
        isWaiting={isInWaitingRoom}
        meetingTitle={`Room ${meetingId}`}
        pendingParticipants={pendingParticipants}
        isHost={isHost}
        onAdmit={handleAdmit}
        onAdmitAll={handleAdmitAll}
        onDeny={handleDeny}
      />

      {/* Top Header */}
      <MeetingHeader
        meetingId={meetingId}
        meetingTitle="ConnectSphere Meeting"
        participantCount={1 + remotePeers.length}
        isConnected={isConnected}
        layoutMode={layoutMode}
        onSelectLayout={(mode) => setLayoutMode(mode)}
        onRename={handleRename}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Main Content Area: Video Grid + Mutually Exclusive Docked Sidebars */}
      <div className="flex-1 relative overflow-hidden flex flex-row min-h-0">
        <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#121316] min-w-0">
          <VideoGrid
            localStream={localStream}
            screenStream={screenStream}
            remotePeers={remotePeers}
            currentUserName={currentUserName}
            currentUserId={currentUserId}
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            activeSpeakerSocketId={activeSpeakerSocketId}
            activeReactions={activeReactions}
            layoutMode={layoutMode}
            raisedHands={raisedHands}
            onRename={handleRename}
            onStopScreenShare={toggleScreenShare}
          />

          {/* Subtitles Overlay */}
          <CaptionsOverlay
            caption={activeCaption}
            enabled={captionsEnabled}
            selectedLanguage={selectedLanguage}
          />
        </main>

        {/* DOCKED SIDEBARS (Only ONE open at any time - Zero Overlap!) */}
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
              isHost={isHost}
              remotePeers={remotePeers}
              raisedHands={raisedHands}
              onMuteAll={handleMuteAll}
              onMuteParticipant={handleMuteParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              onPromoteCoHost={handlePromoteCoHost}
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

        {activeDrawer === 'polls' && (
          <div className="w-full sm:w-80 h-full flex-shrink-0 z-30">
            <PollsDrawer
              isOpen={true}
              onClose={() => setActiveDrawer('none')}
              meetingId={meetingId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              socket={socket}
            />
          </div>
        )}

        {activeDrawer === 'qna' && (
          <div className="w-full sm:w-80 h-full flex-shrink-0 z-30">
            <QnADrawer
              isOpen={true}
              onClose={() => setActiveDrawer('none')}
              meetingId={meetingId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              socket={socket}
            />
          </div>
        )}

        {activeDrawer === 'notes' && (
          <div className="w-full sm:w-80 h-full flex-shrink-0 z-30">
            <NotesDrawer
              isOpen={true}
              onClose={() => setActiveDrawer('none')}
              meetingId={meetingId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              socket={socket}
            />
          </div>
        )}

        {activeDrawer === 'ai' && (
          <div className="w-full sm:w-88 md:w-96 h-full flex-shrink-0 z-30">
            <AIAssistantDrawer
              isOpen={true}
              onClose={() => setActiveDrawer('none')}
              meetingId={meetingId}
              transcript={transcriptHistory}
              currentUserName={currentUserName}
              onInsertIntoNotes={handleInsertNotesFromAI}
            />
          </div>
        )}
      </div>

      {/* Bottom Control Dock */}
      <ControlBar
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        chatOpen={activeDrawer === 'chat'}
        participantsOpen={activeDrawer === 'participants'}
        whiteboardOpen={whiteboardOpen}
        filesOpen={activeDrawer === 'files'}
        pollsOpen={activeDrawer === 'polls'}
        qnaOpen={activeDrawer === 'qna'}
        notesOpen={activeDrawer === 'notes'}
        slidesOpen={slidesOpen}
        aiAssistantOpen={activeDrawer === 'ai'}
        isHandRaised={raisedHands.includes(currentUserId)}
        captionsEnabled={captionsEnabled}
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
        onToggleHandRaise={toggleHandRaise}
        onToggleCaptions={toggleCaptions}
        onToggleAIAssistant={() => toggleDrawer('ai')}
        onTogglePolls={() => toggleDrawer('polls')}
        onToggleQnA={() => toggleDrawer('qna')}
        onToggleNotes={() => toggleDrawer('notes')}
        onToggleSlides={() => setSlidesOpen(!slidesOpen)}
        onOpenHostControls={() => setHostControlsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onLeaveMeeting={handleLeaveMeeting}
        onToggleCameraMode={toggleCameraMode}
        onSendReaction={handleSendReaction}
      />

      {/* Collaborative Whiteboard Modal */}
      <WhiteboardModal
        isOpen={whiteboardOpen}
        onClose={() => setWhiteboardOpen(false)}
        meetingId={meetingId}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        socket={socket}
      />

      {/* Device & Video Effects Settings Modal */}
      <DeviceSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentQuality={videoQuality}
        onQualityChange={(q) => setVideoQuality(q)}
        onDeviceChange={(kind, id) => switchDevice(kind, id)}
        onApplyEffects={(filter, bg) => applyEffects(filter, bg)}
      />

      {/* Keyboard Shortcuts Cheat Sheet */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Interactive Slides Presenter Modal */}
      <PresentationSlidesModal
        isOpen={slidesOpen}
        onClose={() => setSlidesOpen(false)}
        meetingId={meetingId}
        isHostOrPresenter={isHost}
        socket={socket}
      />

      {/* Host Moderation & Security Modal */}
      <HostControlsModal
        isOpen={hostControlsOpen}
        onClose={() => setHostControlsOpen(false)}
        settings={securitySettings}
        onUpdateSettings={(newSettings) => setSecuritySettings((prev) => ({ ...prev, ...newSettings }))}
        onEndMeetingForAll={handleLeaveMeeting}
      />
    </div>
  );
};
