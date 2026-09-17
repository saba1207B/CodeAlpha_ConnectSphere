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

  // Strictly deduplicate peers in list
  const uniqueRemotePeers = remotePeers.filter((peer, index, self) =>
    self.findIndex((p) => p.userId === peer.userId) === index
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full h-full bg-[#1e2026] border-l border-[#2e323e] flex flex-col select-none text-zinc-200 shadow-xl">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#2e323e] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-zinc-300" />
          <h3 className="font-semibold text-sm text-white">
            Participants ({1 + uniqueRemotePeers.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {/* Local user entry */}
        <div className="p-2.5 rounded-lg bg-[#272a34] border border-[#373b49] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {currentUserName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                {currentUserName} (Me)
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center space-x-1">
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                <span>Host</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-zinc-300">
            {isAudioMuted ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            {isVideoOff ? <VideoOff className="w-4 h-4 text-rose-500" /> : <Video className="w-4 h-4 text-zinc-300" />}
          </div>
        </div>

        {/* Remote peers */}
        {uniqueRemotePeers.map((peer) => (
          <div
            key={peer.socketId}
            className="p-2.5 rounded-lg bg-[#232630] border border-[#303442] flex items-center justify-between"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#373b49] text-zinc-200 flex items-center justify-center font-bold text-xs">
                {peer.userName.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <div className="text-xs font-medium text-white">
                  {peer.userName}
                </div>
                <div className="text-[10px] text-zinc-400">
                  Participant
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-zinc-300">
              {peer.isAudioMuted ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              {peer.isVideoOff ? <VideoOff className="w-4 h-4 text-rose-500" /> : <Video className="w-4 h-4 text-zinc-300" />}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Button at bottom */}
      <div className="p-3 border-t border-[#2e323e]">
        <button
          onClick={handleCopyLink}
          className="w-full py-2 px-3 rounded-lg bg-[#272a34] hover:bg-[#323644] border border-[#373b49] text-white text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Invite Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Invite Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
