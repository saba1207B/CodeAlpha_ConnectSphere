import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, MonitorUp, 
  MessageSquare, Users, Palette, FolderUp, 
  Settings, PhoneOff, CircleDot, Smile, ShieldCheck,
  Camera, Check, Hand, Subtitles, Sparkles, BarChart2, 
  HelpCircle, FileEdit, Presentation, Grid
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
  isHandRaised?: boolean;
  captionsEnabled?: boolean;
  aiAssistantOpen?: boolean;
  pollsOpen?: boolean;
  qnaOpen?: boolean;
  notesOpen?: boolean;
  slidesOpen?: boolean;
  participantCount?: number;
  unreadChatCount?: number;
  isStudioCameraMode?: boolean;
  localStream?: MediaStream | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleWhiteboard: () => void;
  onToggleFiles: () => void;
  onToggleHandRaise?: () => void;
  onToggleCaptions?: () => void;
  onToggleAIAssistant?: () => void;
  onTogglePolls?: () => void;
  onToggleQnA?: () => void;
  onToggleNotes?: () => void;
  onToggleSlides?: () => void;
  onOpenHostControls?: () => void;
  onOpenSettings: () => void;
  onLeaveMeeting: () => void;
  onToggleCameraMode?: () => void;
  onSendReaction?: (emoji: string) => void;
}

const ZOOM_REACTIONS = ['👍', '👏', '❤️', '😂', '😮', '🎉', '🔥', '🚀'];

