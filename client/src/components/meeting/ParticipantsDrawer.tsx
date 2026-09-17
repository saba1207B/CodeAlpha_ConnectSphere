import React, { useState } from 'react';
import { X, Users, Copy, Check, Mic, MicOff, Video, VideoOff, Shield } from 'lucide-react';
import { RemotePeer } from '../../hooks/useWebRTC';

interface ParticipantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  remotePeers: RemotePeer[];
}

export const ParticipantsDrawer: React.FC<ParticipantsDrawerProps> = ({
  isOpen,
  onClose,
  meetingId,
  currentUserId,
  currentUserName,
  isAudioMuted,
  isVideoOff,
  remotePeers
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed sm:absolute top-16 bottom-20 right-0 w-full sm:w-96 z-40 bg-cream/95 backdrop-blur-2xl border-l border-forest/15 shadow-deep flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-forest/15 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-forest">
          <Users className="w-5 h-5" />
          <h3 className="font-display text-xl tracking-tight">
            PARTICIPANTS ({1 + remotePeers.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-forest/10 text-forest/70 hover:text-forest transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Invite Link Banner */}
      <div className="p-4 border-b border-forest/15 bg-cream">
        <button
          onClick={handleCopyLink}
          className="w-full py-3 px-4 rounded-full bg-olive/50 border border-forest/20 text-forest text-xs font-bold uppercase tracking-wider flex items-center justify-between hover:bg-olive transition-colors"
        >
          <span className="truncate mr-2">Copy Meeting Invitation</span>
          {copied ? (
            <span className="flex items-center text-emerald-800 text-[10px] space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>COPIED</span>
            </span>
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3">
        {/* Local user entry */}
        <div className="p-3.5 rounded-organic-sm bg-forest text-cream flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-cream text-forest flex items-center justify-center font-display text-sm font-bold">
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                {currentUserName} (You)
              </div>
              <div className="text-[10px] text-sage flex items-center space-x-1">
                <Shield className="w-2.5 h-2.5" />
                <span>Host</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-cream">
            {isAudioMuted ? <MicOff className="w-4 h-4 text-rose-300" /> : <Mic className="w-4 h-4 text-emerald-300" />}
            {isVideoOff ? <VideoOff className="w-4 h-4 text-amber-200" /> : <Video className="w-4 h-4 text-sage" />}
          </div>
        </div>

        {/* Remote peers */}
        {remotePeers.map((peer) => (
          <div
            key={peer.socketId}
            className="p-3.5 rounded-organic-sm bg-olive/40 border border-forest/15 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-forest text-cream flex items-center justify-center font-display text-sm font-bold">
                {peer.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-forest">
                  {peer.userName}
                </div>
                <div className="text-[10px] text-forest/60">
                  Peer · Verified
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-forest">
              {peer.isAudioMuted ? <MicOff className="w-4 h-4 text-rose-700" /> : <Mic className="w-4 h-4" />}
              {peer.isVideoOff ? <VideoOff className="w-4 h-4 text-amber-700" /> : <Video className="w-4 h-4" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
