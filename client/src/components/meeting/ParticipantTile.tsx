import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, VideoOff, Pin, Sparkles, User as UserIcon, ShieldCheck } from 'lucide-react';

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
  reactionEmoji?: string | null;
  onPin?: () => void;
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
  isStudioPeer = false,
  reactionEmoji = null,
  onPin
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative w-full h-full min-h-[220px] rounded-card-lg overflow-hidden bg-[#002619] border transition-all duration-300 group flex items-center justify-center ${
        isSpeaking
          ? 'ring-4 ring-forest-light shadow-floating border-sage'
          : 'border-forest/25 shadow-md hover:border-forest/50'
      }`}
    >
      {/* Video Element (Canvas stream or Webcam track) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Mute local video to prevent audio feedback loop
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isVideoOff ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${isLocal && !isStudioPeer ? 'scale-x-[-1]' : ''}`}
      />

      {/* Fallback Display if video is explicitly muted off */}
      {isVideoOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-forest to-[#002619]">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cream text-forest flex items-center justify-center font-display text-3xl sm:text-4xl shadow-deep">
            {initials || <UserIcon className="w-10 h-10" />}
          </div>
          <span className="mt-4 font-bold uppercase tracking-wider text-sm text-cream/90">
            {name} {isLocal && '(You)'}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-sage/70 mt-1">
            Camera Disabled
          </span>
        </div>
      )}

      {/* Floating Reaction Animation Badge */}
      {reactionEmoji && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 text-5xl animate-bounce drop-shadow-2xl pointer-events-none">
          {reactionEmoji}
        </div>
      )}

      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center space-x-1.5">
          {isSpeaking && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest/90 text-cream text-[10px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-md border border-forest-light/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Speaking</span>
            </div>
          )}

          {isStudioPeer && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-forest/80 text-sage text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-sage/20">
              <ShieldCheck className="w-3 h-3 text-sage" />
              <span>Verified Studio</span>
            </div>
          )}
        </div>

        {onPin && (
          <button
            onClick={onPin}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-opacity ${
              isPinned ? 'bg-cream text-forest opacity-100' : 'bg-forest/80 text-cream opacity-0 group-hover:opacity-100 hover:bg-forest'
            }`}
            title={isPinned ? 'Unpin participant' : 'Pin participant'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bottom Identity & Audio Status Banner */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-cream px-4 py-2 rounded-full bg-forest/85 backdrop-blur-md border border-forest-light/30 z-10">
        <div className="flex items-center space-x-2 truncate max-w-[70%]">
          <span className="tracking-wider uppercase truncate">
            {name} {isLocal && <span className="text-sage font-normal">(You)</span>}
          </span>
          {role && (
            <span className="hidden sm:inline text-[9px] px-2 py-0.5 rounded-full bg-cream/10 text-sage/80 font-normal">
              {role}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isAudioMuted ? (
            <div className="p-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/40" title="Muted">
              <MicOff className="w-3 h-3" />
            </div>
          ) : (
            <div className="p-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40" title="Audio Live">
              <Mic className="w-3 h-3" />
            </div>
          )}
          {isVideoOff && (
            <div className="p-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/40" title="Video Off">
              <VideoOff className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
