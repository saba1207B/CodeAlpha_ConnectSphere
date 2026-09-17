import React, { useState, useEffect } from 'react';
import { X, Mic, Video, Volume2, ShieldCheck, Check } from 'lucide-react';

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({ isOpen, onClose }) => {
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioInputs(devices.filter((d) => d.kind === 'audioinput'));
        setVideoInputs(devices.filter((d) => d.kind === 'videoinput'));
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };
    getDevices();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-card-lg bg-cream border border-forest/20 shadow-deep text-forest">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-forest/60 hover:text-forest transition-colors p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-forest" />
          <span className="editorial-label text-forest/70">Hardware &amp; Signals</span>
        </div>
        <h3 className="font-display text-3xl text-forest mb-6">DEVICE PREFERENCES</h3>

        <div className="space-y-6">
          {/* Audio Input Device */}
          <div>
            <label className="editorial-label text-xs block mb-2 text-forest/80 flex items-center space-x-2">
              <Mic className="w-4 h-4" />
              <span>Microphone</span>
            </label>
            <select className="w-full px-4 py-3 rounded-full bg-cream-light border border-forest/25 text-forest text-sm font-medium focus:outline-none focus:border-forest">
              {audioInputs.length > 0 ? (
                audioInputs.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))
              ) : (
                <option>Default System Microphone</option>
              )}
            </select>
          </div>

          {/* Video Input Device */}
          <div>
            <label className="editorial-label text-xs block mb-2 text-forest/80 flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Camera</span>
            </label>
            <select className="w-full px-4 py-3 rounded-full bg-cream-light border border-forest/25 text-forest text-sm font-medium focus:outline-none focus:border-forest">
              {videoInputs.length > 0 ? (
                videoInputs.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))
              ) : (
                <option>Default System Camera</option>
              )}
            </select>
          </div>

          {/* Audio Signal Processing Toggles */}
          <div className="pt-4 border-t border-forest/15 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-forest">
                  Acoustic Noise Suppression
                </div>
                <div className="text-[11px] text-forest/70">
                  Filters ambient keyboard typing and room echo
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

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-forest">
                  Echo Cancellation
                </div>
                <div className="text-[11px] text-forest/70">
                  Prevents speaker playback feedback loop
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
          </div>

          {/* Global Mesh & Cloud Signaling Status */}
          <div className="p-4 rounded-2xl bg-olive/30 border border-forest/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="editorial-label text-xs text-forest">Global Internet Mesh</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                Active Worldwide
              </span>
            </div>
            <p className="text-[11px] text-forest/80 leading-relaxed">
              ConnectSphere uses PeerJS Cloud and Google STUN to automatically connect clients and friends across foreign countries over the public internet, even from static GitHub Pages.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-forest/15">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-[0.2em] hover:bg-forest-light transition-colors shadow-sm"
          >
            Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
