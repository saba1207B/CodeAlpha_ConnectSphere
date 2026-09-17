import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tag: string;
  accentColor?: 'terracotta' | 'amber' | 'coral' | 'forest' | 'moss';
  actionText?: string;
  onAction?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  number,
  title,
  description,
  icon: Icon,
  tag,
  accentColor = 'terracotta',
  actionText = "EXPLORE FEATURE",
  onAction
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'terracotta':
        return {
          iconBg: 'bg-terracotta text-cream',
          tagBg: 'bg-terracotta/15 text-terracotta-dark border-terracotta/30',
          hoverBorder: 'hover:border-terracotta/40'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber text-forest',
          tagBg: 'bg-amber/20 text-amber-dark border-amber/40',
          hoverBorder: 'hover:border-amber/40'
        };
      case 'coral':
        return {
          iconBg: 'bg-coral text-cream',
          tagBg: 'bg-coral/15 text-coral-dark border-coral/30',
          hoverBorder: 'hover:border-coral/40'
        };
      case 'moss':
        return {
          iconBg: 'bg-moss text-forest',
          tagBg: 'bg-moss/20 text-forest border-moss/40',
          hoverBorder: 'hover:border-moss/40'
        };
      default:
        return {
          iconBg: 'bg-forest text-cream',
          tagBg: 'bg-forest/10 text-forest border-forest/20',
          hoverBorder: 'hover:border-forest/40'
        };
    }
  };

  const accent = getAccentStyles();

  return (
    <div className={`feature-card-wrapper relative p-8 sm:p-9 rounded-card-lg bg-cream/95 border border-forest/15 shadow-sm flex flex-col justify-between min-h-[380px] transition-all duration-300 ${accent.hoverBorder}`}>
      {/* Top row: Number, Tag, and Icon */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="editorial-label text-forest/60 text-[10px]">
              {number}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${accent.tagBg}`}>
              {tag}
            </span>
          </div>
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${accent.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-2xl sm:text-3xl text-forest tracking-tight leading-tight mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-forest/80 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Card bottom details */}
      <div className="pt-5 border-t border-forest/10 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-forest/70">
        <span className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
          <span>Zero Plugins</span>
        </span>
        <span className="font-mono text-xs">P2P MESH</span>
      </div>

      {/* Blur-Reveal Button Interaction Overlay */}
      <div className="blur-overlay">
        <button
          onClick={onAction}
          className="blur-reveal-btn flex items-center space-x-2 px-6 py-3 rounded-full bg-cream text-forest font-bold text-xs uppercase tracking-[0.25em] shadow-deep hover:bg-forest hover:text-cream transition-colors duration-300 border border-forest/10"
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <span>{actionText}</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
