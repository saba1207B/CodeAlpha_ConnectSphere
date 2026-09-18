import React, { useState, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Presentation, 
  Maximize, Minimize, FileText, Check, ExternalLink 
} from 'lucide-react';
import { Socket } from 'socket.io-client';

interface PresentationSlidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  isHostOrPresenter: boolean;
  socket: Socket | null;
}

interface SlideItem {
  id: number;
  title: string;
  subtitle: string;
  bulletPoints: string[];
  notes: string;
  badge: string;
  bgGradient: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: 1,
    title: 'ConnectSphere Enterprise Platform',
    subtitle: 'Ultra-low Latency WebRTC Mesh & AI-Powered Video Conferencing',
    bulletPoints: [
      'Global NAT Traversal across STUN/TURN mesh',
      'Dual Signaling: WebSockets + Decentralized PeerJS Cloud Mesh',
      'Gemini AI Meeting Intelligence & Live Note Taker',
      'End-to-End Encrypted Media & Data Channels'
    ],
    notes: 'Introduce ConnectSphere key differentiators: zero cloud hosting locks, peer mesh, and real-time AI assistance.',
    badge: 'ARCHITECTURE OVERVIEW',
    bgGradient: 'from-blue-950/60 via-[#181a20] to-[#121316]'
  },
  {
    id: 2,
    title: 'Real-time Signal Processing & Bandwidth',
    subtitle: 'Adaptive HD Video Constraints & Dynamic Transcoding',
    bulletPoints: [
      '1080p Full HD 60fps streaming with dynamic bitrate scaling',
      'Acoustic Echo Cancellation & Web Audio noise suppression graph',
      'Canvas-based virtual background blur & aesthetic color grading',
      'Audio-only low-bandwidth data saver mode'
    ],
    notes: 'Highlight bandwidth resilience on weak cellular connections and low-bandwidth mode.',
    badge: 'MEDIA ENGINE',
    bgGradient: 'from-emerald-950/60 via-[#181a20] to-[#121316]'
  },
  {
    id: 3,
    title: 'In-Meeting Collaboration & Moderation',
    subtitle: 'Interactive Polls, Q&A, Collaborative Vector Whiteboard & Notes',
    bulletPoints: [
      'Interactive live polls with instant percentage tally',
      'Audience Q&A drawer with community upvoting & answer tagging',
      'Real-time collaborative vector whiteboard canvas',
      'Host controls: Waiting room, Mute All, screen share restrictions'
    ],
    notes: 'Demonstrate live polls and host moderation capabilities.',
    badge: 'COLLABORATION',
    bgGradient: 'from-amber-950/60 via-[#181a20] to-[#121316]'
  },
  {
    id: 4,
    title: 'Gemini AI Meeting Intelligence',
    subtitle: 'Automated Minutes, Live Transcripts & Action Items',
    bulletPoints: [
      'Autonomous meeting minutes generation ("Take notes for me")',
      '"Catch me up" 5-minute digest for late joiners',
      'Natural language meeting interrogation ("What was decided regarding budget?")',
      'Automated action item extraction with task owners'
    ],
    notes: 'Emphasize AI assistance accuracy grounded in live speech-to-text transcript buffer.',
    badge: 'AI INTELLIGENCE',
    bgGradient: 'from-purple-950/60 via-[#181a20] to-[#121316]'
  }
];

