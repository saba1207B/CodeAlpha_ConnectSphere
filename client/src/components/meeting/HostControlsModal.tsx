import React from 'react';
import { X, ShieldCheck, Lock, Users, MessageSquare, MonitorUp, Mic, Video, Edit3, AlertTriangle } from 'lucide-react';

export interface MeetingSecuritySettings {
  isLocked: boolean;
  waitingRoomEnabled: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  allowUnmute: boolean;
  allowVideo: boolean;
  allowRename: boolean;
}

interface HostControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MeetingSecuritySettings;
  onUpdateSettings: (newSettings: Partial<MeetingSecuritySettings>) => void;
  onEndMeetingForAll: () => void;
}

export const HostControlsModal: React.FC<HostControlsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onEndMeetingForAll
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof MeetingSecuritySettings) => {
    onUpdateSettings({ [key]: !settings[key] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-[#1e2026] border border-[#313644] text-zinc-200 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-lg text-white">Host Security &amp; Permissions</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-6">
          Manage meeting access restrictions and controls for all attendees in this room.
        </p>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Room Access */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Meeting Access
            </h4>

            {/* Lock Meeting */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#272a34] border border-[#373b49]">
              <div className="flex items-center space-x-3">
                <Lock className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Lock Meeting</div>
                  <div className="text-[10px] text-zinc-400">No new participants can join when locked</div>
                </div>
              </div>
              <button
                onClick={() => toggle('isLocked')}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.isLocked ? 'bg-amber-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.isLocked ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Waiting Room */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#272a34] border border-[#373b49]">
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Enable Waiting Room</div>
                  <div className="text-[10px] text-zinc-400">Host must admit each person before they enter</div>
                </div>
              </div>
              <button
                onClick={() => toggle('waitingRoomEnabled')}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.waitingRoomEnabled ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.waitingRoomEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Participant Permissions */}
          <div className="space-y-3 pt-3 border-t border-[#313644]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Allow Participants To
            </h4>

            {/* Screen Share */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#272a34]">
              <div className="flex items-center space-x-2.5">
                <MonitorUp className="w-4 h-4 text-zinc-300" />
                <span className="text-xs text-zinc-200">Share their screen</span>
              </div>
              <button
                onClick={() => toggle('allowScreenShare')}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.allowScreenShare ? 'bg-emerald-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                    settings.allowScreenShare ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* In-Meeting Chat */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#272a34]">
              <div className="flex items-center space-x-2.5">
                <MessageSquare className="w-4 h-4 text-zinc-300" />
                <span className="text-xs text-zinc-200">Send chat messages</span>
              </div>
              <button
                onClick={() => toggle('allowChat')}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.allowChat ? 'bg-emerald-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                    settings.allowChat ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Unmute themselves */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#272a34]">
              <div className="flex items-center space-x-2.5">
                <Mic className="w-4 h-4 text-zinc-300" />
                <span className="text-xs text-zinc-200">Unmute themselves</span>
              </div>
              <button
                onClick={() => toggle('allowUnmute')}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.allowUnmute ? 'bg-emerald-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                    settings.allowUnmute ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Start Video */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#272a34]">
              <div className="flex items-center space-x-2.5">
                <Video className="w-4 h-4 text-zinc-300" />
                <span className="text-xs text-zinc-200">Start their video camera</span>
              </div>
              <button
                onClick={() => toggle('allowVideo')}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.allowVideo ? 'bg-emerald-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                    settings.allowVideo ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Rename themselves */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#272a34]">
              <div className="flex items-center space-x-2.5">
                <Edit3 className="w-4 h-4 text-zinc-300" />
                <span className="text-xs text-zinc-200">Rename display name</span>
              </div>
              <button
                onClick={() => toggle('allowRename')}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.allowRename ? 'bg-emerald-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                    settings.allowRename ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* End Meeting for All */}
        <div className="mt-6 pt-4 border-t border-[#313644] flex items-center justify-between">
          <button
            onClick={onEndMeetingForAll}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-rose-400 text-xs font-semibold transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>End Meeting for All</span>
          </button>

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
