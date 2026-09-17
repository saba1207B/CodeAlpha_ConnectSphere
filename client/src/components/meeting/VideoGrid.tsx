import React, { useState } from 'react';
import { ParticipantTile } from './ParticipantTile';
import { RemotePeer } from '../../hooks/useWebRTC';
import { Monitor } from 'lucide-react';

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
  activeReactions = {}
}) => {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const totalTiles = 1 + remotePeers.length + (screenStream ? 1 : 0);

  // Dynamic grid classes based on participant count
  const getGridClasses = () => {
    if (pinnedId || screenStream) {
      return 'grid-cols-1 lg:grid-cols-4';
    }
    if (totalTiles === 1) return 'grid-cols-1 max-w-4xl mx-auto';
    if (totalTiles === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto';
    if (totalTiles <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto';
    if (totalTiles <= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  };

  return (
    <div className="w-full h-full flex flex-col justify-center p-4 sm:p-6 overflow-y-auto">
      {/* If screen sharing is active, show screen share main stage */}
      {screenStream ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
          {/* Main Stage: Screen Share */}
          <div className="lg:col-span-9 h-[60vh] lg:h-[75vh] rounded-card-lg overflow-hidden bg-forest/95 border border-forest/20 relative shadow-deep flex items-center justify-center">
            <video
              autoPlay
              playsInline
              ref={(el) => {
                if (el && screenStream) el.srcObject = screenStream;
              }}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 flex items-center space-x-2 px-4 py-2 rounded-full bg-forest/90 text-cream text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-forest-light/40">
              <Monitor className="w-4 h-4 text-sage" />
              <span>Active Screen Presentation</span>
            </div>
          </div>

          {/* Sidebar Participants */}
          <div className="lg:col-span-3 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto">
            {/* Local participant */}
            <div className="w-64 lg:w-full h-44 flex-shrink-0">
              <ParticipantTile
                stream={localStream}
                name={currentUserName}
                isLocal
                isAudioMuted={isAudioMuted}
                isVideoOff={isVideoOff}
                reactionEmoji={activeReactions['local']}
              />
            </div>

            {/* Remote peers */}
            {remotePeers.map((peer) => (
              <div key={peer.socketId} className="w-64 lg:w-full h-44 flex-shrink-0">
                <ParticipantTile
                  stream={peer.stream}
                  name={peer.userName}
                  role={peer.role}
                  isStudioPeer={peer.isStudioPeer}
                  isAudioMuted={peer.isAudioMuted}
                  isVideoOff={peer.isVideoOff}
                  isSpeaking={activeSpeakerSocketId === peer.socketId}
                  reactionEmoji={activeReactions[peer.socketId]}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Responsive Grid */
        <div className={`grid gap-4 sm:gap-6 w-full ${getGridClasses()} transition-all duration-300`}>
          {/* Local User Tile */}
          <div className="w-full aspect-video min-h-[220px]">
            <ParticipantTile
              stream={localStream}
              name={currentUserName}
              isLocal
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isPinned={pinnedId === 'local'}
              reactionEmoji={activeReactions['local']}
              onPin={() => setPinnedId(pinnedId === 'local' ? null : 'local')}
            />
          </div>

          {/* Remote Peer Tiles */}
          {remotePeers.map((peer) => (
            <div key={peer.socketId} className="w-full aspect-video min-h-[220px]">
              <ParticipantTile
                stream={peer.stream}
                name={peer.userName}
                role={peer.role}
                isStudioPeer={peer.isStudioPeer}
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
      )}
    </div>
  );
};