export const PresentationSlidesModal: React.FC<PresentationSlidesModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  isHostOrPresenter,
  socket
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState('');
  const [isEmbeddingGoogleSlides, setIsEmbeddingGoogleSlides] = useState(false);

  // Sync slides across participants via Socket & BroadcastChannel
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_slides_${meetingId}`);
      bc.onmessage = (e) => {
        const { slideIndex, embedUrl } = e.data;
        if (typeof slideIndex === 'number') setCurrentSlideIndex(slideIndex);
        if (typeof embedUrl === 'string') {
          setGoogleSlidesUrl(embedUrl);
          setIsEmbeddingGoogleSlides(Boolean(embedUrl));
        }
      };
    } catch (e) {}

    if (socket) {
      const handleSlideUpdate = (data: { slideIndex: number; embedUrl?: string }) => {
        if (typeof data.slideIndex === 'number') setCurrentSlideIndex(data.slideIndex);
        if (typeof data.embedUrl === 'string') {
          setGoogleSlidesUrl(data.embedUrl);
          setIsEmbeddingGoogleSlides(Boolean(data.embedUrl));
        }
      };
      socket.on('meeting:slide-change', handleSlideUpdate);

      return () => {
        socket.off('meeting:slide-change', handleSlideUpdate);
        if (bc) bc.close();
      };
    }

    return () => {
      if (bc) bc.close();
    };
  }, [meetingId, socket]);

  const broadcastSlide = (index: number, embedUrl?: string) => {
    setCurrentSlideIndex(index);
    socket?.emit('meeting:slide-change', { meetingId, slideIndex: index, embedUrl });
    try {
      const bc = new BroadcastChannel(`connectsphere_slides_${meetingId}`);
      bc.postMessage({ slideIndex: index, embedUrl });
      bc.close();
    } catch (e) {}
  };

  const handleNext = () => {
    if (currentSlideIndex < DEFAULT_SLIDES.length - 1) {
      broadcastSlide(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      broadcastSlide(currentSlideIndex - 1);
    }
  };

  const handleLoadGoogleSlides = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleSlidesUrl.trim()) return;

    // Convert standard view/edit link to /embed if possible
    let cleanUrl = googleSlidesUrl.trim();
    if (cleanUrl.includes('docs.google.com/presentation') && !cleanUrl.includes('/embed')) {
      cleanUrl = cleanUrl.replace(/\/edit.*$/, '/embed').replace(/\/pub.*$/, '/embed');
      if (!cleanUrl.endsWith('/embed')) cleanUrl = cleanUrl + '/embed';
    }

    setIsEmbeddingGoogleSlides(true);
    broadcastSlide(0, cleanUrl);
  };

  if (!isOpen) return null;

  const currentSlide = DEFAULT_SLIDES[currentSlideIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-5xl h-[88vh] rounded-2xl bg-[#181a20] border border-[#2e323e] flex flex-col overflow-hidden shadow-2xl text-zinc-200">
        {/* Header Bar */}
        <div className="h-14 px-4 sm:px-6 border-b border-[#2e323e] bg-[#1e2026] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Presentation className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm text-white">Interactive Presenter Mode</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
              {isEmbeddingGoogleSlides ? 'Google Slides' : `Slide ${currentSlideIndex + 1} of ${DEFAULT_SLIDES.length}`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {!isEmbeddingGoogleSlides && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showNotes ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#272a34] border-[#373b49] text-zinc-300'
                }`}
                title="Toggle Presenter Notes"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Speaker Notes</span>
              </button>
            )}

            <button
              onClick={onClose}
              title="Close Presentation"
              aria-label="Close Presentation"
              className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presentation Stage */}
        <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Main Slide Viewer */}
          <div className="flex-1 relative flex items-center justify-center p-6 bg-[#111215] overflow-hidden">
            {isEmbeddingGoogleSlides ? (
              <iframe
                src={googleSlidesUrl}
                title="Google Slides Presentation"
                className="w-full h-full rounded-xl border border-[#2e323e] shadow-2xl"
                allowFullScreen
              />
            ) : (
              <div
                className={`w-full max-w-4xl aspect-[16/9] rounded-2xl p-8 sm:p-12 bg-gradient-to-br ${currentSlide.bgGradient} border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Decorative Slide Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest border border-white/15 inline-block mb-4">
                    {currentSlide.badge}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
                    {currentSlide.title}
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-400 font-medium max-w-2xl">
                    {currentSlide.subtitle}
                  </p>
                </div>

                <div className="my-auto py-4 space-y-3">
                  {currentSlide.bulletPoints.map((point, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <span className="text-xs sm:text-sm text-zinc-200 font-medium">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-white/10">
                  <span>ConnectSphere Sync · Confidential</span>
                  <span>Slide {currentSlideIndex + 1} / {DEFAULT_SLIDES.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Presenter Notes Sidebar */}
          {showNotes && !isEmbeddingGoogleSlides && (
            <div className="w-full md:w-80 h-48 md:h-full bg-[#1c1e24] border-l border-[#2e323e] p-5 flex flex-col justify-between flex-shrink-0">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Speaker Talking Points</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-[#232630] p-3.5 rounded-xl border border-[#303442]">
                  {currentSlide.notes}
                </p>
              </div>

              {/* Google Slides Switcher */}
              <div className="pt-4 border-t border-[#2e323e]">
                <form onSubmit={handleLoadGoogleSlides} className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-400 block">
                    Or present Google Slides URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/presentation/..."
                    value={googleSlidesUrl}
                    onChange={(e) => setGoogleSlidesUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#272a34] border border-[#373b49] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-[#2f3340] hover:bg-[#3b4050] text-white text-xs font-medium transition-colors"
                  >
                    Embed Google Slides
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="h-16 px-6 border-t border-[#2e323e] bg-[#1a1c22] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0 || isEmbeddingGoogleSlides}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-[#272a34] hover:bg-[#323644] disabled:opacity-30 text-white text-xs font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlideIndex === DEFAULT_SLIDES.length - 1 || isEmbeddingGoogleSlides}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-xs font-medium transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-md">
            {DEFAULT_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => broadcastSlide(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlideIndex === i ? 'bg-blue-500 scale-125' : 'bg-[#373b49] hover:bg-[#4d5366]'
                }`}
                title={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div>
            {isEmbeddingGoogleSlides && (
              <button
                onClick={() => setIsEmbeddingGoogleSlides(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium"
              >
                Back to Slide Deck
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
