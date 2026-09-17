import React from 'react';
import { Video, MonitorUp, Palette, MessageSquare, FolderUp, Lock, ArrowDown } from 'lucide-react';
import { FeatureCard } from './FeatureCard';
import { useNavigate } from 'react-router-dom';

export const FeatureSection: React.FC = () => {
  const navigate = useNavigate();

  const scrollToExplore = (featureName?: string) => {
    const el = document.getElementById('showcase');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      number: "FEATURE 01",
      title: "REAL-TIME VIDEO",
      tag: "DTLS / SRTP",
      accentColor: 'terracotta' as const,
      description: "Crystal-clear audio and video communication powered by direct WebRTC peer connections with adaptive bitrate scaling.",
      icon: Video,
      actionText: "TEST VIDEO MESH"
    },
    {
      number: "FEATURE 02",
      title: "SCREEN SHARING",
      tag: "60 FPS NATIVE",
      accentColor: 'amber' as const,
      description: "Present your screen, creative application window, or browser tab with full framerate fidelity without leaving the meeting.",
      icon: MonitorUp,
      actionText: "VIEW SCREENCAST"
    },
    {
      number: "FEATURE 03",
      title: "COLLABORATIVE WHITEBOARD",
      tag: "VECTOR ENGINE",
      accentColor: 'forest' as const,
      description: "Draw, annotate, and brainstorm together on an infinite canvas with real-time peer cursors, sticky notes, and SVG shapes.",
      icon: Palette,
      actionText: "OPEN WHITEBOARD"
    },
    {
      number: "FEATURE 04",
      title: "REAL-TIME CHAT",
      tag: "SOCKET.IO",
      accentColor: 'coral' as const,
      description: "Keep conversations flowing with instant message synchronization, room history caching, and organic bubble aesthetics.",
      icon: MessageSquare,
      actionText: "LAUNCH CHAT"
    },
    {
      number: "FEATURE 05",
      title: "FILE SHARING",
      tag: "SAFE QUARANTINE",
      accentColor: 'amber' as const,
      description: "Share project briefs, design drafts, and creative assets directly inside meetings with server-side validation rejecting executables.",
      icon: FolderUp,
      actionText: "SHARE ASSETS"
    },
    {
      number: "FEATURE 06",
      title: "SECURITY",
      tag: "AUTH & ROLES",
      accentColor: 'moss' as const,
      description: "Cryptographically hashed authentication, protected JWT session cookies, and room membership authorization built into the core.",
      icon: Lock,
      actionText: "AUDIT SECURITY"
    }
  ];

  return (
    <section id="features" className="relative bg-olive-mesh pt-24 sm:pt-28 pb-32 px-6 sm:px-12 lg:px-16 rounded-t-[4rem] sm:rounded-t-[5rem] -mt-12 z-20 border-t border-forest/15">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 sm:mb-20 gap-8">
          <div className="max-w-3xl">
            <span className="editorial-label text-forest/70 block mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-terracotta"></span>
              <span>Integrated Collaboration Capabilities</span>
            </span>
            <h2 className="section-title text-forest tracking-tight">
              EVERYTHING<br />IN ONE SPACE
            </h2>
          </div>

          {/* Large Circular CTA with warm accent border */}
          <button
            onClick={() => scrollToExplore()}
            className="self-start lg:self-end group flex flex-col items-center justify-center w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-[0.2em] shadow-deep transition-all duration-300 hover:scale-105 hover:bg-forest-light border-2 border-amber/30"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <span className="text-center px-4 mb-2">EXPLORE DEMO</span>
            <span className="w-8 h-8 rounded-full bg-amber text-forest flex items-center justify-center transition-transform duration-300 group-hover:translate-y-1 shadow-sm">
              <ArrowDown className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item, idx) => (
            <FeatureCard
              key={idx}
              number={item.number}
              title={item.title}
              tag={item.tag}
              accentColor={item.accentColor}
              description={item.description}
              icon={item.icon}
              actionText={item.actionText}
              onAction={() => {
                if (item.title === 'COLLABORATIVE WHITEBOARD' || item.title === 'REAL-TIME VIDEO') {
                  navigate('/meeting/cs-preview');
                } else {
                  scrollToExplore(item.title);
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
