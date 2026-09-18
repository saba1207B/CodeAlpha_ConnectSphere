import React, { useState, useEffect } from 'react';
import { X, FileEdit, Download, Copy, Check, Sparkles } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
  socket: Socket | null;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onClose,
  meetingId,
  currentUserId,
  currentUserName,
  socket
}) => {
  const [notesContent, setNotesContent] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`connectsphere_notes_${meetingId}`);
      if (saved) return saved;
    } catch (e) {}
    return `# Meeting Notes - ${new Date().toLocaleDateString()}\n\n## Agenda\n- WebRTC Audio/Video Quality\n- Live Captions & Speech Translation\n- In-Meeting Collaboration\n\n## Key Decisions\n- \n\n## Action Items\n- [ ] `;
  });

  const [copied, setCopied] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`connectsphere_notes_${meetingId}`, notesContent);
    } catch (e) {}
  }, [notesContent, meetingId]);

  // Sync listeners (BroadcastChannel + Socket)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_notes_${meetingId}`);
      bc.onmessage = (e) => {
        if (e.data?.content && e.data.senderId !== currentUserId) {
          setNotesContent(e.data.content);
        }
      };
    } catch (e) {}

    if (socket) {
      const handleRemoteNotes = (data: { content: string; senderId: string }) => {
        if (data.senderId !== currentUserId) {
          setNotesContent(data.content);
        }
      };
      socket.on('meeting:notes-update', handleRemoteNotes);

      return () => {
        socket.off('meeting:notes-update', handleRemoteNotes);
        if (bc) bc.close();
      };
    }

    return () => {
      if (bc) bc.close();
    };
  }, [meetingId, currentUserId, socket]);

  const handleContentChange = (newText: string) => {
    setNotesContent(newText);

    socket?.emit('meeting:notes-update', { meetingId, content: newText, senderId: currentUserId });
    try {
      const bc = new BroadcastChannel(`connectsphere_notes_${meetingId}`);
      bc.postMessage({ content: newText, senderId: currentUserId });
      bc.close();
    } catch (e) {}
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notesContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadNotes = () => {
    const blob = new Blob([notesContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MeetingNotes-${meetingId}-${new Date().toISOString().substring(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full h-full bg-[#1e2026] border-l border-[#2e323e] flex flex-col select-none text-zinc-200 shadow-xl">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#2e323e] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileEdit className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-sm text-white">Collaborative Notes</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopyNotes}
            className="p-1.5 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownloadNotes}
            className="p-1.5 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
            title="Download as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-3 flex flex-col min-h-0">
        <textarea
          value={notesContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Type live collaborative meeting notes here..."
          className="flex-1 w-full p-3 rounded-xl bg-[#181a20] border border-[#2e323e] text-zinc-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:border-emerald-500 shadow-inner"
        />
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#2e323e] bg-[#1a1c22] flex items-center justify-between text-[11px] text-zinc-400">
        <span>Synced across all participants</span>
        <span className="text-emerald-400 font-medium">Auto-saved</span>
      </div>
    </div>
  );
};
