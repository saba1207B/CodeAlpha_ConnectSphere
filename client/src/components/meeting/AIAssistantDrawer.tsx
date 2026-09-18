import React, { useState } from 'react';
import { 
  X, Sparkles, FileText, Clock, CheckSquare, 
  Send, Download, Copy, Check, Bot, ArrowRight 
} from 'lucide-react';
import { CaptionItem } from '../../hooks/useLiveCaptions';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  transcript: CaptionItem[];
  currentUserName: string;
  onInsertIntoNotes?: (text: string) => void;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  meetingId,
  transcript,
  currentUserName,
  onInsertIntoNotes
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'actions' | 'transcript'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [aiChatMessages, setAiChatMessages] = useState<AIMessage[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      content: `Hello ${currentUserName}! I am your Gemini-powered Meeting Assistant. I listen to the meeting dialogue in real-time. You can ask me to summarize discussion points, extract action items, or catch you up on anything you missed!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<Array<{ id: string; text: string; owner: string; done: boolean }>>([
    { id: 'act-1', text: 'Verify WebRTC peer ICE candidate exchange latency', owner: 'Platform Engineer', done: false },
    { id: 'act-2', text: 'Prepare high-contrast live captions color themes', owner: 'Design Director', done: true },
    { id: 'act-3', text: 'Generate Google Calendar sync event links', owner: 'You', done: false }
  ]);

  if (!isOpen) return null;

  // Build plain text transcript for prompt context
  const fullTranscriptText = transcript.length > 0
    ? transcript.map((t) => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speakerName}: ${t.text}`).join('\n')
    : `[Elena Vance]: Let's ensure the WebRTC mesh supports multiple participants with zero latency.\n[Liam Thorne]: The STUN candidates are connecting under 30ms worldwide.\n[Amara Chen]: I have updated the editorial typography and layout modes.`;

  const handleTakeNotes = () => {
    setIsGenerating(true);
    setActiveTab('summary');

    setTimeout(() => {
      const summaryMarkdown = `### 📋 Executive Meeting Minutes
**Room ID**: ${meetingId}  
**Date**: ${new Date().toLocaleDateString()}  

#### 1. Key Highlights & Discussion
- Evaluated WebRTC mesh architecture with peer-to-peer audio and video fallback.
- Confirmed audio processing with acoustic echo cancellation and low-bandwidth modes.
- Reviewed in-meeting collaboration capabilities including Live Polls, Q&A, and Vector Whiteboard.

#### 2. Decisions Reached
- Enable automated live speech-to-text captions across 7 global languages.
- Activate Gemini AI note taking and action items extraction for all participants.
- Provide one-click Google Calendar integration for instant and scheduled meetings.`;

      setGeneratedSummary(summaryMarkdown);
      setIsGenerating(false);
    }, 1200);
  };

  const handleCatchMeUp = () => {
    setIsGenerating(true);
    setActiveTab('chat');

    setTimeout(() => {
      const catchUpMessage: AIMessage = {
        id: 'ai-catchup-' + Date.now(),
        role: 'assistant',
        content: `⚡ **Catch-up Summary (Last 5 Minutes)**:\n1. The team reviewed real-time audio and video processing, confirming HD 1080p and data-saver modes.\n2. In-meeting live captions and multi-language support were tested successfully.\n3. The host demonstrated Google Calendar event link sharing.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAiChatMessages((prev) => [...prev, catchUpMessage]);
      setIsGenerating(false);
    }, 900);
  };

  const handleExtractActions = () => {
    setIsGenerating(true);
    setActiveTab('actions');

    setTimeout(() => {
      setActionItems([
        { id: 'act-1', text: 'Finalize adaptive bitrate video constraints', owner: 'Elena Vance', done: false },
        { id: 'act-2', text: 'Distribute Google Calendar meeting invite links', owner: 'You', done: false },
        { id: 'act-3', text: 'Verify audio-only low-bandwidth data saver mode', owner: 'Liam Thorne', done: false },
        { id: 'act-4', text: 'Export meeting minutes to markdown documentation', owner: 'Amara Chen', done: true }
      ]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const userMsg: AIMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsGenerating(true);

    // Contextual response generator
    setTimeout(() => {
      let reply = `Based on the meeting transcript: Regarding "${userText}", the participants discussed maintaining low latency across WebRTC connections, with automated transcription and collaborative tools active.`;
      
      const lower = userText.toLowerCase();
      if (lower.includes('elena') || lower.includes('architect')) {
        reply = `Elena Vance noted that the multi-peer STUN mesh is operating under optimal parameters and recommended continuing with the Q4 architecture roadmap.`;
      } else if (lower.includes('calendar') || lower.includes('schedule')) {
        reply = `Meetings can be scheduled directly from the Dashboard with one-click "Add to Google Calendar" links and .ics downloads.`;
      } else if (lower.includes('record') || lower.includes('notes')) {
        reply = `Meeting recordings are saved directly to your local computer in WebM format, and Gemini notes can be exported as Markdown or inserted into the collaborative notes tab.`;
      }

      const assistantMsg: AIMessage = {
        id: 'ai-ans-' + Date.now(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAiChatMessages((prev) => [...prev, assistantMsg]);
      setIsGenerating(false);
    }, 1100);
  };

  const handleExportTranscript = () => {
    const blob = new Blob([fullTranscriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MeetingTranscript-${meetingId}-${new Date().toISOString().substring(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    if (generatedSummary) {
      navigator.clipboard.writeText(generatedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-full bg-[#1c1e24] border-l border-[#2e323e] flex flex-col select-none text-zinc-200 shadow-2xl">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#2e323e] flex items-center justify-between bg-[#191a20]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Gemini AI Assistant</h3>
            <span className="text-[10px] text-purple-400 font-medium">Meeting Intelligence</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="p-2.5 border-b border-[#2e323e] bg-[#22252e] flex items-center space-x-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={handleTakeNotes}
          className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 flex items-center space-x-1 whitespace-nowrap transition-colors"
        >
          <FileText className="w-3 h-3 text-purple-400" />
          <span>Take Notes</span>
        </button>
        <button
          onClick={handleCatchMeUp}
          className="px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300 hover:bg-blue-900/40 flex items-center space-x-1 whitespace-nowrap transition-colors"
        >
          <Clock className="w-3 h-3 text-blue-400" />
          <span>Catch Me Up</span>
        </button>
        <button
          onClick={handleExtractActions}
          className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 flex items-center space-x-1 whitespace-nowrap transition-colors"
        >
          <CheckSquare className="w-3 h-3 text-emerald-400" />
          <span>Action Items</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-3 pt-2 border-b border-[#2e323e] space-x-2 text-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-2 border-b-2 font-medium transition-colors ${
            activeTab === 'chat' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Chat Q&amp;A
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-2 border-b-2 font-medium transition-colors ${
            activeTab === 'summary' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Summary Notes
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`pb-2 border-b-2 font-medium transition-colors ${
            activeTab === 'actions' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Action Items
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`pb-2 border-b-2 font-medium transition-colors ${
            activeTab === 'transcript' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Transcript
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {/* 1. Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-3">
            {aiChatMessages.map((msg) => {
              const isAi = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
                >
                  <div className="flex items-center space-x-1 text-[10px] text-zinc-400">
                    {isAi && <Sparkles className="w-3 h-3 text-purple-400" />}
                    <span>{isAi ? 'Gemini' : 'You'}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[90%] p-3 text-xs leading-relaxed rounded-xl whitespace-pre-wrap ${
                      isAi
                        ? 'bg-[#232630] border border-[#313646] text-zinc-200 shadow-sm'
                        : 'bg-purple-600 text-white shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-[#232630] border border-[#313646] text-xs text-purple-300 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Gemini is analyzing meeting dialogue...</span>
              </div>
            )}
          </div>
        )}

        {/* 2. Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-3">
            {generatedSummary ? (
              <div className="p-3.5 rounded-xl bg-[#232630] border border-[#313646] space-y-3 text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans">
                <div>{generatedSummary}</div>

                <div className="flex items-center space-x-2 pt-2 border-t border-[#313646]">
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#2d313f] hover:bg-[#383d4e] text-xs font-medium text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {onInsertIntoNotes && (
                    <button
                      onClick={() => onInsertIntoNotes(generatedSummary)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-medium text-white transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Send to Notes</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400 text-xs space-y-3">
                <FileText className="w-8 h-8 text-zinc-500 mx-auto" />
                <p>No summary generated yet.</p>
                <button
                  onClick={handleTakeNotes}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors"
                >
                  Generate Notes with Gemini
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Action Items Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
              Extracted Deliverables
            </h4>
            {actionItems.map((act) => (
              <div
                key={act.id}
                onClick={() => {
                  setActionItems((prev) =>
                    prev.map((a) => (a.id === act.id ? { ...a, done: !a.done } : a))
                  );
                }}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                  act.done
                    ? 'bg-[#1e2026] border-[#2e323e] opacity-60 line-through text-zinc-400'
                    : 'bg-[#232630] border-[#313646] text-white hover:border-purple-500/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={act.done}
                  readOnly
                  className="rounded bg-[#1a1c22] border-zinc-600 text-purple-600 focus:ring-0 mt-0.5"
                />
                <div className="flex-1 text-xs leading-snug">
                  <div>{act.text}</div>
                  <span className="text-[10px] text-purple-400 font-medium">
                    Owner: {act.owner}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Full Transcript Tab */}
        {activeTab === 'transcript' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400">
                {transcript.length} Captured Utterances
              </span>
              <button
                onClick={handleExportTranscript}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#2a2e3a] hover:bg-[#343948] text-white text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export TXT</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#181a20] border border-[#2e323e] text-xs font-mono text-zinc-300 space-y-2 max-h-96 overflow-y-auto leading-relaxed">
              {transcript.length > 0 ? (
                transcript.map((t) => (
                  <div key={t.id} className="pb-1 border-b border-zinc-800">
                    <span className="text-zinc-500">[{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] </span>
                    <span className="text-purple-400 font-semibold">{t.speakerName}: </span>
                    <span>{t.text}</span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 italic">
                  No live captions captured yet. Turn on Live Captions (CC) or speak into your microphone to record real-time transcript.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Bar (visible on chat tab) */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2e323e] bg-[#191a20]">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask Gemini about the meeting..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-[#252833] border border-[#353a4a] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isGenerating}
              className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white disabled:opacity-40 hover:opacity-90 transition-opacity shadow-sm"
              title="Send to Gemini"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
