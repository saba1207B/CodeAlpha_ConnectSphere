import React, { useState } from 'react';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, MonitorUp, 
  MessageSquare, Users, Palette, PhoneOff, Settings, ShieldCheck, Sparkles, Monitor 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ShowcaseSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeSpeaker, setActiveSpeaker] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [previewTab, setPreviewTab] = useState<'video' | 'whiteboard'>('video');

  const participants = [
    {
      name: "Marcus Vance",
      role: "Host & Creative Director",
      color: "bg-forest",
      avatarBg: "bg-terracotta text-cream",
      avatarText: "MV",
      isMuted: false,
      hasVideo: true,
    },
    {
      name: "Amara Chen",
      role: "Principal Systems Architect",
      color: "bg-[#1b4332]",
      avatarBg: "bg-amber text-forest",
      avatarText: "AC",
      isMuted: true,
      hasVideo: true,
    },
    {
      name: "Liam Thorne",
      role: "WebRTC Audio Engineer",
      color: "bg-[#2d4a3e]",
      avatarBg: "bg-moss text-cream",
      avatarText: "LT",
      isMuted: false,
      hasVideo: false,
    },
    {
      name: "Sophia Rossi",
      role: "Executive Product Lead",
      color: "bg-[#0b291e]",
      avatarBg: "bg-coral text-cream",
      avatarText: "SR",
      isMuted: false,
      hasVideo: true,
    }
  ];

  return (
    <section id="showcase" className="relative bg-forest-mesh text-cream pt-24 sm:pt-28 pb-32 px-6 sm:px-12 lg:px-16 rounded-t-[4rem] sm:rounded-t-[5rem] -mt-12 z-30 border-t border-forest-light">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-8">
          <div>
            <span className="editorial-label text-amber block mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse"></span>
              <span>Live Interactive Sandbox</span>
            </span>
            <h2 className="section-title text-cream tracking-tight">
              SEE THE<br />DIFFERENCE
            </h2>
          </div>
          <div className="max-w-md self-start lg:self-end">
            <p className="text-sage/90 text-sm sm:text-base leading-relaxed mb-4">
              Real React components with dynamic speaker switching, responsive multi-peer grids, and real-time audio waveforms.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewTab('video')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  previewTab === 'video'
                    ? 'bg-amber text-forest shadow-sm'
                    : 'bg-cream/15 text-cream hover:bg-cream/25'
                }`}
              >
                Video Grid View
              </button>
              <button
                onClick={() => setPreviewTab('whiteboard')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  previewTab === 'whiteboard'
                    ? 'bg-terracotta text-cream shadow-sm'
                    : 'bg-cream/15 text-cream hover:bg-cream/25'
                }`}
              >
                Whiteboard View
              </button>
            </div>
          </div>
        </div>

        {/* Meeting Interface Preview in Cream Container */}
        <div className="relative rounded-card-lg sm:rounded-container-xl bg-warm-mesh p-4 sm:p-8 shadow-deep text-forest border-2 border-forest/20 overflow-hidden">
          {/* Top Bar of Preview */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-forest/15">
            <div className="flex items-center space-x-3">
              <span className="font-display text-xl tracking-tight text-forest">—CONNECTSPHERE</span>
              <span className="h-4 w-px bg-forest/20"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-forest/80 truncate max-w-xs">
                Design Alignment · CS-842-LIVE
              </span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest text-cream text-[10px] font-bold uppercase tracking-widest shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse"></span>
                <span>WebRTC Mesh Online</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-amber text-forest text-[10px] font-bold uppercase tracking-widest">
                4 Active
              </div>
            </div>
          </div>

          {/* Interactive Screen Share / Whiteboard Banner if active */}
          {isScreenSharing && (
            <div className="my-4 p-3 rounded-organic-sm bg-amber/20 border border-amber/40 text-xs font-bold uppercase tracking-wider text-forest flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-terracotta" />
                <span>Simulated High-FPS Screen Presentation in Progress</span>
              </span>
              <button
                onClick={() => setIsScreenSharing(false)}
                className="px-3 py-1 rounded-full bg-forest text-cream text-[10px] font-bold uppercase"
              >
                Stop Sharing
              </button>
            </div>
          )}

          {previewTab === 'whiteboard' ? (
            /* Interactive Whiteboard Canvas Preview */
            <div className="my-6 p-6 rounded-organic-md bg-cream border border-forest/15 min-h-[320px] flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-forest">
                  <Palette className="w-4 h-4 text-terracotta" />
                  <span>Synchronized Editorial Canvas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded-full bg-terracotta"></span>
                  <span className="w-3 h-3 rounded-full bg-amber"></span>
                  <span className="w-3 h-3 rounded-full bg-forest"></span>
                </div>
              </div>

              <div className="my-6 flex items-center justify-center relative">
                <svg className="w-full max-w-xl h-36" viewBox="0 0 500 120">
                  <path
                    d="M 20 80 C 120 10, 220 120, 340 40 S 460 100, 480 30"
                    fill="none"
                    stroke="#01472e"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="340" cy="40" r="7" fill="#e07a5f" />
                  <text x="355" y="45" fill="#01472e" fontSize="12" fontWeight="bold" fontFamily="Inter">
                    Elena's Annotation
                  </text>
                  <rect x="80" y="30" width="100" height="50" rx="10" fill="#e9edc9" stroke="#ccd5ae" />
                  <text x="95" y="60" fill="#01472e" fontSize="11" fontWeight="bold" fontFamily="Inter">
                    Key Metric
                  </text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-forest/70 border-t border-forest/10 pt-3">
                <span>Direct Vector Sync</span>
                <span className="text-terracotta font-mono">14 MS P2P</span>
              </div>
            </div>
          ) : (
            /* 4-Participant Video Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              {participants.map((p, index) => {
                const isActive = activeSpeaker === index;
                return (
                  <div
                    key={index}
                    onClick={() => setActiveSpeaker(index)}
                    className={`relative aspect-video rounded-organic-md overflow-hidden transition-all duration-300 cursor-pointer ${
                      p.color
                    } ${
                      isActive ? 'ring-4 ring-terracotta shadow-floating scale-[1.01]' : 'border border-forest/20 opacity-95'
                    }`}
                  >
                    {/* Participant Avatar & Stream Simulation */}
                    <div className="w-full h-full flex flex-col items-center justify-center relative p-6">
                      <div className="relative">
                        <div className={`w-16 sm:w-20 h-16 sm:h-20 rounded-full ${p.avatarBg} flex items-center justify-center font-display text-2xl shadow-md transition-transform hover:scale-105`}>
                          {p.avatarText}
                        </div>
                        {isActive && (
                          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-terracotta text-cream shadow-sm animate-bounce">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Active Waveform / Speaker Tag */}
                      {isActive && (
                        <div className="mt-3 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cream/20 backdrop-blur-md text-cream text-[10px] font-bold uppercase tracking-widest shadow-sm">
                          <span className="w-1.5 h-3 bg-amber rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-4 bg-terracotta rounded-full animate-bounce [animation-delay:0.15s]"></span>
                          <span className="w-1.5 h-2 bg-amber rounded-full animate-bounce [animation-delay:0.3s]"></span>
                          <span className="ml-1 text-cream">Active Audio</span>
                        </div>
                      )}
                    </div>

                    {/* Participant Name Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-cream px-3.5 py-2 rounded-full bg-forest/90 backdrop-blur-md border border-forest-light/40 shadow-sm">
                      <span className="tracking-wider uppercase truncate">{p.name}</span>
                      <div className="flex items-center space-x-2">
                        {p.isMuted ? (
                          <MicOff className="w-3.5 h-3.5 text-rose-300" />
                        ) : (
                          <Mic className="w-3.5 h-3.5 text-amber" />
                        )}
                        {!p.hasVideo && (
                          <VideoOff className="w-3.5 h-3.5 text-amber-200" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive Control Bar */}
          <div className="pt-4 border-t border-forest/15 flex flex-wrap items-center justify-between gap-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-forest/70">
              <ShieldCheck className="w-4 h-4 text-terracotta" />
              <span>Peer-to-Peer Verified</span>
            </div>

            {/* Centered Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 mx-auto">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full transition-all duration-300 shadow-sm ${
                  isMuted ? 'bg-rose-700 text-cream' : 'bg-forest text-cream hover:bg-forest-light'
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3.5 rounded-full transition-all duration-300 shadow-sm ${
                  isVideoOff ? 'bg-rose-700 text-cream' : 'bg-forest text-cream hover:bg-forest-light'
                }`}
                title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3.5 rounded-full transition-all duration-300 shadow-sm ${
                  isScreenSharing ? 'bg-amber text-forest font-bold ring-2 ring-forest' : 'bg-forest text-cream hover:bg-forest-light'
                }`}
                title="Toggle Screen Share"
              >
                <MonitorUp className="w-5 h-5" />
              </button>

              <button
                onClick={() => setPreviewTab(previewTab === 'video' ? 'whiteboard' : 'video')}
                className={`p-3.5 rounded-full transition-all duration-300 shadow-sm ${
                  previewTab === 'whiteboard' ? 'bg-terracotta text-cream ring-2 ring-forest' : 'bg-forest text-cream hover:bg-forest-light'
                }`}
                title="Toggle Whiteboard Canvas"
              >
                <Palette className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/meeting/room-demo')}
                className="px-5 py-3.5 rounded-full bg-[#7a1e1e] hover:bg-[#8f2323] text-cream font-bold text-xs uppercase tracking-widest shadow-sm transition-all"
              >
                Leave
              </button>
            </div>

            {/* Right Action */}
            <div className="hidden sm:flex items-center">
              <button
                onClick={() => navigate('/meeting/room-interactive')}
                className="px-5 py-2.5 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-widest hover:bg-forest-light transition-all shadow-sm"
              >
                Join Live Room →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
