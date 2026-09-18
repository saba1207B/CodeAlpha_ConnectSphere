import React, { useState } from 'react';
import { ParticipantTile } from './ParticipantTile';
import { RemotePeer } from '../../hooks/useWebRTC';
import { StopCircle } from 'lucide-react';
import { MeetingLayoutMode } from './MeetingHeader';

interface VideoGridProps {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  remotePeers: RemotePeer[];
  currentUserName: string;
  currentUserId?: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  activeSpeakerSocketId: string | null;
  activeReactions?: { [id: string]: string };
  layoutMode?: MeetingLayoutMode;
  raisedHands?: string[];
  onRename?: () => void;
  onStopScreenShare?: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  screenStream,
  remotePeers,
  currentUserName,
  currentUserId = 'local',
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  activeSpeakerSocketId,
  activeReactions = {},
  layoutMode = 'gallery',
  raisedHands = [],
  onRename,
  onStopScreenShare
}) => {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // STRICT DEDUPLICATION: ensure no duplicates of local user or remote peers
  const uniqueRemotePeers = remotePeers.filter((peer, index, self) => {
    if (!peer.stream) return false;
    if (peer.stream.id === localStream?.id) return false;
    return self.findIndex((p) => p.userId === peer.userId) === index;
  });

  const totalParticipants = 1 + uniqueRemotePeers.length;

  // Grid sizing logic for Gallery view
  const getGalleryGridClasses = () => {
    if (totalParticipants === 1) return 'grid-cols-1 max-w-4xl mx-auto h-full max-h-[82vh]';
    if (totalParticipants === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto h-full max-h-[82vh]';
    if (totalParticipants <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto';
    if (totalParticipants <= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  };

  // Determine active speaker peer
  const getActiveSpeakerPeer = () => {
    if (pinnedId) {
      if (pinnedId === 'local') return null;
      return uniqueRemotePeers.find((p) => p.socketId === pinnedId) || null;
    }
    if (activeSpeakerSocketId) {
      return uniqueRemotePeers.find((p) => p.socketId === activeSpeakerSocketId) || null;
    }
    return uniqueRemotePeers[0] || null;
  };

  const activeSpeakerPeer = getActiveSpeakerPeer();
  const isLocalPinned = pinnedId === 'local' || (!pinnedId && !activeSpeakerPeer);

  // 1. SCREEN SHARE PRESENTATION VIEW
  if (screenStream) {
    return (
      <div className="w-full h-full flex flex-col p-2 sm:p-4 bg-[#121316] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 mb-2 rounded-lg bg-[#1e2026] border border-[#2e323e] text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>You are sharing your screen presentation</span>
          </div>
          {onStopScreenShare && (
            <button
              onClick={onStopScreenShare}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop Share</span>
            </button>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
          <div className="lg:col-span-9 h-full rounded-lg overflow-hidden bg-black border border-[#2e323e] relative flex items-center justify-center">
            <video
              autoPlay
              playsInline
              ref={(el) => {
                if (el && screenStream) el.srcObject = screenStream;
              }}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pr-1">
            <div className="w-56 lg:w-full aspect-video flex-shrink-0">
              <ParticipantTile
                stream={localStream}
                name={currentUserName}
                isLocal
                isAudioMuted={isAudioMuted}
                isVideoOff={isVideoOff}
                isHandRaised={raisedHands.includes(currentUserId)}
                reactionEmoji={activeReactions['local']}
                onRename={onRename}
              />
            </div>

            {uniqueRemotePeers.map((peer) => (
              <div key={peer.socketId} className="w-56 lg:w-full aspect-video flex-shrink-0">
                <ParticipantTile
                  stream={peer.stream}
                  name={peer.userName}
                  role={peer.role}
                  isAudioMuted={peer.isAudioMuted}
                  isVideoOff={peer.isVideoOff}
                  isSpeaking={activeSpeakerSocketId === peer.socketId}
                  isHandRaised={raisedHands.includes(peer.userId)}
                  reactionEmoji={activeReactions[peer.socketId]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. SPOTLIGHT VIEW (Takes full screen with single focused speaker)
  if (layoutMode === 'spotlight') {
    return (
      <div className="w-full h-full p-3 sm:p-6 bg-[#121316] flex items-center justify-center">
        <div className="w-full h-full max-w-6xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-[#2a2d36]">
          {isLocalPinned ? (
            <ParticipantTile
              stream={localStream}
              name={currentUserName}
              isLocal
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isPinned={true}
              isHandRaised={raisedHands.includes(currentUserId)}
              reactionEmoji={activeReactions['local']}
              onPin={() => setPinnedId(null)}
              onRename={onRename}
            />
          ) : activeSpeakerPeer ? (
            <ParticipantTile
              stream={activeSpeakerPeer.stream}
              name={activeSpeakerPeer.userName}
              role={activeSpeakerPeer.role}
              isAudioMuted={activeSpeakerPeer.isAudioMuted}
              isVideoOff={activeSpeakerPeer.isVideoOff}
              isSpeaking={true}
              isPinned={true}
              isHandRaised={raisedHands.includes(activeSpeakerPeer.userId)}
              reactionEmoji={activeReactions[activeSpeakerPeer.socketId]}
              onPin={() => setPinnedId(null)}
            />
          ) : null}
        </div>
      </div>
    );
  }

  // 3. SIDEBAR VIEW (Main focus left, vertical thumbnail list right)
  if (layoutMode === 'sidebar') {
    return (
      <div className="w-full h-full flex flex-col lg:flex-row p-3 gap-3 bg-[#121316] overflow-hidden">
        <div className="flex-1 h-full rounded-xl overflow-hidden border border-[#2a2d36] min-h-0">
          {isLocalPinned ? (
            <ParticipantTile
              stream={localStream}
              name={currentUserName}
              isLocal
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isPinned={pinnedId === 'local'}
              isHandRaised={raisedHands.includes(currentUserId)}
              reactionEmoji={activeReactions['local']}
              onRename={onRename}
            />
          ) : activeSpeakerPeer ? (
            <ParticipantTile
              stream={activeSpeakerPeer.stream}
              name={activeSpeakerPeer.userName}
              role={activeSpeakerPeer.role}
              isAudioMuted={activeSpeakerPeer.isAudioMuted}
              isVideoOff={activeSpeakerPeer.isVideoOff}
              isSpeaking={true}
              isPinned={pinnedId === activeSpeakerPeer.socketId}
              isHandRaised={raisedHands.includes(activeSpeakerPeer.userId)}
              reactionEmoji={activeReactions[activeSpeakerPeer.socketId]}
              onPin={() => setPinnedId(pinnedId === activeSpeakerPeer.socketId ? null : activeSpeakerPeer.socketId)}
            />
          ) : null}
        </div>

        <div className="w-full lg:w-64 h-36 lg:h-full flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto flex-shrink-0">
          <div className="w-48 lg:w-full aspect-video flex-shrink-0">
            <ParticipantTile
              stream={localStream}
              name={currentUserName}
              isLocal
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isPinned={pinnedId === 'local'}
              isHandRaised={raisedHands.includes(currentUserId)}
              reactionEmoji={activeReactions['local']}
              onPin={() => setPinnedId(pinnedId === 'local' ? null : 'local')}
              onRename={onRename}
            />
          </div>

          {uniqueRemotePeers.map((peer) => (
            <div key={peer.socketId} className="w-48 lg:w-full aspect-video flex-shrink-0">
              <ParticipantTile
                stream={peer.stream}
                name={peer.userName}
                role={peer.role}
                isAudioMuted={peer.isAudioMuted}
                isVideoOff={peer.isVideoOff}
                isSpeaking={activeSpeakerSocketId === peer.socketId}
                isPinned={pinnedId === peer.socketId}
                isHandRaised={raisedHands.includes(peer.userId)}
                reactionEmoji={activeReactions[peer.socketId]}
                onPin={() => setPinnedId(pinnedId === peer.socketId ? null : peer.socketId)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. SPEAKER VIEW (Top Filmstrip + Large Active Speaker)
  if (layoutMode === 'speaker' && uniqueRemotePeers.length > 0) {
    return (
      <div className="w-full h-full flex flex-col p-2 sm:p-4 bg-[#121316] overflow-hidden">
        <div className="h-28 sm:h-32 mb-3 flex items-center space-x-3 overflow-x-auto pb-1 flex-shrink-0">
          <div className="w-48 sm:w-56 h-full flex-shrink-0">
            <ParticipantTile
              stream={localStream}
              name={currentUserName}
              isLocal
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isPinned={pinnedId === 'local'}
              isHandRaised={raisedHands.includes(currentUserId)}
              reactionEmoji={activeReactions['local']}
              onPin={() => setPinnedId(pinnedId === 'local' ? null : 'local')}
              onRename={onRename}
            />
          </div>

          {uniqueRemotePeers.map((peer) => (
            <div key={peer.socketId} className="w-48 sm:w-56 h-full flex-shrink-0">
              <ParticipantTile
                stream={peer.stream}
                name={peer.userName}
                role={peer.role}
                isAudioMuted={peer.isAudioMuted}
                isVideoOff={peer.isVideoOff}
                isSpeaking={activeSpeakerSocketId === peer.socketId}
                isPinned={pinnedId === peer.socketId}
                isHandRaised={raisedHands.includes(peer.userId)}
                reactionEmoji={activeReactions[peer.socketId]}
                onPin={() => setPinnedId(pinnedId === peer.socketId ? null : peer.socketId)}
              />
            </div>
          ))}
        </div>

        <div className="flex-1 w-full max-w-6xl mx-auto rounded-lg overflow-hidden border border-[#2a2d36] min-h-0">
          {isLocalPinned ? (
            <ParticipantTile
              stream={localStream}
              name={currentUserName}
              isLocal
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isPinned={pinnedId === 'local'}
              isHandRaised={raisedHands.includes(currentUserId)}
              reactionEmoji={activeReactions['local']}
              onRename={onRename}
            />
          ) : activeSpeakerPeer ? (
            <ParticipantTile
              stream={activeSpeakerPeer.stream}
              name={activeSpeakerPeer.userName}
              role={activeSpeakerPeer.role}
              isAudioMuted={activeSpeakerPeer.isAudioMuted}
              isVideoOff={activeSpeakerPeer.isVideoOff}
              isSpeaking={true}
              isPinned={pinnedId === activeSpeakerPeer.socketId}
              isHandRaised={raisedHands.includes(activeSpeakerPeer.userId)}
              reactionEmoji={activeReactions[activeSpeakerPeer.socketId]}
              onPin={() => setPinnedId(pinnedId === activeSpeakerPeer.socketId ? null : activeSpeakerPeer.socketId)}
            />
          ) : null}
        </div>
      </div>
    );
  }

  // 5. GALLERY VIEW (Classic Tiled Responsive Grid)
  return (
    <div className="w-full h-full flex flex-col justify-center p-3 sm:p-6 bg-[#121316] overflow-y-auto">
      <div className={`grid gap-3 sm:gap-4 w-full ${getGalleryGridClasses()} items-center transition-all duration-300`}>
        <div className="w-full aspect-video">
          <ParticipantTile
            stream={localStream}
            name={currentUserName}
            isLocal
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            isPinned={pinnedId === 'local'}
            isHandRaised={raisedHands.includes(currentUserId)}
            reactionEmoji={activeReactions['local']}
            onPin={() => setPinnedId(pinnedId === 'local' ? null : 'local')}
            onRename={onRename}
          />
        </div>

        {uniqueRemotePeers.map((peer) => (
          <div key={peer.socketId} className="w-full aspect-video">
            <ParticipantTile
              stream={peer.stream}
              name={peer.userName}
              role={peer.role}
              isAudioMuted={peer.isAudioMuted}
              isVideoOff={peer.isVideoOff}
              isSpeaking={activeSpeakerSocketId === peer.socketId}
              isPinned={pinnedId === peer.socketId}
              isHandRaised={raisedHands.includes(peer.userId)}
              reactionEmoji={activeReactions[peer.socketId]}
              onPin={() => setPinnedId(pinnedId === peer.socketId ? null : peer.socketId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
