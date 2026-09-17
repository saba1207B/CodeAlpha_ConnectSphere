import React from 'react';
import { Mic, Sparkles, Activity, ShieldCheck, Video } from 'lucide-react';

export const FloatingVisuals: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 select-none">
      {/* Floating Card 1: Live Studio Participant Card (Positioned safely on top-right flank on wide screens) */}
      <div 
        className="hidden xl:flex absolute top-28 right-8 2xl:right-16 w-60 p-4 rounded-floating bg-cream/95 border border-forest/20 shadow-floating backdrop-blur-xl animate-float flex-col"
        style={{ animationDelay: '0s' }}
      >
        <div className="relative aspect-video rounded-organic-sm overflow-hidden bg-forest/10 flex items-center justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-forest text-cream flex items-center justify-center font-display text-lg shadow-sm">
            EL
          </div>
          <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-forest/90 text-[9px] text-cream font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse"></span>
            <span>HD LIVE</span>
          </div>
          <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-terracotta text-cream shadow-sm">
            <Mic className="w-3 h-3" />
          </div>
        </div>
        <div className="flex items-center justify-between text-forest text-xs font-bold px-1">
          <span className="tracking-wider uppercase">Elena Vance</span>
          <span className="text-[9px] tracking-widest text-terracotta-dark font-mono">SPEAKING</span>
        </div>
      </div>

      {/* Floating Card 2: Synchronized Whiteboard Vector Fragment (Positioned safely on bottom-left flank) */}
      <div 
        className="hidden xl:flex absolute bottom-36 left-8 2xl:left-16 w-64 p-4 rounded-floating bg-cream/95 border border-forest/20 shadow-floating backdrop-blur-xl animate-float-reverse flex-col"
        style={{ animationDelay: '1.8s' }}
      >
        <div className="flex items-center justify-between mb-2 text-forest">
          <span className="editorial-label text-[9px] text-forest/70">Sync Canvas</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-terracotta"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-forest"></span>
          </div>
        </div>
        <div className="h-20 rounded-organic-sm bg-olive/40 border border-forest/15 p-2.5 relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 180 70">
            <path
              d="M 10 50 Q 50 10 90 35 T 170 20"
              fill="none"
              stroke="#01472e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="90" cy="35" r="4.5" fill="#e07a5f" />
            <circle cx="170" cy="20" r="4.5" fill="#e09f3e" />
          </svg>
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-terracotta text-cream text-[8px] font-bold uppercase tracking-widest shadow-sm">
            Live 12ms
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-2 text-[10px] text-forest/80 font-bold tracking-widest uppercase">
          <Activity className="w-3.5 h-3.5 text-terracotta" />
          <span>Vector Peer Broadcast</span>
        </div>
      </div>

      {/* Floating Card 3: Encrypted WebRTC Mesh Status Pill (Positioned on lower-right flank) */}
      <div 
        className="hidden 2xl:flex absolute bottom-44 right-16 p-3.5 rounded-floating bg-cream/95 border border-forest/20 shadow-floating backdrop-blur-xl items-center space-x-3 animate-float-slow"
        style={{ animationDelay: '3.2s' }}
      >
        <div className="w-9 h-9 rounded-full bg-amber text-forest flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-forest" />
        </div>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-forest/60">
            Direct WebRTC
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-forest">
            End-to-End Mesh
          </div>
        </div>
      </div>
    </div>
  );
};
