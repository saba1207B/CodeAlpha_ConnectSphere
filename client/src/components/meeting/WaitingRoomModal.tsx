import React from 'react';
import { ShieldAlert, UserCheck, UserX, Clock, Check } from 'lucide-react';

export interface WaitingParticipant {
  userId: string;
  userName: string;
  requestedAt: string;
}

interface WaitingRoomModalProps {
  isWaiting: boolean; // True if current user is in waiting room
  meetingTitle?: string;
  pendingParticipants: WaitingParticipant[]; // For host
  isHost: boolean;
  onAdmit: (userId: string) => void;
  onAdmitAll: () => void;
  onDeny: (userId: string) => void;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  isWaiting,
  meetingTitle = "ConnectSphere Meeting",
  pendingParticipants,
  isHost,
  onAdmit,
  onAdmitAll,
  onDeny
}) => {
  // 1. Attendee Waiting Screen
  if (isWaiting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121316] text-zinc-200 select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#1c1e24] border border-[#2e323e] text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Waiting for Host Approval
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Please wait, the meeting host will let you in soon. This meeting has Waiting Room security enabled.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#232630] border border-[#303442] text-xs text-zinc-400">
            Room: <span className="font-semibold text-white">{meetingTitle}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Host Floating Admission Banner
  if (isHost && pendingParticipants.length > 0) {
    return (
      <div className="fixed top-20 right-6 z-50 w-80 p-4 rounded-2xl bg-[#1e2026] border border-blue-500/40 text-white shadow-2xl animate-in slide-in-from-top-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Waiting Room ({pendingParticipants.length})
            </span>
          </div>
          <button
            onClick={onAdmitAll}
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
          >
            Admit All
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {pendingParticipants.map((p) => (
            <div
              key={p.userId}
              className="flex items-center justify-between p-2 rounded-lg bg-[#272a34] border border-[#373b49]"
            >
              <div className="truncate mr-2">
                <div className="text-xs font-medium text-white truncate">{p.userName}</div>
                <div className="text-[10px] text-zinc-400">Waiting to join</div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={() => onAdmit(p.userId)}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  title="Admit"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeny(p.userId)}
                  className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  title="Deny"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
