import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export interface CaptionItem {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: string;
  isFinal: boolean;
  language: string;
}

export const SUPPORTED_CAPTION_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'es-ES', label: 'Spanish (Español)' },
  { code: 'fr-FR', label: 'French (Français)' },
  { code: 'de-DE', label: 'German (Deutsch)' },
  { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
  { code: 'ja-JP', label: 'Japanese (日本語)' },
  { code: 'zh-CN', label: 'Chinese (Mandarin)' }
];

export const useLiveCaptions = (
  meetingId: string,
  currentUserId: string,
  currentUserName: string,
  socket: Socket | null
) => {
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [activeCaption, setActiveCaption] = useState<CaptionItem | null>(null);
  const [transcriptHistory, setTranscriptHistory] = useState<CaptionItem[]>(() => {
    try {
      const saved = localStorage.getItem(`connectsphere_transcript_${meetingId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const recognitionRef = useRef<any>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const simIntervalRef = useRef<number | null>(null);

  // Save transcript history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`connectsphere_transcript_${meetingId}`, JSON.stringify(transcriptHistory));
    } catch (e) {}
  }, [transcriptHistory, meetingId]);

  // Handle incoming caption
  const receiveCaption = useCallback((caption: CaptionItem) => {
    setActiveCaption(caption);

    if (caption.isFinal && caption.text.trim()) {
      setTranscriptHistory((prev) => [...prev, caption]);
    }

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setActiveCaption(null);
    }, 4500);
  }, []);

  // Broadcast Channels & Socket Listeners
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_captions_${meetingId}`);
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        const { caption } = event.data;
        if (caption) receiveCaption(caption);
      };
    } catch (e) {}

    if (socket) {
      const handleRemoteCaption = (caption: CaptionItem) => {
        receiveCaption(caption);
      };
      socket.on('meeting:caption', handleRemoteCaption);

      return () => {
        socket.off('meeting:caption', handleRemoteCaption);
        if (bc) bc.close();
      };
    }

    return () => {
      if (bc) bc.close();
    };
  }, [socket, meetingId, receiveCaption]);

  // Broadcast local caption
  const broadcastCaption = useCallback((caption: CaptionItem) => {
    receiveCaption(caption);

    socket?.emit('meeting:caption', { meetingId, caption });
    broadcastChannelRef.current?.postMessage({ caption });
  }, [socket, meetingId, receiveCaption]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!captionsEnabled) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const textToShow = finalTranscript || interimTranscript;
          if (textToShow.trim()) {
            const item: CaptionItem = {
              id: 'cap-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              speakerId: currentUserId,
              speakerName: currentUserName,
              text: textToShow.trim(),
              timestamp: new Date().toISOString(),
              isFinal: Boolean(finalTranscript),
              language: selectedLanguage
            };
            broadcastCaption(item);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error/restriction:', err);
        };

        recognition.onend = () => {
          if (captionsEnabled) {
            try {
              recognition.start();
            } catch (e) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Could not start webkitSpeechRecognition:', err);
      }
    } else {
      // Graceful simulated speaker captions when Speech API is unsupported in browser
      const sampleDialogue = [
        "Welcome everyone to today's ConnectSphere sync.",
        "Let's review the architecture roadmap for Q4.",
        "The WebRTC global mesh is showing sub-30ms latency.",
        "I'll share my screen to walk through the system metrics.",
        "Does anyone have any questions regarding the new AI note taker?"
      ];
      let dialIdx = 0;

      simIntervalRef.current = window.setInterval(() => {
        const item: CaptionItem = {
          id: 'cap-sim-' + Date.now(),
          speakerId: 'studio-elena',
          speakerName: 'Elena Vance',
          text: sampleDialogue[dialIdx % sampleDialogue.length],
          timestamp: new Date().toISOString(),
          isFinal: true,
          language: selectedLanguage
        };
        dialIdx++;
        broadcastCaption(item);
      }, 7000);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [captionsEnabled, selectedLanguage, currentUserId, currentUserName, broadcastCaption]);

  const toggleCaptions = () => {
    setCaptionsEnabled((prev) => !prev);
  };

  const clearTranscript = () => {
    setTranscriptHistory([]);
    try {
      localStorage.removeItem(`connectsphere_transcript_${meetingId}`);
    } catch (e) {}
  };

  return {
    captionsEnabled,
    selectedLanguage,
    activeCaption,
    transcriptHistory,
    toggleCaptions,
    setSelectedLanguage,
    clearTranscript
  };
};
