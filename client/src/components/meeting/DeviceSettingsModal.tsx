import React, { useState, useEffect } from 'react';
import { 
  X, Mic, Video, Volume2, ShieldCheck, Check, 
  Sparkles, Sliders, Image, Wifi, Sun 
} from 'lucide-react';
import { VisualFilter, VirtualBackground, videoEffectsProcessor } from '../../services/videoEffects';

export type VideoQualityLevel = '1080p' | '720p' | '480p' | '360p' | 'audio-only';

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuality?: VideoQualityLevel;
  onQualityChange?: (quality: VideoQualityLevel) => void;
  onDeviceChange?: (kind: 'audioinput' | 'videoinput' | 'audiooutput', deviceId: string) => void;
  onApplyEffects?: (filter: VisualFilter, background: VirtualBackground) => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({ 
  isOpen, 
  onClose,
  currentQuality = '720p',
  onQualityChange,
  onDeviceChange,
  onApplyEffects
}) => {
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);

  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('');

  const [selectedQuality, setSelectedQuality] = useState<VideoQualityLevel>(currentQuality);
  const [selectedFilter, setSelectedFilter] = useState<VisualFilter>('none');
  const [selectedBackground, setSelectedBackground] = useState<VirtualBackground>('none');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoLighting, setAutoLighting] = useState(true);

  const [activeTab, setActiveTab] = useState<'devices' | 'video_effects' | 'bandwidth'>('devices');

  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const aIns = devices.filter((d) => d.kind === 'audioinput');
        const vIns = devices.filter((d) => d.kind === 'videoinput');
        const aOuts = devices.filter((d) => d.kind === 'audiooutput');

        setAudioInputs(aIns);
        setVideoInputs(vIns);
        setAudioOutputs(aOuts);

        if (aIns.length > 0 && !selectedAudioInput) setSelectedAudioInput(aIns[0].deviceId);
        if (vIns.length > 0 && !selectedVideoInput) setSelectedVideoInput(vIns[0].deviceId);
        if (aOuts.length > 0 && !selectedAudioOutput) setSelectedAudioOutput(aOuts[0].deviceId);
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };
    getDevices();

    const currentEffects = videoEffectsProcessor.getSettings();
    setSelectedFilter(currentEffects.filter);
    setSelectedBackground(currentEffects.background);
  }, [isOpen]);

  const handleApply = () => {
    if (onQualityChange && selectedQuality !== currentQuality) {
      onQualityChange(selectedQuality);
    }

    videoEffectsProcessor.setSettings({
      filter: autoLighting && selectedFilter === 'none' ? 'lighting_boost' : selectedFilter,
      background: selectedBackground
    });

    if (onApplyEffects) {
      onApplyEffects(selectedFilter, selectedBackground);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#1e2026] border border-[#313644] text-zinc-200 shadow-2xl flex flex-col overflow-hidden max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#313644] flex items-center justify-between bg-[#191a20]">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-lg text-white">Audio &amp; Video Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 pt-3 border-b border-[#313644] space-x-3 text-xs bg-[#191a20]">
          <button
            onClick={() => setActiveTab('devices')}
            className={`pb-2.5 border-b-2 font-medium flex items-center space-x-1.5 transition-colors ${
              activeTab === 'devices' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Hardware Devices</span>
          </button>
          <button
            onClick={() => setActiveTab('video_effects')}
            className={`pb-2.5 border-b-2 font-medium flex items-center space-x-1.5 transition-colors ${
              activeTab === 'video_effects' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Virtual Backgrounds &amp; Filters</span>
          </button>
          <button
            onClick={() => setActiveTab('bandwidth')}
            className={`pb-2.5 border-b-2 font-medium flex items-center space-x-1.5 transition-colors ${
              activeTab === 'bandwidth' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>HD Quality &amp; Bandwidth</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: HARDWARE DEVICES */}
          {activeTab === 'devices' && (
            <div className="space-y-5">
              {/* Microphone */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-2 flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>Microphone (Audio Input)</span>
                </label>
                <select
                  value={selectedAudioInput}
                  onChange={(e) => {
                    setSelectedAudioInput(e.target.value);
                    onDeviceChange?.('audioinput', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#272a34] border border-[#373b49] text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                >
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

              {/* Camera */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-2 flex items-center space-x-2">
                  <Video className="w-4 h-4 text-blue-400" />
                  <span>Camera (Video Input)</span>
                </label>
                <select
                  value={selectedVideoInput}
                  onChange={(e) => {
                    setSelectedVideoInput(e.target.value);
                    onDeviceChange?.('videoinput', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#272a34] border border-[#373b49] text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                >
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

              {/* Speakers */}
              {audioOutputs.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-2 flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    <span>Speaker (Audio Output)</span>
                  </label>
                  <select
                    value={selectedAudioOutput}
                    onChange={(e) => {
                      setSelectedAudioOutput(e.target.value);
                      onDeviceChange?.('audiooutput', e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#272a34] border border-[#373b49] text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    {audioOutputs.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Speaker ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Signal Processing Toggles */}
              <div className="pt-4 border-t border-[#313644] space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#272a34] border border-[#373b49]">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Acoustic Noise Suppression
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Filters background room noise, typing, and HVAC hum
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoiseSuppression(!noiseSuppression)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      noiseSuppression ? 'bg-emerald-600' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        noiseSuppression ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#272a34] border border-[#373b49]">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Echo Cancellation
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Prevents acoustic audio feedback loops during conference
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEchoCancellation(!echoCancellation)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      echoCancellation ? 'bg-emerald-600' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        echoCancellation ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIRTUAL BACKGROUNDS & FILTERS */}
          {activeTab === 'video_effects' && (
            <div className="space-y-6">
              {/* Virtual Backgrounds */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-3">
                  Virtual Backgrounds
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'none', label: 'None (Off)' },
                    { id: 'blur', label: 'Background Blur' },
                    { id: 'office', label: 'Modern Office' },
                    { id: 'library', label: 'Cozy Library' },
                    { id: 'skyline', label: 'City Skyline' },
                    { id: 'neon', label: 'Cyberpunk Neon' }
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBackground(bg.id as VirtualBackground)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedBackground === bg.id
                          ? 'border-blue-500 bg-blue-600/20 text-white ring-1 ring-blue-500'
                          : 'border-[#373b49] bg-[#272a34] hover:border-[#4d5366] text-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-medium">{bg.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Filters */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-3">
                  Color Grading &amp; Lighting Filters
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'none', label: 'Natural' },
                    { id: 'lighting_boost', label: 'Lighting Boost' },
                    { id: 'warm', label: 'Studio Warm' },
                    { id: 'cool', label: 'Crisp Cool' },
                    { id: 'glow', label: 'Studio Glow' },
                    { id: 'noir', label: 'Noir Black & White' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f.id as VisualFilter)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedFilter === f.id
                          ? 'border-blue-500 bg-blue-600/20 text-white ring-1 ring-blue-500'
                          : 'border-[#373b49] bg-[#272a34] hover:border-[#4d5366] text-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-medium">{f.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Lighting Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#272a34] border border-[#373b49]">
                <div className="flex items-center space-x-2.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Automatic Low-Light Enhancement
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Digitally optimizes exposure and contrast for dim rooms
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoLighting(!autoLighting)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    autoLighting ? 'bg-amber-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      autoLighting ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BANDWIDTH & QUALITY */}
          {activeTab === 'bandwidth' && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-zinc-300 block mb-2">
                Video Resolution &amp; Bandwidth Mode
              </label>

              <div className="space-y-2.5">
                {[
                  {
                    id: '1080p',
                    title: '1080p Full HD (High Quality)',
                    desc: 'Crisp 60fps video for high-speed fiber internet and presentations',
                    badge: 'RECOMMENDED'
                  },
                  {
                    id: '720p',
                    title: '720p HD (Balanced)',
                    desc: 'Standard HD streaming with balanced CPU and bandwidth usage',
                    badge: 'DEFAULT'
                  },
                  {
                    id: '480p',
                    title: '480p SD (Standard)',
                    desc: 'Optimized for average cellular connections and laptop battery life',
                    badge: 'DATA EFFICIENT'
                  },
                  {
                    id: '360p',
                    title: '360p Low Bandwidth',
                    desc: 'Minimal network usage for low connectivity environments',
                    badge: 'LOW BANDWIDTH'
                  },
                  {
                    id: 'audio-only',
                    title: 'Audio-Only Mode (Data Saver)',
                    desc: 'Disables all outgoing and incoming video streams to save data and battery',
                    badge: 'AUDIO ONLY'
                  }
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuality(q.id as VideoQualityLevel)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between ${
                      selectedQuality === q.id
                        ? 'border-blue-500 bg-blue-600/20 text-white ring-1 ring-blue-500'
                        : 'border-[#373b49] bg-[#272a34] hover:border-[#4d5366] text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center space-x-2">
                        <span>{q.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-bold">
                          {q.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">{q.desc}</div>
                    </div>
                    {selectedQuality === q.id && (
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#313644] bg-[#191a20] flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
          >
            Save &amp; Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
