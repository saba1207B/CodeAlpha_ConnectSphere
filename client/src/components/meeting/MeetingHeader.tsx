import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, Users, Link as LinkIcon } from 'lucide-react';

interface MeetingHeaderProps {
  meetingId: string;
  meetingTitle?: string;
  participantCount: number;
  isConnected: boolean;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meetingId,
  meetingTitle = "Editorial Studio Session",
  participantCount,
  isConnected
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-forest/15 bg-cream/80 backdrop-blur-xl flex items-center justify-between text-forest z-30 select-none">
      {/* Left: Brand & Meeting Title */}
      <div className="flex items-center space-x-4">
        <a href="#/" className="font-display text-xl sm:text-2xl tracking-tight hover:opacity-80 transition-opacity">
          —CONNECTSPHERE
        </a>
        <span className="hidden md:inline h-4 w-px bg-forest/20"></span>
        <span className="hidden md:inline text-xs font-bold uppercase tracking-widest text-forest/80 truncate max-w-xs">
          {meetingTitle}
        </span>
      </div>

      {/* Center: Meeting ID & Quick Copy */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleCopyLink}
          className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-full bg-olive/60 border border-forest/15 text-xs font-bold uppercase tracking-wider hover:bg-olive transition-colors"
          title="Click to copy meeting link"
        >
          <span className="text-forest/70 font-mono text-[11px]">{meetingId}</span>
          {copied ? (
            <span className="flex items-center text-emerald-800 text-[10px] space-x-1">
              <Check className="w-3 h-3" />
              <span>COPIED</span>
            </span>
          ) : (
            <Copy className="w-3 h-3 text-forest/70" />
          )}
        </button>
      </div>

      {/* Right: Participants & Connection Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest text-cream text-[10px] font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{isConnected ? 'LIVE FULLSTACK' : 'P2P MESH ACTIVE'}</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-full bg-sage text-forest text-xs font-bold uppercase tracking-widest">
          <Users className="w-3.5 h-3.5" />
          <span>{participantCount}</span>
        </div>
      </div>
    </header>
  );
};
