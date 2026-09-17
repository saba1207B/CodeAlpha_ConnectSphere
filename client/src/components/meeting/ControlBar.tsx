import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, MonitorUp, 
  MessageSquare, Users, Palette, FolderUp, 
  Settings, PhoneOff, CircleDot, Smile, Sparkles,
  Camera, UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ControlBarProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  chatOpen: boolean;
  participantsOpen: boolean;
  whiteboardOpen: boolean;
  filesOpen: boolean;
  unreadChatCount?: number;
  isStudioCameraMode?: boolean;
  studioPeersEnabled?: boolean;
  localStream?: MediaStream | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleWhiteboard: () => void;
  onToggleFiles: () => void;
  onOpenSettings: () => void;
  onLeaveMeeting: () => void;
  onToggleCameraMode?: () => void;
  onToggleStudioPeers?: () => void;
  onSendReaction?: (emoji: string) => void;
}

const REACTIONS = ['👏', '❤️', '🎉', '🔥', '💡', '🙌'];

export const ControlBar: React.FC<ControlBarProps> = ({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  chatOpen,
  participantsOpen,
  whiteboardOpen,
  filesOpen,
  unreadChatCount = 0,
  isStudioCameraMode = false,
  studioPeersEnabled = true,
  localStream = null,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onToggleWhiteboard,
  onToggleFiles,
  onOpenSettings,
  onLeaveMeeting,
  onToggleCameraMode,
  onToggleStudioPeers,
  onSendReaction
}) => {
  const [reactionsMenuOpen, setReactionsMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
      setRecordSeconds(0);
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecording]);

  // Handle Start / Stop Meeting Recording
  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      recordedChunksRef.current = [];
      try {
        let streamToRecord = localStream;
        if (!streamToRecord) {
          alert('No active audio or video stream available to record.');
          return;
        }

        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(streamToRecord, options);
        } catch (e) {
          recorder = new MediaRecorder(streamToRecord);
        }

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `ConnectSphere-Meeting-${new Date().toISOString().substring(0, 19).replace(/:/g, '-')}.webm`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error('Recording initialization failed:', err);
        alert('Could not start recording: ' + (err as any).message);
      }
    }
  };

  // Trigger Reaction
  const handleTriggerReaction = (emoji: string) => {
    // Fire confetti for celebration/fire/hearts
    if (emoji === '🎉' || emoji === '🔥' || emoji === '❤️' || emoji === '👏') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#01472e', '#ccd5ae', '#e07a5f', '#e09f3e', '#fefae0']
      });
    }

    if (onSendReaction) {
      onSendReaction(emoji);
    }
    setReactionsMenuOpen(false);
  };

  const formatRecordTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <footer className="h-20 px-3 sm:px-6 border-t border-forest/15 bg-cream/95 backdrop-blur-xl flex items-center justify-between z-30 select-none relative">
      {/* Left section: Recording indicator & Camera Mode Switch */}
      <div className="hidden md:flex items-center space-x-3 w-56">
        {/* Meeting Recorder Button */}
        <button
          onClick={handleToggleRecording}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
            isRecording
              ? 'bg-rose-700 text-cream animate-pulse ring-2 ring-rose-500'
              : 'bg-forest/10 text-forest hover:bg-forest hover:text-cream'
          }`}
          title={isRecording ? 'Stop Recording and Save Video' : 'Record Meeting Session'}
        >
          <CircleDot className={`w-3.5 h-3.5 ${isRecording ? 'text-cream' : 'text-rose-600'}`} />
          <span>{isRecording ? `REC ${formatRecordTime(recordSeconds)}` : 'Record'}</span>
        </button>

        {/* Camera Source Switcher */}
        {onToggleCameraMode && (
          <button
            onClick={onToggleCameraMode}
            className={`p-2 rounded-full border transition-all text-xs flex items-center space-x-1 ${
              isStudioCameraMode
                ? 'bg-olive text-forest border-forest/30 font-bold'
                : 'bg-forest/5 text-forest/80 border-forest/10 hover:bg-forest/10'
            }`}
            title={isStudioCameraMode ? 'Using Virtual Studio Camera. Click for Hardware Webcam.' : 'Using Hardware Webcam. Click for Virtual Studio Camera.'}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden lg:inline">
              {isStudioCameraMode ? 'Studio Feed' : 'Webcam'}
            </span>
          </button>
        )}
      </div>

      {/* Center Interactive Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 mx-auto">
        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-300 shadow-sm ${
            isAudioMuted
              ? 'bg-[#7a1e1e] text-cream ring-2 ring-[#7a1e1e]/40'
              : 'bg-forest text-cream hover:bg-forest-light'
          }`}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isAudioMuted ? <MicOff className="w-4 sm:w-5 h-4 sm:h-5" /> : <Mic className="w-4 sm:w-5 h-4 sm:h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-300 shadow-sm ${
            isVideoOff
              ? 'bg-[#7a1e1e] text-cream ring-2 ring-[#7a1e1e]/40'
              : 'bg-forest text-cream hover:bg-forest-light'
          }`}
          title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
        >
          {isVideoOff ? <VideoOff className="w-4 sm:w-5 h-4 sm:h-5" /> : <Video className="w-4 sm:w-5 h-4 sm:h-5" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-300 shadow-sm ${
            isScreenSharing
              ? 'bg-olive text-forest font-bold ring-2 ring-forest'
              : 'bg-forest text-cream hover:bg-forest-light'
          }`}
          title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
        >
          <MonitorUp className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>

        <span className="h-6 w-px bg-forest/20 mx-0.5 sm:mx-1"></span>

        {/* Floating Reactions Trigger */}
        <div className="relative">
          <button
            onClick={() => setReactionsMenuOpen(!reactionsMenuOpen)}
            className={`p-3 sm:p-3.5 rounded-full transition-all duration-300 shadow-sm ${
              reactionsMenuOpen
                ? 'bg-sage text-forest ring-2 ring-forest'
                : 'bg-forest text-cream hover:bg-forest-light'
            }`}
            title="Send Reaction"
          >
            <Smile className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>

          {/* Reactions Popover */}
          {reactionsMenuOpen && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 p-2 rounded-full bg-forest text-cream shadow-floating border border-forest-light flex items-center space-x-1.5 z-50 animate-in fade-in slide-in-from-bottom-2">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleTriggerReaction(emoji)}
                  className="p-2 text-xl hover:scale-130 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Collaborative Whiteboard */}
        <button
          onClick={onToggleWhiteboard}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-300 shadow-sm ${
            whiteboardOpen
              ? 'bg-sage text-forest ring-2 ring-forest'
              : 'bg-forest text-cream hover:bg-forest-light'
          }`}
          title="Collaborative Whiteboard"
        >
          <Palette className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>

        {/* Chat Drawer Toggle */}
        <button
          onClick={onToggleChat}
          className={`relative p-3 sm:p-3.5 rounded-full transition-all duration-300 shadow-sm ${
            chatOpen
              ? 'bg-sage text-forest ring-2 ring-forest'
              : 'bg-forest text-cream hover:bg-forest-light'
          }`}
          title="Meeting Chat"
        >
          <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5" />
          {unreadChatCount > 0 && !chatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-cream text-[10px] font-bold flex items-center justify-center border-2 border-cream">
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* Shared Files Drawer Toggle */}
        <button
          onClick={onToggleFiles}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-300 shadow-sm ${
            filesOpen
              ? 'bg-sage text-forest ring-2 ring-forest'
              : 'bg-forest text-cream hover:bg-forest-light'
          }`}
          title="Shared Files"
        >
          <FolderUp className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>

        {/* Participants Drawer */}
        <button
          onClick={onToggleParticipants}
          className={`p-3 sm:p-3.5 rounded-full transition-all duration-300 shadow-sm ${
            participantsOpen
              ? 'bg-sage text-forest ring-2 ring-forest'
              : 'bg-forest text-cream hover:bg-forest-light'
          }`}
          title="Participants"
        >
          <Users className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>

        {/* Device Settings */}
        <button
          onClick={onOpenSettings}
          className="p-3 sm:p-3.5 rounded-full bg-forest text-cream hover:bg-forest-light transition-all shadow-sm"
          title="Audio & Video Settings"
        >
          <Settings className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>

        <span className="h-6 w-px bg-forest/20 mx-0.5 sm:mx-1"></span>

        {/* Leave Meeting Button */}
        <button
          onClick={onLeaveMeeting}
          className="flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-[#7a1e1e] hover:bg-[#8f2323] text-cream font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-sm"
          title="Leave Room"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Right section: Studio Team Toggle & Status */}
      <div className="hidden md:flex items-center justify-end space-x-3 w-56">
        {onToggleStudioPeers && (
          <button
            onClick={onToggleStudioPeers}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
              studioPeersEnabled
                ? 'bg-forest text-cream border-forest-light/40 shadow-sm'
                : 'bg-cream text-forest/60 border-forest/20 hover:text-forest'
            }`}
            title={studioPeersEnabled ? 'Studio Team active. Click to hide.' : 'Solo Mode. Click to invite Studio Team.'}
          >
            <UserCheck className="w-3.5 h-3.5 text-sage" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {studioPeersEnabled ? 'Studio Team (3)' : 'Solo'}
            </span>
          </button>
        )}

        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest/70">
            Live Mesh
          </span>
        </div>
      </div>
    </footer>
  );
};
