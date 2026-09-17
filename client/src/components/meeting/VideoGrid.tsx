import React, { useState } from 'react';
import { ParticipantTile } from './ParticipantTile';
import { RemotePeer } from '../../hooks/useWebRTC';
import { Monitor, StopCircle } from 'lucide-react';

interface VideoGridProps {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  remotePeers: RemotePeer[];
  currentUserName: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  activeSpeakerSocketId: string | null;
  activeReactions?: { [id: string]: string };
  viewMode?: 'gallery' | 'speaker';
  onRename?: () => void;
  onStopScreenShare?: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  screenStream,
  remotePeers,
  currentUserName,
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  activeSpeakerSocketId,
  activeReactions = {},
  viewMode = 'gallery',
  onRename,
  onStopScreenShare
}) => {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // STRICT DEDUPLICATION: ensure no duplicates of local user or remote peers
  const uniqueRemotePeers = remotePeers.filter((peer, index, self) => {
    if (!peer.stream) return false;
    if (peer.stream.id === localStream?.id) return false;
    // Keep first occurrence of each unique userId
    return self.findIndex((p) => p.userId === peer.userId) === index;
  });

  const totalParticipants = 1 + uniqueRemotePeers.length;

  // Grid sizing logic for Zoom Gallery view
  const getGalleryGridClasses = () => {
    if (totalParticipants === 1) return 'grid-cols-1 max-w-4xl mx-auto h-full max-h-[82vh]';
    if (totalParticipants === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto h-full max-h-[82vh]';
    if (totalParticipants <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto';
    if (totalParticipants <= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  };

  // Determine active speaker tile for Speaker View
  const getActiveSpeakerPeer = () => {
    if (pinnedId) {
      if (pinnedId === 'local') return null; // local pinned
      return uniqueRemotePeers.find((p) => p.socketId === pinnedId) || null;
    }
    if (activeSpeakerSocketId) {
      return uniqueRemotePeers.find((p) => p.socketId === activeSpeakerSocketId) || null;
    }
    return uniqueRemotePeers[0] || null;
  };

  const activeSpeakerPeer = getActiveSpeakerPeer();

  // 1. SCREEN SHARE PRESENTATION VIEW (Zoom Style)
  if (screenStream) {
    return (
      <div className="w-full h-full flex flex-col p-2 sm:p-4 bg-[#121316] overflow-hidden">
        {/* Top Floating Zoom Banner */}
        <div className="flex items-center justify-between px-4 py-2 mb-2 rounded-lg bg-[#1e2026] border border-[#2e323e] text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>You are sharing screen presentation</span>
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

        {/* Presentation Main Stage + Participant Strip */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
          {/* Main Stage Presentation */}
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

          {/* Right Participant Thumbnail Strip */}
          <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pr-1">
            <div className="w-56 lg:w-full aspect-video flex-shrink-0">
              <ParticipantTile
                stream={localStream}
                name={currentUserName}
                isLocal
                isAudioMuted={isAudioMuted}
                isVideoOff={isVideoOff}
                reactionEmoji={activeReactions['local']}
                onRename={onRename}
              />
            </div>

            {uniqueRemotePeers.map((peer) => (
              <div key={peer.socketId} className="w-56 lg:w-full aspect-video flex-shrink-0">
                <ParticipantTile
                  stream={peer.stream}
                  name={peer.userName}
                  isAudioMuted={peer.isAudioMuted}
                  isVideoOff={peer.isVideoOff}
                  isSpeaking={activeSpeakerSocketId === peer.socketId}
                  reactionEmoji={activeReactions[peer.socketId]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. SPEAKER VIEW (Zoom Style: Large Active Speaker + Top Filmstrip)
  if (viewMode === 'speaker' && uniqueRemotePeers.length > 0) {
    const isLocalPinned = pinnedId === 'local' || (!pinnedId && !activeSpeakerPeer);

    return (
      <div className="w-full h-full flex flex-col p-2 sm:p-4 bg-[#121316] overflow-hidden">
        {/* Top Filmstrip of Participants */}
        <div className="h-28 sm:h-32 mb-3 flex items-center space-x-3 overflow-x-auto pb-1 flex-shrink-0">
          <div className="w-48 sm:w-56 h-full flex-shrink-0">
            <ParticipantTile
              stream={localStream}
              name={currentUserName}
              isLocal
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isPinned={pinnedId === 'local'}
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
                isAudioMuted={peer.isAudioMuted}
                isVideoOff={peer.isVideoOff}
                isSpeaking={activeSpeakerSocketId === peer.socketId}
                isPinned={pinnedId === peer.socketId}
                reactionEmoji={activeReactions[peer.socketId]}
                onPin={() => setPinnedId(pinnedId === peer.socketId ? null : peer.socketId)}
              />
            </div>
          ))}
        </div>

        {/* Large Main Stage */}
        <div className="flex-1 w-full max-w-6xl mx-auto rounded-lg overflow-hidden border border-[#2a2d36] min-h-0">
          {isLocalPinned ? (
            <ParticipantTile
              stream={localStream}
              name={currentUserName}
              isLocal
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isPinned={pinnedId === 'local'}
              reactionEmoji={activeReactions['local']}
              onRename={onRename}
            />
          ) : activeSpeakerPeer ? (
            <ParticipantTile
              stream={activeSpeakerPeer.stream}
              name={activeSpeakerPeer.userName}
              isAudioMuted={activeSpeakerPeer.isAudioMuted}
              isVideoOff={activeSpeakerPeer.isVideoOff}
              isSpeaking={true}
              isPinned={pinnedId === activeSpeakerPeer.socketId}
              reactionEmoji={activeReactions[activeSpeakerPeer.socketId]}
              onPin={() => setPinnedId(pinnedId === activeSpeakerPeer.socketId ? null : activeSpeakerPeer.socketId)}
            />
          ) : null}
        </div>
      </div>
    );
  }

  // 3. GALLERY VIEW (Classic Zoom Responsive Grid)
  return (
    <div className="w-full h-full flex flex-col justify-center p-3 sm:p-6 bg-[#121316] overflow-y-auto">
      <div className={`grid gap-3 sm:gap-4 w-full ${getGalleryGridClasses()} items-center transition-all duration-300`}>
        {/* Local User Tile */}
        <div className="w-full aspect-video">
          <ParticipantTile
            stream={localStream}
            name={currentUserName}
            isLocal
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            isPinned={pinnedId === 'local'}
            reactionEmoji={activeReactions['local']}
            onPin={() => setPinnedId(pinnedId === 'local' ? null : 'local')}
            onRename={onRename}
          />
        </div>

        {/* Clean, Deduplicated Remote Peer Tiles */}
        {uniqueRemotePeers.map((peer) => (
          <div key={peer.socketId} className="w-full aspect-video">
            <ParticipantTile
              stream={peer.stream}
              name={peer.userName}
              isAudioMuted={peer.isAudioMuted}
              isVideoOff={peer.isVideoOff}
              isSpeaking={activeSpeakerSocketId === peer.socketId}
              isPinned={pinnedId === peer.socketId}
              reactionEmoji={activeReactions[peer.socketId]}
              onPin={() => setPinnedId(pinnedId === peer.socketId ? null : peer.socketId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
