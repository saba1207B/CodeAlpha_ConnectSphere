import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, ShieldCheck, LayoutGrid, Maximize, 
  Minimize, Edit2, Wifi, HelpCircle, ChevronDown, 
  Tv, Columns, Layout 
} from 'lucide-react';

export type MeetingLayoutMode = 'gallery' | 'speaker' | 'spotlight' | 'sidebar';

interface MeetingHeaderProps {
  meetingId: string;
  meetingTitle?: string;
  participantCount: number;
  isConnected: boolean;
  layoutMode?: MeetingLayoutMode;
  onSelectLayout?: (mode: MeetingLayoutMode) => void;
  onRename?: () => void;
  onOpenShortcuts?: () => void;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meetingId,
  meetingTitle = "ConnectSphere Meeting",
  participantCount,
  isConnected,
  layoutMode = 'gallery',
  onSelectLayout,
  onRename,
  onOpenShortcuts
}) => {
  const [copied, setCopied] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (total: number) => {
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
    const secs = (total % 60).toString().padStart(2, '0');
    if (hrs > 0) return `${hrs}:${mins}:${secs}`;
    return `${mins}:${secs}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-6 bg-[#181a20] border-b border-[#262933] flex items-center justify-between text-zinc-300 z-30 select-none">
      {/* Left: Security Shield & Meeting ID with Quick Copy & Connection Quality */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-medium text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">E2E Encrypted</span>
        </div>

        <span className="hidden sm:inline h-4 w-px bg-[#313543]"></span>

        <button
          onClick={handleCopyLink}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#20232b] hover:bg-[#282c37] border border-[#313644] text-xs transition-colors"
          title="Click to copy meeting link"
        >
          <span className="font-mono text-zinc-300 text-[11px] font-semibold">{meetingId}</span>
          {copied ? (
            <span className="flex items-center text-emerald-400 text-[10px] space-x-1">
              <Check className="w-3 h-3" />
              <span>Copied!</span>
            </span>
          ) : (
            <Copy className="w-3 h-3 text-zinc-400" />
          )}
        </button>

        {/* Network Quality Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
          <Wifi className="w-3 h-3" />
          <span>HD · 28ms</span>
        </div>
      </div>

      {/* Center: Meeting Duration Timer */}
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-xs font-mono text-zinc-300 tracking-wider">
          {formatTimer(seconds)}
        </span>
      </div>

      {/* Right: Layout Switcher Dropdown, Rename, Shortcuts & Fullscreen */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {onRename && (
          <button
            onClick={onRename}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#20232b] hover:bg-[#282c37] border border-[#313644] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            title="Rename your display name"
          >
            <Edit2 className="w-3 h-3" />
            <span className="hidden md:inline">Rename</span>
          </button>
        )}

        {/* Layout Switcher Dropdown */}
        {onSelectLayout && (
          <div className="relative">
            <button
              onClick={() => setLayoutDropdownOpen(!layoutDropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#20232b] hover:bg-[#282c37] border border-[#313644] text-zinc-300 hover:text-white text-xs font-medium transition-colors capitalize"
              title="Change Meeting Layout"
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{layoutMode}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {layoutDropdownOpen && (
              <div className="absolute right-0 top-9 w-48 p-1.5 rounded-xl bg-[#1e2026] border border-[#313644] text-xs shadow-2xl z-50 space-y-1">
                {[
                  { id: 'gallery', label: 'Tiled Grid View', icon: LayoutGrid },
                  { id: 'speaker', label: 'Speaker + Filmstrip', icon: Tv },
                  { id: 'spotlight', label: 'Spotlight Focus', icon: Maximize },
                  { id: 'sidebar', label: 'Sidebar Layout', icon: Columns }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectLayout(item.id as MeetingLayoutMode);
                        setLayoutDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center space-x-2 text-left transition-colors ${
                        layoutMode === item.id
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Keyboard Shortcuts Button */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-lg bg-[#20232b] hover:bg-[#282c37] border border-[#313644] text-zinc-400 hover:text-white transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          className="p-1.5 rounded-lg bg-[#20232b] hover:bg-[#282c37] border border-[#313644] text-zinc-400 hover:text-white transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
