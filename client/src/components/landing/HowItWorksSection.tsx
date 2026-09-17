import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "CREATE",
      tag: "IDENTITY",
      color: "group-hover:text-terracotta",
      badgeColor: "bg-terracotta/15 text-terracotta-dark border-terracotta/30",
      desc: "Initialize your verified account in seconds, configuring hardware media devices and security preferences."
    },
    {
      num: "02",
      title: "CONNECT",
      tag: "DISCOVERY",
      color: "group-hover:text-amber",
      badgeColor: "bg-amber/20 text-amber-dark border-amber/40",
      desc: "Launch an instant meeting room or join an active session with a single clean room code or invite link."
    },
    {
      num: "03",
      title: "COLLABORATE",
      tag: "EXECUTION",
      color: "group-hover:text-coral",
      badgeColor: "bg-coral/15 text-coral-dark border-coral/30",
      desc: "Broadcast audio, high-fps video, synchronized vector whiteboards, screen feeds and project documents in real time."
    },
    {
      num: "04",
      title: "DELIVER",
      tag: "OUTCOMES",
      color: "group-hover:text-forest",
      badgeColor: "bg-forest/15 text-forest border-forest/30",
      desc: "Translate real-time dialogue into shared momentum, documented decisions, and delivered creative output."
    }
  ];

  return (
    <section className="relative bg-warm-mesh pt-24 sm:pt-28 pb-32 px-6 sm:px-12 lg:px-16 border-t border-forest/15">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 sm:mb-20 max-w-3xl">
          <span className="editorial-label text-forest/70 block mb-3 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-terracotta"></span>
            <span>Workflow Progression</span>
          </span>
          <h2 className="section-title text-forest tracking-tight">
            HOW IT WORKS
          </h2>
          <p className="text-forest/80 text-sm sm:text-base mt-4 max-w-xl">
            From initial link generation to high-fidelity creative output in four frictionless milestones.
          </p>
        </div>

        {/* Editorial Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-card-lg bg-cream/90 border border-forest/15 shadow-sm flex flex-col justify-between min-h-[360px] transition-all duration-300 hover:bg-white hover:-translate-y-1.5 hover:shadow-deep"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`editorial-label text-[9px] px-2.5 py-0.5 rounded-full border ${step.badgeColor}`}>
                    {step.tag}
                  </span>
                  <span className="text-[10px] font-bold text-forest/50 font-mono">
                    STAGE 0{idx + 1}
                  </span>
                </div>

                <span className={`font-display text-6xl sm:text-7xl text-forest/30 ${step.color} transition-colors duration-300 leading-none block mb-4`}>
                  {step.num}
                </span>

                <h3 className="font-display text-2xl sm:text-3xl text-forest tracking-tight mb-3">
                  {step.title}
                </h3>
                <p className="text-forest/80 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-forest/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-forest/60">
                <span>Phase {step.num} Complete</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-terracotta" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
