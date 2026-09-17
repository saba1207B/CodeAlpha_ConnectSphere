import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Video, Shield, Bell, Check } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [hdVideo, setHdVideo] = useState(true);
  const [autoMute, setAutoMute] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream text-forest flex flex-col justify-between pt-24 pb-16 px-6 sm:px-12 lg:px-20">
      <Navigation />

      <main className="max-w-3xl mx-auto w-full my-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-forest/70 hover:text-forest transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="p-8 sm:p-12 rounded-card-lg sm:rounded-container-xl bg-olive/30 border border-forest/15 shadow-deep">
          <div className="mb-10 pb-8 border-b border-forest/15">
            <span className="editorial-label text-forest/60 block mb-1">
              Configuration Matrix
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
              STUDIO PREFERENCES
            </h1>
          </div>

          <div className="space-y-6">
            {/* Audio Settings */}
            <div className="space-y-4">
              <span className="editorial-label text-xs text-forest block mb-2">
                Acoustics &amp; Signal Processing
              </span>

              <div className="p-4 rounded-organic-sm bg-cream border border-forest/15 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    Automatic Echo Cancellation
                  </div>
                  <div className="text-[11px] text-forest/70">
                    Cancels speaker bleed during active open-mic collaboration.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEchoCancellation(!echoCancellation)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    echoCancellation ? 'bg-forest' : 'bg-forest/20'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-cream transition-transform absolute top-1 ${
                      echoCancellation ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-organic-sm bg-cream border border-forest/15 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    Neural Noise Suppression
                  </div>
                  <div className="text-[11px] text-forest/70">
                    Isolates vocal frequencies and filters background HVAC/keystrokes.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNoiseSuppression(!noiseSuppression)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    noiseSuppression ? 'bg-forest' : 'bg-forest/20'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-cream transition-transform absolute top-1 ${
                      noiseSuppression ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-organic-sm bg-cream border border-forest/15 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    Join Rooms Muted by Default
                  </div>
                  <div className="text-[11px] text-forest/70">
                    Always enter sessions with microphone muted.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoMute(!autoMute)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    autoMute ? 'bg-forest' : 'bg-forest/20'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-cream transition-transform absolute top-1 ${
                      autoMute ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Video Settings */}
            <div className="space-y-4 pt-4 border-t border-forest/15">
              <span className="editorial-label text-xs text-forest block mb-2">
                Video &amp; Screen Pipelines
              </span>

              <div className="p-4 rounded-organic-sm bg-cream border border-forest/15 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    High-Definition 1080p Stream
                  </div>
                  <div className="text-[11px] text-forest/70">
                    Prioritizes crisp detail over bandwidth throttling.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHdVideo(!hdVideo)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    hdVideo ? 'bg-forest' : 'bg-forest/20'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-cream transition-transform absolute top-1 ${
                      hdVideo ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-forest/15">
              <div className="text-xs">
                {saved && (
                  <span className="text-emerald-800 font-bold flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>PREFERENCES SAVED</span>
                  </span>
                )}
              </div>
              <button
                onClick={handleSave}
                className="px-8 py-4 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-[0.2em] hover:bg-forest-light transition-all shadow-deep"
              >
                Apply Preferences
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-forest/40 uppercase tracking-widest pt-8">
        ConnectSphere Core Device Settings
      </footer>
    </div>
  );
};
