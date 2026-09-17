import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Sparkles, Video, Users } from 'lucide-react';
import { FloatingVisuals } from './FloatingVisuals';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartInstantMeeting = () => {
    const roomId = 'room-' + Math.random().toString(36).substring(2, 8);
    navigate(`/meeting/${roomId}`);
  };

  return (
    <section className="relative min-h-[92vh] lg:min-h-screen bg-sage-mesh flex flex-col justify-between pt-24 sm:pt-28 pb-10 sm:pb-12 px-6 sm:px-12 lg:px-16 overflow-hidden select-none border-b border-forest/15">
      {/* Background communication floating visuals (safely positioned on flanks on wide screens) */}
      <FloatingVisuals />

      {/* Center oversized Editorial Typography & CTA */}
      <div className="relative z-20 my-auto flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full px-2">
        {/* Editorial Pill Badge with warm terracotta and amber highlights */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cream/90 border border-forest/20 text-forest shadow-sm backdrop-blur-md mb-6 transition-transform hover:scale-105">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
          <span className="editorial-label text-[10px] sm:text-xs text-forest">
            WebRTC Media Mesh · Version 2.4
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber text-forest text-[9px] font-bold uppercase tracking-wider">
            Live
          </span>
        </div>

        {/* Hero Title - Well-proportioned, never overflows viewport width */}
        <h1 className="hero-typography text-forest max-w-full tracking-tight mb-6">
          CONNECT<br />
          <span className="text-forest-dark">IN REAL TIME</span>
        </h1>

        <p className="text-forest/85 font-medium text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
          An editorial collaboration workspace engineered with direct peer-to-peer video, synchronized vector whiteboard, and zero third-party telemetry.
        </p>

        {/* Primary CTA: Organic Pill / Circular Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleStartInstantMeeting}
            className="group relative inline-flex items-center justify-center space-x-4 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-forest text-cream font-display text-xl sm:text-2xl tracking-wider uppercase transition-all duration-300 shadow-deep hover:shadow-deep-lg hover:-translate-y-1 hover:bg-forest-light active:translate-y-0"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <span>START A MEETING</span>
            <span className="w-9 h-9 rounded-full bg-terracotta text-cream flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1.5 shadow-sm">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          <a
            href="#showcase"
            className="px-6 py-4 rounded-full bg-cream/80 hover:bg-cream border border-forest/20 text-forest font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-sm"
          >
            Interactive Demo ↓
          </a>
        </div>
      </div>

      {/* Hero Information: Clean Two-Column Editorial Bottom Layout */}
      <div className="relative z-20 pt-8 sm:pt-10 border-t border-forest/15 grid grid-cols-1 md:grid-cols-12 gap-6 items-end max-w-7xl mx-auto w-full">
        {/* Left Column */}
        <div className="md:col-span-7">
          <span className="editorial-label text-forest/70 block mb-1.5">
            Real-Time Communication Architecture
          </span>
          <p className="text-forest font-semibold text-sm sm:text-base lg:text-lg leading-snug max-w-xl">
            Pure browser peer meshes, sub-50ms vector whiteboard sync, and encrypted file pipelines designed for high-caliber creative teams.
          </p>
        </div>

        {/* Right Column: Status Chips with rich warm accents */}
        <div className="md:col-span-5 flex flex-wrap items-center justify-start md:justify-end gap-3 text-xs font-bold text-forest">
          <div className="px-4 py-2.5 rounded-organic-sm bg-cream/85 border border-forest/15 shadow-sm flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-terracotta" />
            <div>
              <span className="text-[9px] uppercase tracking-widest text-forest/60 block">Origin</span>
              <span className="tracking-wider uppercase text-xs">WebRTC Direct</span>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-organic-sm bg-cream/85 border border-forest/15 shadow-sm flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse"></span>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-forest/60 block">Protocol</span>
              <span className="tracking-wider uppercase text-xs">Active Session</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
