import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Radio } from 'lucide-react';

export const FinalCtaSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartInstantMeeting = () => {
    const roomId = 'room-' + Math.random().toString(36).substring(2, 8);
    navigate(`/meeting/${roomId}`);
  };

  return (
    <section className="relative bg-forest-mesh text-cream pt-28 pb-32 px-6 sm:px-12 lg:px-16 rounded-t-[4rem] sm:rounded-t-[5rem] -mt-12 z-30 overflow-hidden border-t border-forest-light select-none">
      {/* Subtle Floating Decorative Elements */}
      <div className="absolute top-16 left-10 p-3.5 rounded-full bg-terracotta/20 text-terracotta border border-terracotta/30 animate-float">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="absolute bottom-16 right-12 p-4 rounded-full bg-amber/20 text-amber border border-amber/30 animate-float-reverse">
        <Radio className="w-6 h-6" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        <span className="editorial-label text-amber block mb-4 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-ping"></span>
          <span>Begin Seamless Collaboration</span>
        </span>

        {/* Scaled Anton Headline */}
        <h2 className="font-display text-6xl sm:text-8xl lg:text-9xl leading-[0.85] text-cream tracking-tight mb-6">
          LET'S<br />CONNECT.
        </h2>

        {/* Subtitle */}
        <p className="text-sage/90 text-base sm:text-xl max-w-lg mb-10 font-medium">
          Your next conversation starts here. Zero clutter, zero downloads, pure editorial clarity.
        </p>

        {/* Large Circular Cream CTA with Terracotta Icon */}
        <button
          onClick={handleStartInstantMeeting}
          className="group flex items-center space-x-4 px-9 sm:px-12 py-5 sm:py-6 rounded-full bg-cream text-forest font-display text-xl sm:text-2xl tracking-wider uppercase shadow-deep hover:scale-105 hover:bg-white transition-all duration-300"
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <span>START A MEETING</span>
          <span className="w-10 h-10 rounded-full bg-terracotta text-cream flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1.5 shadow-sm">
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </section>
  );
};
