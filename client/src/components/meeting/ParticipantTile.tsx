import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, VideoOff, Pin, User as UserIcon, Shield } from 'lucide-react';

interface ParticipantTileProps {
  stream: MediaStream | null;
  name: string;
  role?: string;
  isLocal?: boolean;
  isAudioMuted?: boolean;
  isVideoOff?: boolean;
  isSpeaking?: boolean;
  isPinned?: boolean;
  isStudioPeer?: boolean;
  isHandRaised?: boolean;
  reactionEmoji?: string | null;
  onPin?: () => void;
  onRename?: () => void;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({
  stream,
  name,
  role,
  isLocal = false,
  isAudioMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  isPinned = false,
  isHandRaised = false,
  reactionEmoji = null,
  onPin,
  onRename
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Clean name without 'Guest Contributor'
  const displayName = name === 'Guest Contributor' ? (isLocal ? 'You' : 'Participant') : name;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || (isLocal ? 'ME' : 'U');

  return (
    <div
      className={`relative w-full h-full min-h-[180px] rounded-lg overflow-hidden bg-[#181a20] border transition-all duration-200 group flex items-center justify-center select-none ${
        isSpeaking
          ? 'border-2 border-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.35)]'
          : 'border-[#2a2d36] hover:border-[#3b404d]'
      }`}
    >
      {/* Live Video Track */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isVideoOff ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${isLocal ? 'scale-x-[-1]' : ''}`}
      />

      {/* Camera Off Avatar Fallback */}
      {isVideoOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#181a20]">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#272a34] border border-[#373b49] text-zinc-200 flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-inner">
            {initials || <UserIcon className="w-10 h-10 text-zinc-400" />}
          </div>
          <span className="mt-3 text-xs sm:text-sm font-medium text-zinc-300">
            {displayName} {isLocal && '(Me)'}
          </span>
        </div>
      )}

      {/* Hand Raised Floating Badge */}
      {isHandRaised && (
        <div className="absolute top-3 left-3 z-30 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-xs font-bold shadow-lg animate-bounce">
          <span>✋</span>
          <span className="text-[10px] uppercase tracking-wider">Hand Raised</span>
        </div>
      )}

      {/* Floating Reaction Animation */}
      {reactionEmoji && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 text-5xl sm:text-6xl animate-bounce drop-shadow-2xl pointer-events-none">
          {reactionEmoji}
        </div>
      )}

      {/* Top Hover Controls */}
      <div className="absolute top-2 right-2 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {onRename && isLocal && (
          <button
            onClick={onRename}
            className="p-1.5 rounded bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white text-[10px] font-medium backdrop-blur-sm"
            title="Rename display name"
          >
            Rename
          </button>
        )}

        {onPin && (
          <button
            onClick={onPin}
            className={`p-1.5 rounded backdrop-blur-sm transition-colors ${
              isPinned
                ? 'bg-blue-600 text-white'
                : 'bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white'
            }`}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bottom-Left Zoom-Style Translucent Name & Audio Badge */}
      <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-medium max-w-[85%] truncate shadow-md">
        {isAudioMuted ? (
          <MicOff className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
        ) : (
          <Mic className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        )}
        <span className="truncate">
          {displayName} {isLocal && <span className="text-zinc-400 font-normal">(Me)</span>}
        </span>
        {role && (
          <span className="text-[9px] px-1 rounded bg-white/10 text-zinc-300 font-semibold ml-1">
            {role}
          </span>
        )}
      </div>
    </div>
  );
};
