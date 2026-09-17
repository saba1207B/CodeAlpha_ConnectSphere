import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Sparkles } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { ChatMessage } from '../../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
  socket: Socket | null;
}

const QUICK_PROMPTS = [
  'Sounds fantastic! 👏',
  'Let us inspect the whiteboard 🎨',
  'I will upload the design spec 📄',
  'Can everyone hear me clearly? 🎙️'
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  meetingId,
  currentUserId,
  currentUserName,
  socket
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`connectsphere_chat_${meetingId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'welcome-msg',
        meetingId,
        senderId: 'studio-elena',
        senderName: 'Elena Vance (Lead Architect)',
        text: 'Welcome to ConnectSphere Studio! The real-time encrypted mesh is active. Feel free to collaborate, share documents, or draw on the whiteboard.',
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`connectsphere_chat_${meetingId}`, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages, meetingId]);

  // Dual-Engine Listeners (BroadcastChannel + Socket.io)
  useEffect(() => {
    // 1. BroadcastChannel for serverless cross-tab messaging (GitHub Pages)
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_chat_channel_${meetingId}`);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, message } = event.data;
        if (type === 'chat:new-message' && message && message.senderId !== currentUserId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
      };
    } catch (e) {
      console.warn('Chat BroadcastChannel not available:', e);
    }

    // 2. Global PeerJS Mesh across countries
    const handleGlobalMeshMsg = (e: any) => {
      const msg = e.detail;
      if (msg && msg.senderId !== currentUserId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };
    window.addEventListener('connectsphere:chat-message', handleGlobalMeshMsg);

    // 3. Socket.io for backend communication
    if (socket) {
      const handleNewMessage = (msg: ChatMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      };

      const handleChatHistory = (history: ChatMessage[]) => {
        if (history && history.length > 0) {
          setMessages(history);
        }
      };

      socket.on('chat:message', handleNewMessage);
      socket.on('chat:history', handleChatHistory);
      socket.emit('chat:get-history', { meetingId });

      return () => {
        socket.off('chat:message', handleNewMessage);
        socket.off('chat:history', handleChatHistory);
        window.removeEventListener('connectsphere:chat-message', handleGlobalMeshMsg);
        if (bc) bc.close();
      };
    }

    return () => {
      window.removeEventListener('connectsphere:chat-message', handleGlobalMeshMsg);
      if (bc) bc.close();
    };
  }, [socket, meetingId, currentUserId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      meetingId,
      senderId: currentUserId,
      senderName: currentUserName,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMsg]);

    // Send via Socket.io if connected
    if (socket) {
      socket.emit('chat:message', newMsg);
    }

    // Broadcast across tabs on same device
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'chat:new-message',
        message: newMsg
      });
    }

    // Broadcast across countries via Global PeerJS Mesh
    (window as any).csBroadcastGlobalData?.('chat', newMsg);

    setInputText('');

    // Simulate smart team response after short delay if chatting in studio
    setTimeout(() => {
      const responses = [
        {
          name: 'Amara Chen (Design Director)',
          id: 'studio-amara',
          text: `Agreed! The high-contrast editorial palette and typography align beautifully with the creative vision.`
        },
        {
          name: 'Liam Thorne (Platform Engineer)',
          id: 'studio-liam',
          text: `All WebRTC mesh streams and vector sync channels are functioning with sub-50ms latency.`
        },
        {
          name: 'Elena Vance (Lead Architect)',
          id: 'studio-elena',
          text: `I've prepared the architectural roadmap for review. You can check the shared files drawer or canvas.`
        }
      ];

      const pick = responses[Math.floor(Math.random() * responses.length)];
      const botReply: ChatMessage = {
        id: 'bot-' + Date.now(),
        meetingId,
        senderId: pick.id,
        senderName: pick.name,
        text: pick.text,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botReply]);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'chat:new-message',
          message: botReply
        });
      }
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed sm:absolute top-16 bottom-20 right-0 w-full sm:w-96 z-40 bg-cream/95 backdrop-blur-2xl border-l border-forest/15 shadow-deep flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-forest/15 flex items-center justify-between bg-cream">
        <div className="flex items-center space-x-2 text-forest">
          <MessageSquare className="w-5 h-5 text-forest" />
          <h3 className="font-display text-xl tracking-tight">ROOM DISCUSSION</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-forest/10 text-forest/70 hover:text-forest transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          const timeFormatted = new Date(m.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-forest/60 px-1">
                <span>{m.senderName}</span>
                <span>·</span>
                <span>{timeFormatted}</span>
              </div>
              <div
                className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                  isMe
                    ? 'rounded-t-2xl rounded-bl-2xl bg-forest text-cream shadow-sm'
                    : 'rounded-t-2xl rounded-br-2xl bg-olive/50 text-forest border border-forest/10 shadow-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2 border-t border-forest/10 bg-cream-light flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            className="flex-shrink-0 text-[11px] font-medium px-3 py-1 rounded-full bg-cream border border-forest/20 text-forest hover:bg-forest hover:text-cream transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-forest/15 bg-cream">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Write a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 rounded-full bg-cream-light border border-forest/20 text-forest text-sm placeholder:text-forest/40 focus:outline-none focus:border-forest"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-full bg-forest text-cream disabled:opacity-40 hover:bg-forest-light transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
