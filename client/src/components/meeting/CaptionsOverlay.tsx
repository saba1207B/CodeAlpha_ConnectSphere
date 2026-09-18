import React from 'react';
import { Subtitles } from 'lucide-react';
import { CaptionItem } from '../../hooks/useLiveCaptions';

interface CaptionsOverlayProps {
  caption: CaptionItem | null;
  enabled: boolean;
  fontSize?: 'medium' | 'large';
  onToggleLanguage?: () => void;
  selectedLanguage?: string;
}

export const CaptionsOverlay: React.FC<CaptionsOverlayProps> = ({
  caption,
  enabled,
  fontSize = 'medium'
}) => {
  if (!enabled || !caption || !caption.text) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] px-4 pointer-events-none select-none transition-all duration-300">
      <div className="mx-auto flex flex-col items-center">
        <div className="px-4 py-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-center shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          {/* Speaker label & Language badge */}
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-zinc-300 tracking-wide">
              {caption.speakerName}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 text-zinc-400 uppercase">
              {caption.language.split('-')[0]}
            </span>
          </div>

          {/* Subtitle Text */}
          <p
            className={`font-medium text-white leading-snug drop-shadow-md ${
              fontSize === 'large' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
            }`}
          >
            {caption.text}
          </p>
        </div>
      </div>
    </div>
  );
};