export const ControlBar: React.FC<ControlBarProps> = ({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  chatOpen,
  participantsOpen,
  whiteboardOpen,
  filesOpen,
  isHandRaised = false,
  captionsEnabled = false,
  aiAssistantOpen = false,
  pollsOpen = false,
  qnaOpen = false,
  notesOpen = false,
  slidesOpen = false,
  participantCount = 1,
  unreadChatCount = 0,
  isStudioCameraMode = false,
  localStream = null,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onToggleWhiteboard,
  onToggleFiles,
  onToggleHandRaise,
  onToggleCaptions,
  onToggleAIAssistant,
  onTogglePolls,
  onToggleQnA,
  onToggleNotes,
  onToggleSlides,
  onOpenHostControls,
  onOpenSettings,
  onLeaveMeeting,
  onToggleCameraMode,
  onSendReaction
}) => {
  const [reactionsMenuOpen, setReactionsMenuOpen] = useState(false);
  const [activitiesMenuOpen, setActivitiesMenuOpen] = useState(false);
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

  const handleToggleRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      recordedChunksRef.current = [];
      try {
        const streamToRecord = localStream;
        if (!streamToRecord) {
          alert('No active audio or video stream available to record.');
          return;
        }

        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(streamToRecord, { mimeType: 'video/webm;codecs=vp9,opus' });
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
          a.download = `ConnectSphere-Recording-${new Date().toISOString().substring(0, 19).replace(/:/g, '-')}.webm`;
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
        console.error('Recording failed:', err);
        alert('Could not start recording: ' + (err as any).message);
      }
    }
  };

  const handleTriggerReaction = (emoji: string) => {
    if (emoji === '🎉' || emoji === '❤️' || emoji === '👏' || emoji === '🔥' || emoji === '🚀') {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.85 },
        colors: ['#00C853', '#0E72ED', '#FFD600', '#FF3B30', '#A855F7']
      });
    }

    if (onSendReaction) {
      onSendReaction(emoji);
    }
    setReactionsMenuOpen(false);
  };

  const formatRecordTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <footer className="h-18 sm:h-20 px-3 sm:px-6 bg-[#181a20] border-t border-[#262933] flex items-center justify-between z-30 select-none relative text-zinc-300">
      {/* Left Section: Audio & Video Controls */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Mute / Unmute Button */}
        <button
          onClick={onToggleAudio}
          className={`flex flex-col items-center justify-center w-13 sm:w-16 h-14 rounded-lg transition-colors ${
            isAudioMuted
              ? 'hover:bg-rose-950/40 text-rose-500'
              : 'hover:bg-[#262a35] text-zinc-200'
          }`}
          title={isAudioMuted ? 'Unmute (Alt+A or Space)' : 'Mute (Alt+A)'}
        >
          {isAudioMuted ? (
            <MicOff className="w-5 h-5 text-rose-500" />
          ) : (
            <Mic className="w-5 h-5 text-zinc-100" />
          )}
          <span className="text-[10px] mt-1 font-medium tracking-tight">
            {isAudioMuted ? 'Unmute' : 'Mute'}
          </span>
        </button>

        {/* Start / Stop Video Button */}
        <button
          onClick={onToggleVideo}
          className={`flex flex-col items-center justify-center w-13 sm:w-16 h-14 rounded-lg transition-colors ${
            isVideoOff
              ? 'hover:bg-rose-950/40 text-rose-500'
              : 'hover:bg-[#262a35] text-zinc-200'
          }`}
          title={isVideoOff ? 'Start Video (Alt+V)' : 'Stop Video (Alt+V)'}
        >
          {isVideoOff ? (
            <VideoOff className="w-5 h-5 text-rose-500" />
          ) : (
            <Video className="w-5 h-5 text-zinc-100" />
          )}
          <span className="text-[10px] mt-1 font-medium tracking-tight">
            {isVideoOff ? 'Start Video' : 'Stop Video'}
          </span>
        </button>

        {/* Virtual Studio Camera Switcher */}
        {onToggleCameraMode && (
          <button
            onClick={onToggleCameraMode}
            className={`hidden md:flex flex-col items-center justify-center w-12 h-14 rounded-lg hover:bg-[#262a35] transition-colors text-[10px] ${
              isStudioCameraMode ? 'text-blue-400' : 'text-zinc-400'
            }`}
            title="Switch between Webcam and Studio Avatar mode"
          >
            <Camera className="w-4 h-4" />
            <span className="text-[9px] mt-1">Source</span>
          </button>
        )}
      </div>

      {/* Center Section: Core Action Dock */}
      <div className="flex items-center space-x-0.5 sm:space-x-1">
        {/* Security / Host Controls */}
        <button
          onClick={onOpenHostControls}
          className="flex flex-col items-center justify-center w-12 sm:w-15 h-14 rounded-lg transition-colors hover:bg-[#262a35] text-zinc-300"
          title="Security and Host Management Controls"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] mt-1 font-medium">Security</span>
        </button>

        {/* Participants */}
        <button
          onClick={onToggleParticipants}
          className={`flex flex-col items-center justify-center w-13 sm:w-16 h-14 rounded-lg transition-colors relative hover:bg-[#262a35] ${
            participantsOpen ? 'text-blue-400 bg-[#262a35]' : 'text-zinc-300'
          }`}
          title="Participants list"
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 text-[9px] font-bold px-1 rounded-full bg-blue-600 text-white min-w-[14px] text-center">
              {participantCount}
            </span>
          </div>
          <span className="text-[10px] mt-1 font-medium">Participants</span>
        </button>

        {/* Chat */}
        <button
          onClick={onToggleChat}
          className={`flex flex-col items-center justify-center w-12 sm:w-15 h-14 rounded-lg transition-colors relative hover:bg-[#262a35] ${
            chatOpen ? 'text-blue-400 bg-[#262a35]' : 'text-zinc-300'
          }`}
          title="In-meeting Chat"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && !chatOpen && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Chat</span>
        </button>

        {/* ICONIC GREEN SHARE SCREEN BUTTON */}
        <button
          onClick={onToggleScreenShare}
          className={`flex flex-col items-center justify-center px-3 sm:px-4 h-14 rounded-lg font-medium transition-all shadow-md mx-1 ${
            isScreenSharing
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen (Alt+S)'}
        >
          <MonitorUp className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-semibold whitespace-nowrap">
            {isScreenSharing ? 'Stop Share' : 'Share Screen'}
          </span>
        </button>

        {/* Raise Hand Button */}
        {onToggleHandRaise && (
          <button
            onClick={onToggleHandRaise}
            className={`flex flex-col items-center justify-center w-12 sm:w-15 h-14 rounded-lg transition-colors hover:bg-[#262a35] ${
              isHandRaised ? 'text-amber-400 bg-amber-950/30 font-bold' : 'text-zinc-300'
            }`}
            title="Raise or Lower Hand (Alt+H)"
          >
            <Hand className={`w-5 h-5 ${isHandRaised ? 'text-amber-400 animate-bounce' : 'text-zinc-300'}`} />
            <span className="text-[10px] mt-1 font-medium">
              {isHandRaised ? 'Lower' : 'Raise'}
            </span>
          </button>
        )}

        {/* Live Captions (CC) Button */}
        {onToggleCaptions && (
          <button
            onClick={onToggleCaptions}
            className={`hidden sm:flex flex-col items-center justify-center w-12 sm:w-14 h-14 rounded-lg transition-colors hover:bg-[#262a35] ${
              captionsEnabled ? 'text-blue-400 bg-blue-950/30' : 'text-zinc-300'
            }`}
            title="Toggle Live Subtitles / Captions (Alt+C)"
          >
            <Subtitles className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Captions</span>
          </button>
        )}

        {/* Gemini AI Meeting Assistant Button */}
        {onToggleAIAssistant && (
          <button
            onClick={onToggleAIAssistant}
            className={`flex flex-col items-center justify-center w-13 sm:w-16 h-14 rounded-lg transition-colors hover:bg-[#262a35] relative ${
              aiAssistantOpen ? 'text-purple-400 bg-purple-950/30' : 'text-zinc-300'
            }`}
            title="Gemini AI Meeting Notes &amp; Assistant"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <span className="text-[10px] mt-1 font-semibold text-purple-300">Gemini AI</span>
          </button>
        )}

        {/* Collaboration / Activities Menu */}
        <div className="relative">
          <button
            onClick={() => setActivitiesMenuOpen(!activitiesMenuOpen)}
            className={`flex flex-col items-center justify-center w-13 sm:w-15 h-14 rounded-lg transition-colors hover:bg-[#262a35] ${
              activitiesMenuOpen || whiteboardOpen || pollsOpen || qnaOpen || notesOpen || slidesOpen || filesOpen
                ? 'text-blue-400 bg-[#262a35]'
                : 'text-zinc-300'
            }`}
            title="Collaboration Hub (Whiteboard, Polls, Q&amp;A, Notes, Slides)"
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Activities</span>
          </button>

          {activitiesMenuOpen && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-56 p-2 rounded-2xl bg-[#1e2026] border border-[#313644] text-zinc-200 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-[#313644] mb-1">
                Collaboration Tools
              </div>

              <button
                onClick={() => {
                  onToggleWhiteboard();
                  setActivitiesMenuOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-white/5 flex items-center space-x-2.5 text-xs text-left"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Collaborative Whiteboard</span>
              </button>

              {onTogglePolls && (
                <button
                  onClick={() => {
                    onTogglePolls();
                    setActivitiesMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-white/5 flex items-center space-x-2.5 text-xs text-left"
                >
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  <span>Live Polls</span>
                </button>
              )}

              {onToggleQnA && (
                <button
                  onClick={() => {
                    onToggleQnA();
                    setActivitiesMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-white/5 flex items-center space-x-2.5 text-xs text-left"
                >
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Audience Q&amp;A</span>
                </button>
              )}

              {onToggleNotes && (
                <button
                  onClick={() => {
                    onToggleNotes();
                    setActivitiesMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-white/5 flex items-center space-x-2.5 text-xs text-left"
                >
                  <FileEdit className="w-4 h-4 text-emerald-400" />
                  <span>Collaborative Notes</span>
                </button>
              )}

              {onToggleSlides && (
                <button
                  onClick={() => {
                    onToggleSlides();
                    setActivitiesMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-white/5 flex items-center space-x-2.5 text-xs text-left"
                >
                  <Presentation className="w-4 h-4 text-rose-400" />
                  <span>Slide Deck Presenter</span>
                </button>
              )}

              <button
                onClick={() => {
                  onToggleFiles();
                  setActivitiesMenuOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-lg hover:bg-white/5 flex items-center space-x-2.5 text-xs text-left"
              >
                <FolderUp className="w-4 h-4 text-cyan-400" />
                <span>Shared Files</span>
              </button>
            </div>
          )}
        </div>

        {/* Record Button */}
        <button
          onClick={handleToggleRecording}
          className={`hidden md:flex flex-col items-center justify-center w-13 sm:w-15 h-14 rounded-lg transition-colors hover:bg-[#262a35] ${
            isRecording ? 'text-rose-500 bg-rose-950/30' : 'text-zinc-300'
          }`}
          title={isRecording ? 'Stop Recording' : 'Record Session'}
        >
          <CircleDot className={`w-5 h-5 ${isRecording ? 'text-rose-500 animate-pulse' : 'text-zinc-300'}`} />
          <span className="text-[10px] mt-1 font-medium">
            {isRecording ? formatRecordTime(recordSeconds) : 'Record'}
          </span>
        </button>

        {/* Reactions */}
        <div className="relative">
          <button
            onClick={() => setReactionsMenuOpen(!reactionsMenuOpen)}
            className={`flex flex-col items-center justify-center w-12 sm:w-15 h-14 rounded-lg transition-colors hover:bg-[#262a35] ${
              reactionsMenuOpen ? 'text-amber-400 bg-[#262a35]' : 'text-zinc-300'
            }`}
            title="Emoji Reactions"
          >
            <Smile className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Reactions</span>
          </button>

          {reactionsMenuOpen && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-[#20232b] border border-[#313644] text-white shadow-2xl flex items-center space-x-1 z-50 animate-in fade-in slide-in-from-bottom-2">
              {ZOOM_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleTriggerReaction(emoji)}
                  className="p-2 text-2xl hover:scale-125 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Settings & End Meeting Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-lg hover:bg-[#262a35] text-zinc-400 hover:text-white transition-colors"
          title="Hardware &amp; Video Effects Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* End/Leave Button */}
        <button
          onClick={onLeaveMeeting}
          className="flex items-center space-x-1 px-3.5 sm:px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm"
          title="Leave or End Meeting"
        >
          <PhoneOff className="w-3.5 h-3.5 sm:hidden" />
          <span className="hidden sm:inline">End Meeting</span>
          <span className="sm:hidden">End</span>
        </button>
      </div>
    </footer>
  );
};
