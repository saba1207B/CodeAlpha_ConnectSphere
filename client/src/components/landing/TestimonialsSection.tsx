import React from 'react';
import { Star, Quote, Sparkles } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      quote: "ConnectSphere restored the calm and focus to our studio critiques. The synchronized whiteboard feels like physical paper, and the WebRTC audio latency is practically zero.",
      author: "Julian Sterling",
      role: "Principal, Sterling Motion Atelier",
      location: "Stockholm",
      metric: "4.9/5 RATING",
      accent: "border-terracotta/30 bg-terracotta/5"
    },
    {
      quote: "Replacing bloated enterprise meeting tools with ConnectSphere gave our remote engineering pod back hours of productive flow. Direct peer connections make screen sharing instantaneous.",
      author: "Dr. Maya Lindqvist",
      role: "Head of Systems, Kinetic Lab",
      location: "Berlin",
      metric: "99.98% UPTIME",
      accent: "border-amber/30 bg-amber/5"
    },
    {
      quote: "The Forest and Sage editorial design is breathtaking. Our clients immediately remark on how premium and tactile our presentation sessions feel.",
      author: "Renato Silva",
      role: "Creative Director, Studio Vanguarda",
      location: "São Paulo",
      metric: "ZERO TELEMETRY",
      accent: "border-coral/30 bg-coral/5"
    }
  ];

  return (
    <section className="relative bg-warm-mesh pt-24 sm:pt-28 pb-32 px-6 sm:px-12 lg:px-16 border-t border-forest/15">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 sm:mb-20 max-w-3xl">
          <span className="editorial-label text-forest/70 block mb-3 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber" />
            <span>Studio Perspectives</span>
          </span>
          <h2 className="section-title text-forest tracking-tight">
            PROVEN IN<br />PRACTICE
          </h2>
          <p className="text-forest/80 text-sm sm:text-base mt-4 max-w-xl">
            How creative directors, research groups, and product builders collaborate inside ConnectSphere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className={`p-8 sm:p-9 rounded-card-lg bg-cream/95 border shadow-sm flex flex-col justify-between min-h-[360px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-deep ${r.accent}`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-1 text-amber">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber" />
                    ))}
                  </div>
                  <span className="editorial-label text-[9px] px-2.5 py-0.5 rounded-full bg-forest text-cream font-mono">
                    {r.metric}
                  </span>
                </div>

                <Quote className="w-8 h-8 text-forest/20 mb-4" />
                <p className="text-forest text-sm sm:text-base leading-relaxed italic mb-8">
                  "{r.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-forest/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold uppercase tracking-wider text-forest">
                    {r.author}
                  </div>
                  <div className="text-[11px] text-forest/60">
                    {r.role}
                  </div>
                </div>
                <span className="editorial-label text-[10px] text-forest/50">
                  {r.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
