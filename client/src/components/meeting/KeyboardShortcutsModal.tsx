import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['Alt', 'A'], description: 'Mute or Unmute audio microphone', category: 'Audio & Video' },
  { keys: ['Alt', 'V'], description: 'Start or Stop video camera', category: 'Audio & Video' },
  { keys: ['Alt', 'S'], description: 'Start or Stop screen sharing', category: 'Audio & Video' },
  { keys: ['Space'], description: 'Push-to-Talk (temporarily unmute while pressed)', category: 'Audio & Video' },
  { keys: ['Alt', 'C'], description: 'Toggle Live Captions (Subtitles)', category: 'Accessibility' },
  { keys: ['Alt', 'H'], description: 'Raise or Lower your hand', category: 'Participation' },
  { keys: ['Alt', 'M'], description: 'Toggle In-Meeting Chat drawer', category: 'Collaboration' },
  { keys: ['Alt', 'P'], description: 'Toggle Participants list drawer', category: 'Collaboration' },
  { keys: ['Alt', 'W'], description: 'Open Collaborative Whiteboard', category: 'Collaboration' },
  { keys: ['F'], description: 'Toggle Fullscreen view mode', category: 'View & Navigation' },
  { keys: ['Esc'], description: 'Close any open drawer or modal', category: 'View & Navigation' },
  { keys: ['?'], description: 'Open this Keyboard Shortcuts cheat sheet', category: 'View & Navigation' }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = Array.from(new Set(SHORTCUTS.map((s) => s.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-xl p-6 rounded-2xl bg-[#1e2026] border border-[#313644] text-zinc-200 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-2">
          <Keyboard className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-lg text-white">Keyboard Shortcuts</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-6">
          Speed up your workflow and navigate ConnectSphere meetings without taking your hands off the keyboard.
        </p>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                {cat}
              </h4>
              <div className="space-y-1.5">
                {SHORTCUTS.filter((s) => s.category === cat).map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#272a34] border border-[#373b49]"
                  >
                    <span className="text-xs text-zinc-300">{s.description}</span>
                    <div className="flex items-center space-x-1">
                      {s.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="px-2 py-1 rounded bg-[#1c1e24] border border-[#3a3f4e] text-zinc-200 font-mono text-[10px] font-semibold shadow-inner"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#313644] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
