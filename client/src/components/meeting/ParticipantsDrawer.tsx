import React, { useState } from 'react';
import { 
  X, Users, Copy, Check, Mic, MicOff, Video, VideoOff, 
  Shield, UserMinus, Hand, Download, VolumeX, Crown, MoreVertical 
} from 'lucide-react';
import { RemotePeer } from '../../hooks/useWebRTC';

interface ParticipantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isHost: boolean;
  remotePeers: RemotePeer[];
  raisedHands?: string[]; // userIds with raised hands
  onMuteParticipant?: (socketId: string) => void;
  onMuteAll?: () => void;
  onRemoveParticipant?: (socketId: string) => void;
  onPromoteCoHost?: (socketId: string) => void;
  onLowerHand?: (userId: string) => void;
}

export const ParticipantsDrawer: React.FC<ParticipantsDrawerProps> = ({
  isOpen,
  onClose,
  meetingId,
  currentUserId,
  currentUserName,
  isAudioMuted,
  isVideoOff,
  isHost,
  remotePeers,
  raisedHands = [],
  onMuteParticipant,
  onMuteAll,
  onRemoveParticipant,
  onPromoteCoHost,
  onLowerHand
}) => {
  const [copied, setCopied] = useState(false);
  const [activeMenuPeerId, setActiveMenuPeerId] = useState<string | null>(null);

  // Strictly deduplicate peers in list
  const uniqueRemotePeers = remotePeers.filter((peer, index, self) =>
    self.findIndex((p) => p.userId === peer.userId) === index
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportAttendance = () => {
    const headers = 'Name,Role,Status,Audio,Video,Hand Raised\n';
    const meRow = `"${currentUserName}","${isHost ? 'Host' : 'Attendee'}","Active","${isAudioMuted ? 'Muted' : 'Unmuted'}","${isVideoOff ? 'Off' : 'On'}","${raisedHands.includes(currentUserId) ? 'Yes' : 'No'}"\n`;
    const peerRows = uniqueRemotePeers.map((p) =>
      `"${p.userName}","${p.role || 'Attendee'}","Active","${p.isAudioMuted ? 'Muted' : 'Unmuted'}","${p.isVideoOff ? 'Off' : 'On'}","${raisedHands.includes(p.userId) ? 'Yes' : 'No'}"`
    ).join('\n');

    const csvContent = headers + meRow + peerRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AttendanceReport-${meetingId}-${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div className="flex items-center space-x-1">
          <button
            onClick={handleExportAttendance}
            className="p-1.5 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
            title="Export Attendance Report (CSV)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Host Controls Bar: Mute All */}
      {isHost && (
        <div className="px-3 py-2 border-b border-[#2e323e] bg-[#1a1c22] flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Host Controls
          </span>
          <button
            onClick={onMuteAll}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#2a2e3a] hover:bg-rose-950/40 text-zinc-200 hover:text-rose-400 text-xs font-medium transition-colors"
            title="Mute all participants"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute All</span>
          </button>
        </div>
      )}

      {/* Participants List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {/* Local user entry */}
        <div className="p-2.5 rounded-lg bg-[#272a34] border border-[#373b49] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {currentUserName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <span>{currentUserName} (Me)</span>
                {raisedHands.includes(currentUserId) && (
                  <span className="text-amber-400" title="Hand Raised">✋</span>
                )}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center space-x-1">
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                <span>{isHost ? 'Host' : 'Attendee'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-zinc-300">
            {isAudioMuted ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            {isVideoOff ? <VideoOff className="w-4 h-4 text-rose-500" /> : <Video className="w-4 h-4 text-zinc-300" />}
          </div>
        </div>

        {/* Remote peers */}
        {uniqueRemotePeers.map((peer) => {
          const isHandRaised = raisedHands.includes(peer.userId);
          const isMenuOpen = activeMenuPeerId === peer.socketId;

          return (
            <div
              key={peer.socketId}
              className="relative p-2.5 rounded-lg bg-[#232630] border border-[#303442] flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5 truncate mr-2">
                <div
                  className="w-8 h-8 rounded-full text-zinc-100 flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: peer.avatarColor || '#373b49' }}
                >
                  {peer.userName.charAt(0).toUpperCase() || 'P'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-white flex items-center space-x-1.5 truncate">
                    <span className="truncate">{peer.userName}</span>
                    {isHandRaised && (
                      <span className="text-amber-400 flex-shrink-0" title="Hand Raised">✋</span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {peer.role || 'Participant'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-zinc-300 flex-shrink-0">
                {peer.isAudioMuted ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                {peer.isVideoOff ? <VideoOff className="w-4 h-4 text-rose-500" /> : <Video className="w-4 h-4 text-zinc-300" />}

                {/* Host Moderation Menu Toggle */}
                {isHost && (
                  <div className="relative ml-1">
                    <button
                      onClick={() => setActiveMenuPeerId(isMenuOpen ? null : peer.socketId)}
                      className="p-1 rounded hover:bg-[#323644] text-zinc-400 hover:text-white"
                      title="Participant Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-7 w-44 p-1.5 rounded-xl bg-[#1c1e24] border border-[#373b49] text-xs shadow-2xl z-50 space-y-1">
                        {onMuteParticipant && (
                          <button
                            onClick={() => {
                              onMuteParticipant(peer.socketId);
                              setActiveMenuPeerId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 flex items-center space-x-2 text-zinc-200"
                          >
                            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                            <span>Mute</span>
                          </button>
                        )}

                        {onPromoteCoHost && (
                          <button
                            onClick={() => {
                              onPromoteCoHost(peer.socketId);
                              setActiveMenuPeerId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 flex items-center space-x-2 text-zinc-200"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>Make Co-Host</span>
                          </button>
                        )}

                        {isHandRaised && onLowerHand && (
                          <button
                            onClick={() => {
                              onLowerHand(peer.userId);
                              setActiveMenuPeerId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 flex items-center space-x-2 text-zinc-200"
                          >
                            <Hand className="w-3.5 h-3.5 text-amber-400" />
                            <span>Lower Hand</span>
                          </button>
                        )}

                        {onRemoveParticipant && (
                          <button
                            onClick={() => {
                              onRemoveParticipant(peer.socketId);
                              setActiveMenuPeerId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-950/40 flex items-center space-x-2 text-rose-400"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Remove from call</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
